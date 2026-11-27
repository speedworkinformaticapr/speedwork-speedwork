import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import {
  autentiqueGraphQL,
  extractEventId,
  isDocumentFinished,
  SIGNATURE_SIGNED_TYPES,
} from '../_shared/autentique.ts'
import {
  gerarMensalidadesContrato,
  type ContratoFinanceiroInput,
} from '../_shared/contract-financeiro.ts'

/**
 * autentique-webhook
 * Rota pública. Autentica pelo header x-webhook-secret comparado com
 * autentique_webhook_secret em system_data.integrations.
 * Dedup por event_id em autentique_events. Em cada assinatura atualiza
 * contract_signers; em DOCUMENT_FINISHED do contrato principal:
 *  1. baixa o PDF final e arquiva no bucket 'contratos';
 *  2. status ASSINADO + signed_at + signed_pdf_url;
 *  3. gera as mensalidades (financial_charges + financial_master_records) —
 *     falha deixa o contrato em ASSINADO com log do erro;
 *  4. com as parcelas gravadas, status FINANCEIRO.
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const bodyText = await req.text()
    const payload = JSON.parse(bodyText || '{}')

    // 1) Autenticação por token compartilhado (falha fechada)
    const { data: sys } = await supabaseAdmin
      .from('system_data')
      .select('integrations')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()
    const expected = (sys?.integrations as Record<string, string> | null)?.autentique_webhook_secret
    if (!expected) {
      return json(401, { error: 'Webhook secret não configurado' })
    }
    const provided =
      req.headers.get('x-webhook-secret') || new URL(req.url).searchParams.get('secret') || ''
    if (provided !== expected) {
      console.warn('autentique-webhook: secret inválido')
      return json(401, { error: 'Webhook secret inválido' })
    }

    // 2) Dedup por event_id em autentique_events
    const eventType: string =
      payload?.event_type || payload?.eventType || payload?.event || payload?.type || ''
    const eventId = extractEventId(payload)
    if (eventId) {
      const { data: existing } = await supabaseAdmin
        .from('autentique_events')
        .select('id')
        .eq('event_id', String(eventId))
        .maybeSingle()
      if (existing) return json(200, { ok: true, dedup: true })
    }

    // 3) Localiza o documento pelo publicId — pode ser o contrato principal
    //    (contract_signers/contratos) ou um termo (contract_cancel_documents).
    const docPublicId =
      payload?.document?.publicId ||
      payload?.document?.public_id ||
      payload?.publicId ||
      payload?.document_id ||
      null
    let contractId: string | null = null
    let documentType = 'contrato'
    let documentName: string | null = null
    if (docPublicId) {
      const { data: signer } = await supabaseAdmin
        .from('contract_signers')
        .select('contract_id')
        .eq('autentique_public_id', String(docPublicId))
        .limit(1)
        .maybeSingle()
      if (signer) {
        contractId = signer.contract_id || null
      } else {
        const { data: cancelDoc } = await supabaseAdmin
          .from('contract_cancel_documents')
          .select('contract_id, document_type')
          .eq('autentique_public_id', String(docPublicId))
          .limit(1)
          .maybeSingle()
        if (cancelDoc) {
          contractId = cancelDoc.contract_id
          documentType = cancelDoc.document_type
        }
      }
      documentName =
        (payload?.document?.name as string | undefined) ||
        payload?.document_name ||
        payload?.name ||
        null
    }

    // 4) Registra o evento (histórico + dedup), distinguindo o tipo de documento
    await supabaseAdmin.from('autentique_events').insert({
      event_id: eventId ? String(eventId) : null,
      event_type: eventType || 'UNKNOWN',
      contract_id: contractId,
      document_type: documentType,
      document_name: documentName,
      status: isDocumentFinished(eventType)
        ? 'concluido'
        : SIGNATURE_SIGNED_TYPES.includes(eventType)
          ? 'assinado'
          : null,
      payload: payload as any,
    })

    if (!docPublicId) return json(200, { ok: true, ignored: 'sem document.publicId' })

    // 5) Assinatura individual: marca o signatário (somente no documento do contrato)
    if (SIGNATURE_SIGNED_TYPES.includes(eventType)) {
      const signPublicId =
        payload?.signature?.publicId ||
        payload?.signature?.public_id ||
        payload?.signature_id ||
        null
      if (documentType !== 'contrato') {
        // Termo de cancelamento/responsabilidade: apenas atualiza o status local.
        await supabaseAdmin
          .from('contract_cancel_documents')
          .update({ status: 'assinado' })
          .eq('autentique_public_id', String(docPublicId))
        return json(200, { ok: true, handled: `assinatura registrada (${documentType})` })
      }
      const patch: Record<string, unknown> = { status: 'Assinado', signed_at: new Date() }
      let query = supabaseAdmin.from('contract_signers').update(patch)
      query = signPublicId
        ? query.eq('autentique_signature_id', String(signPublicId))
        : query.eq('autentique_public_id', String(docPublicId))
      const { error: upErr } = await query
      if (upErr) console.error('autentique-webhook signers:', upErr.message)
      return json(200, { ok: true, handled: 'assinatura registrada' })
    }

    // 6) DOCUMENT_FINISHED: arquiva o PDF assinado. No contrato principal, roda o
    //    fluxo ASSINADO → mensalidades → FINANCEIRO; nos termos, marca concluído.
    if (isDocumentFinished(eventType)) {
      if (!contractId) return json(200, { ok: true, ignored: 'contrato não localizado' })

      if (documentType !== 'contrato') {
        const { error: termErr } = await supabaseAdmin
          .from('contract_cancel_documents')
          .update({ status: 'concluido' })
          .eq('autentique_public_id', String(docPublicId))
        if (termErr) console.error('autentique-webhook termo:', termErr.message)
        console.log(`autentique-webhook: termo ${documentType} concluído (contrato ${contractId})`)
        return json(200, { ok: true, handled: `DOCUMENT_FINISHED (${documentType})` })
      }

      const apiKey = Deno.env.get('AUTENTIQUE_API_KEY')
      if (!apiKey) return json(200, { ok: true, warning: 'sem AUTENTIQUE_API_KEY' })

      const pdfUrl = await downloadFinishedPdf(apiKey, String(docPublicId))
      if (!pdfUrl) return json(200, { ok: true, warning: 'PDF indisponível na Autentique' })

      const res = await fetch(pdfUrl)
      if (!res.ok) throw new Error(`Falha ao baixar PDF (${res.status})`)
      const bytes = new Uint8Array(await res.arrayBuffer())

      const path = `assinados/${contractId}-${Date.now()}.pdf`
      const { error: upErr } = await supabaseAdmin.storage
        .from('contratos')
        .upload(path, bytes, { contentType: 'application/pdf', upsert: false })
      if (upErr) throw upErr

      // Etapa 4 do fluxo: ASSINADO com PDF e data de assinatura.
      const { error: cErr } = await supabaseAdmin
        .from('contratos')
        .update({ status: 'ASSINADO', signed_at: new Date(), signed_pdf_url: path })
        .eq('id', contractId)
      if (cErr) throw cErr
      console.log(`autentique-webhook: contrato ${contractId} ASSINADO, PDF ${path}`)

      // Etapa 5: gera as mensalidades (previsão de fluxo de caixa) e vira FINANCEIRO.
      // Falha deixa o contrato em ASSINADO com log do erro — nunca silenciosamente.
      try {
        const { data: contratoRow, error: cFetchErr } = await supabaseAdmin
          .from('contratos')
          .select(
            'id, numero_contrato, cliente_id, valor_ciclo, duracao_ciclo, data_inicio, conta_id, cliente:profiles(name)',
          )
          .eq('id', contractId)
          .single()
        if (cFetchErr || !contratoRow) {
          throw new Error(
            `Contrato não localizado ao gerar mensalidades: ${cFetchErr?.message || 'linha ausente'}`,
          )
        }
        const contratoFinanceiro: ContratoFinanceiroInput = {
          id: contratoRow.id,
          numero_contrato: contratoRow.numero_contrato,
          cliente_id: contratoRow.cliente_id,
          clienteNome: contratoRow.cliente?.name ?? null,
          valor_ciclo: contratoRow.valor_ciclo,
          duracao_ciclo: contratoRow.duracao_ciclo,
          data_inicio: contratoRow.data_inicio,
          conta_id: contratoRow.conta_id,
        }
        const resultado = await gerarMensalidadesContrato(supabaseAdmin, contratoFinanceiro)
        if (!resultado.ok) throw new Error(resultado.message || 'Falha ao gerar mensalidades')
        const { error: fErr } = await supabaseAdmin
          .from('contratos')
          .update({ status: 'FINANCEIRO' })
          .eq('id', contractId)
        if (fErr) throw fErr
        console.log(`autentique-webhook: contrato ${contractId} FINANCEIRO (mensalidades geradas)`)
      } catch (finErr: any) {
        console.error(
          `autentique-webhook: falha ao gerar mensalidades do contrato ${contractId}:`,
          finErr?.message,
        )
      }

      return json(200, { ok: true, handled: 'DOCUMENT_FINISHED' })
    }

    return json(200, { ok: true, ignored: eventType || 'evento não tratado' })
  } catch (error: any) {
    console.error('autentique-webhook:', error?.message)
    return json(500, { error: error?.message || 'Erro interno' })
  }
})

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/** URL do PDF assinado (Autentique expõe em document.pdf / signatures[].link.pdf). */
async function downloadFinishedPdf(apiKey: string, docPublicId: string): Promise<string | null> {
  const res = await autentiqueGraphQL<{
    data?: { document?: { pdf?: string | null; signatures?: { link?: { pdf?: string } }[] } }
    errors?: { message: string }[]
  }>(
    apiKey,
    `query ($publicId: ID!) {
      document(publicId: $publicId) {
        pdf
        signatures { link { pdf } }
      }
    }`,
    { publicId: docPublicId },
  )
  if (res.errors?.length) {
    console.error('autentique-webhook query PDF:', res.errors[0]?.message)
    return null
  }
  return res.data?.document?.pdf || res.data?.document?.signatures?.[0]?.link?.pdf || null
}
