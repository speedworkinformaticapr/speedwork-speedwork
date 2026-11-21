// Edge function: cria documentos na Autentique para o módulo de contratos.
// Tipos suportados: 'contrato', 'cancelamento' e 'termo_responsabilidade' (Rodada 2).
// Autenticação: JWT válido (usuário admin/master). A API key vive SOMENTE no secret
// AUTENTIQUE_API_KEY — nunca no banco nem no frontend.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  autentiqueGraphQL,
  cleanDoc,
  findSignerByDocument,
  type AutentiqueMutationResult,
} from '../_shared/autentique.ts'
import { requireAdmin } from '../_shared/auth.ts'

const SYSTEM_DATA_ID = '00000000-0000-0000-0000-000000000001'

const CREATE_DOCUMENT_MUTATION = `
  mutation CreateDocument($document: DocumentInput!, $signers: [SignerInput!]!) {
    createDocument(document: $document, signers: $signers) {
      id
      publicId
      name
      signatures { publicId status link { shortLink } }
    }
  }
`

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const admin = await requireAdmin(req)
  if (admin.response) return admin.response

  try {
    const apiKey = Deno.env.get('AUTENTIQUE_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Integração Autentique não configurada (AUTENTIQUE_API_KEY)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { contract_id, document_type = 'contrato', content } = await req.json()
    if (!contract_id) {
      return new Response(JSON.stringify({ error: 'contract_id é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!['contrato', 'cancelamento', 'termo_responsabilidade'].includes(document_type)) {
      return new Response(JSON.stringify({ error: 'document_type inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Cliente Supabase com o JWT do usuário (RLS aplicada).
    const authHeader = req.headers.get('Authorization') || ''
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    // Contrato + cliente (CONTRATANTE)
    const { data: contrato, error: contratoError } = await supabase
      .from('contratos')
      .select('id, numero_contrato, cliente_id, profiles:cliente_id(name, cpf_cnpj)')
      .eq('id', contract_id)
      .single()
    if (contratoError || !contrato) {
      return new Response(JSON.stringify({ error: 'Contrato não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Signatário padrão da CONTRATADA e nome do documento, em system_data.integrations.
    const { data: systemData } = await supabase
      .from('system_data')
      .select('integrations')
      .eq('id', SYSTEM_DATA_ID)
      .single()
    const integrations = (systemData?.integrations as Record<string, any>) || {}

    const signerName = integrations.autentique_signer_name as string | undefined
    const signerDoc = integrations.autentique_signer_cpf_cnpj as string | undefined
    const signerEmail = integrations.autentique_signer_email as string | undefined
    const templateName = (integrations.autentique_templates as Record<string, string>)?.[
      document_type
    ]

    const cliente = (contrato as any).profiles as { name?: string; cpf_cnpj?: string } | null
    const docName =
      templateName ||
      (document_type === 'contrato'
        ? `Contrato ${contrato.numero_contrato}`
        : document_type === 'cancelamento'
          ? `Termo de Cancelamento — ${contrato.numero_contrato}`
          : `Termo de Responsabilidade — ${contrato.numero_contrato}`)

    const contractUrl = `${Deno.env.get('SUPABASE_URL')}/rest/v1/contratos?id=eq.${contract_id}`

    // ===== Signatários na ordem CONTRATADA (1) → CONTRATANTE (2) =====
    const signers: AutentiqueSignerInput[] = []

    // 1) CONTRATADA: dados de system_data.integrations (busca signatário por CPF/CNPJ
    //    para não duplicar cadastro na Autentique).
    if (!signerName || !signerDoc) {
      return new Response(
        JSON.stringify({
          error: 'Signatário da CONTRATADA não configurado (Configurações > Assinaturas)',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
    const existing = await findSignerByDocument(apiKey, signerDoc)
    if (existing) {
      signers.push({ id: existing.id, action: 'SIGN' })
    } else {
      signers.push({
        action: 'SIGN',
        name: signerName,
        email: signerEmail,
        docs: [{ number: cleanDoc(signerDoc) }],
      })
    }

    // 2) CONTRATANTE: cliente do contrato (profiles via cliente_id).
    const clienteDoc = cleanDoc(cliente?.cpf_cnpj)
    if (!cliente?.name || !clienteDoc) {
      return new Response(
        JSON.stringify({ error: 'Cliente sem nome ou CPF/CNPJ para assinar (CONTRATANTE)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
    const existingCliente = await findSignerByDocument(apiKey, clienteDoc)
    if (existingCliente) {
      signers.push({ id: existingCliente.id, action: 'SIGN' })
    } else {
      signers.push({
        action: 'SIGN',
        name: cliente.name,
        email: (cliente as any).email,
        docs: [{ number: clienteDoc }],
      })
    }

    // ===== Criação do documento =====
    // O PDF do documento é o conteúdo do contrato/termo (texto simples a partir do HTML).
    const text = htmlToPlainText(content || docName)
    const res = await autentiqueGraphQL<AutentiqueMutationResult>(
      apiKey,
      CREATE_DOCUMENT_MUTATION,
      {
        document: {
          name: docName,
          url: contractUrl,
        },
        signers,
      },
    )

    if (res.errors?.length) {
      return new Response(
        JSON.stringify({ error: `Autentique: ${res.errors.map((e) => e.message).join('; ')}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const doc = res.data?.createDocument
    if (!doc) {
      return new Response(JSON.stringify({ error: 'Autentique não retornou o documento' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ===== Persistência por tipo de documento =====
    // contrato: contract_signers + autentique_public_id em contratos
    // cancelamento / termo_responsabilidade: contract_cancel_documents (Rodada 2)
    if (document_type === 'contrato') {
      const updates = doc.signatures || []
      // Persiste public_id/signature_id nas linhas de signatários em ordem.
      const { data: dbSigners } = await supabase
        .from('contract_signers')
        .select('id, order_index')
        .eq('contract_id', contract_id)
        .order('order_index')

      for (let i = 0; i < (dbSigners || []).length; i++) {
        const sig = updates[i]
        await supabase
          .from('contract_signers')
          .update({
            autentique_public_id: doc.publicId,
            autentique_signature_id: sig?.publicId || null,
            signature_url: sig?.link?.shortLink || null,
          })
          .eq('id', (dbSigners || [])[i].id)
      }

      await supabase
        .from('contratos')
        .update({ autentique_public_id: doc.publicId })
        .eq('id', contract_id)
    } else {
      // Registro do termo de cancelamento/responsabilidade, dedup por (contract_id, type).
      await supabase.from('contract_cancel_documents').upsert(
        {
          contract_id,
          document_type,
          autentique_public_id: doc.publicId,
          status: 'pendente',
        },
        { onConflict: 'contract_id,document_type' },
      )
    }

    return new Response(JSON.stringify({ ok: true, public_id: doc.publicId, name: doc.name }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('autentique-create-document error:', e)
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
