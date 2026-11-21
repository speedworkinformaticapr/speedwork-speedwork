import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { requireAdmin } from '../_shared/auth.ts'
import {
  autentiqueGraphQL,
  findSignerByDocument,
  cleanDoc,
  type AutentiqueSignerInput,
  type AutentiqueMutationResult,
} from '../_shared/autentique.ts'

/**
 * autentique-create-document
 * POST { contract_id, document_type? ('contrato'|'cancelamento'|'termo_responsabilidade'), content? }
 * Cria o documento na Autentique com signatários na ordem de
 * contract_signers.order_index (CONTRATADA primeiro → CONTRATANTE depois).
 * Grava autentique_public_id/autentique_signature_id/signature_url nos
 * signatários; no documento principal grava status 'em assinatura' no contrato.
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const admin = await requireAdmin(req)
    if (admin.response) return admin.response

    const apiKey = Deno.env.get('AUTENTIQUE_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'AUTENTIQUE_API_KEY não configurada no backend' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const body = await req.json().catch(() => ({}))
    const contractId: string | undefined = body?.contract_id
    const documentType: string = body?.document_type || 'contrato'
    const contentHtml: string | undefined = body?.content
    if (!contractId) throw new Error('Parâmetro contract_id é obrigatório')

    // Contrato + cliente (CONTRATANTE)
    const { data: contrato, error: cErr } = await supabaseAdmin
      .from('contratos')
      .select('*, profiles:cliente_id(name, cpf_cnpj)')
      .eq('id', contractId)
      .single()
    if (cErr || !contrato) throw new Error('Contrato não encontrado: ' + (cErr?.message || ''))

    // Signatários na ordem definida (CONTRATADA = 1, CONTRATANTE = 2)
    let { data: signers, error: sErr } = await supabaseAdmin
      .from('contract_signers')
      .select('*, profiles(name, cpf_cnpj)')
      .eq('contract_id', contractId)
      .order('order_index', { ascending: true })
    if (sErr) throw sErr
    if (!signers || signers.length === 0) {
      // fallback: cria os signatários padrão (CONTRATADA 1 = empresa, CONTRATANTE 2 = cliente)
      const clienteId = (contrato as { cliente_id?: string }).cliente_id
      const inserts = [
        { contract_id: contractId, role: 'CONTRATADA', order_index: 1, status: 'Pendente' },
        {
          contract_id: contractId,
          role: 'CONTRATANTE',
          order_index: 2,
          status: 'Pendente',
          ...(clienteId ? { profile_id: clienteId } : {}),
        },
      ]
      const ins = await supabaseAdmin.from('contract_signers').insert(inserts)
      if (ins.error) throw ins.error
      const reread = await supabaseAdmin
        .from('contract_signers')
        .select('*, profiles(name, cpf_cnpj)')
        .eq('contract_id', contractId)
        .order('order_index', { ascending: true })
      signers = reread.data
    }

    // Dados do sistema (razão social/CNPJ da CONTRATADA, padrão da integração)
    const { data: sys } = await supabaseAdmin
      .from('system_data')
      .select('razao_social, cnpj, platform_name, integrations')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()
    const sysRow = (sys || {}) as Record<string, unknown>
    const integrations = (sysRow.integrations || {}) as Record<string, string>
    const empresaNome =
      (integrations.autentique_signer_name as string) ||
      (sysRow.razao_social as string) ||
      (sysRow.platform_name as string) ||
      'Speedwork'
    const empresaDoc =
      (integrations.autentique_signer_cpf_cnpj as string) || (sysRow.cnpj as string) || ''

    // Conteúdo do documento
    let pdfBase64: string
    let docName: string
    if (contentHtml) {
      pdfBase64 = htmlToBase64(wrapHtml(contentHtml, contrato.numero_contrato))
      docName =
        documentType === 'cancelamento'
          ? `Termo de Cancelamento — ${contrato.numero_contrato}`
          : `Termo de Responsabilidade — ${contrato.numero_contrato}`
    } else {
      pdfBase64 = htmlToBase64(
        wrapHtml(
          contrato.content || `<p>Contrato ${contrato.numero_contrato}</p>`,
          contrato.numero_contrato,
          contrato.profiles?.name || '',
        ),
      )
      docName = `Contrato ${contrato.numero_contrato}`
    }

    // Signatários na ordem de contract_signers.order_index
    const signersInput: AutentiqueSignerInput[] = []
    const signerRowIds: string[] = []
    for (const s of signers) {
      const isEmpresa = s.order_index === 1 && /contratada/i.test(s.role || '')
      const name = isEmpresa ? empresaNome : (s.profiles?.name ?? null)
      const doc = isEmpresa ? empresaDoc : (s.profiles?.cpf_cnpj ?? null)
      const existing = doc ? await findSignerByDocument(apiKey, doc) : null

      const signer: AutentiqueSignerInput = existing
        ? { id: existing.id }
        : {
            action: 'SIGN',
            name: name || `Signatário ${s.order_index}`,
            ...(doc ? { docs: [{ number: cleanDoc(doc) }] } : {}),
          }
      signersInput.push(signer)
      signerRowIds.push(s.id)
    }

    // Cria o documento na Autentique
    const result = await autentiqueGraphQL(
      apiKey,
      `
      mutation ($document: DocumentInput!) {
        createDocument(document: $document) {
          id
          publicId
          name
          signatures { publicId status link { shortLink } }
        }
      }
    `,
      {
        document: {
          name: docName,
          folderPath: 'Contratos SGC4WEB',
          signers: signersInput,
          file: { pdf: { content: pdfBase64 } },
        },
      },
    )

    const created = (result as AutentiqueMutationResult).data?.createDocument
    if (!created?.id) {
      throw new Error(
        (result as AutentiqueMutationResult).errors?.[0]?.message ||
          'Falha ao criar documento na Autentique',
      )
    }

    // Grava IDs/URLs de assinatura nos signatários, na mesma ordem do envio
    const signatures = created.signatures || []
    for (let i = 0; i < signerRowIds.length; i++) {
      const sig = signatures[i] || {}
      await supabaseAdmin
        .from('contract_signers')
        .update({
          autentique_public_id: created.publicId,
          autentique_signature_id: sig.publicId || null,
          signature_url: sig.link?.shortLink || null,
          status: 'Pendente',
        })
        .eq('id', signerRowIds[i])
    }

    // Status do contrato: só no documento principal
    if (documentType === 'contrato') {
      await supabaseAdmin.from('contratos').update({ status: 'em assinatura' }).eq('id', contractId)
    }

    return new Response(JSON.stringify({ ok: true, public_id: created.publicId, name: docName }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('autentique-create-document:', error?.message)
    return new Response(JSON.stringify({ error: error?.message || 'Erro interno' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function htmlToBase64(html: string): string {
  return btoa(unescape(encodeURIComponent(html)))
}

function wrapHtml(content: string, numero: string, clienteNome?: string): string {
  const assinatura = clienteNome
    ? `<div style="margin-top:48px"><p>${clienteNome} — CONTRATADA</p></div>`
    : ''
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
    <title>${numero || 'Documento'}</title>
    <style>body{font-family:Georgia,serif;font-size:12pt;line-height:1.6;color:#111;padding:40px}
    h1,h2,h3{font-family:Arial,sans-serif}</style>
    </head><body>${content}${assinatura}</body></html>`
}
