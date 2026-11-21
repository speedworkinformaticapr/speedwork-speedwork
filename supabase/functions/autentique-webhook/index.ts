import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import {
  autentiqueGraphQL,
  extractEventId,
  isDocumentFinished,
  SIGNATURE_SIGNED_TYPES,
} from '../_shared/autentique.ts'

/**
 * autentique-webhook
 * Rota pública. Autentica pelo header x-webhook-secret comparado com
 * autentique_webhook_secret em system_data.integrations.
 * Dedup por event_id em autentique_events. Em cada assinatura atualiza
 * contract_signers; em DOCUMENT_FINISHED baixa o PDF final, arquiva no bucket
 * 'contratos', grava contratos.signed_pdf_url + signed_at e ativa o contrato.
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

    // 3) Localiza o contrato pelo publicId do documento
    const docPublicId =
      payload?.document?.publicId ||
      payload?.document?.public_id ||
      payload?.publicId ||
      payload?.document_id ||
      null
    let contractId: string | null = null
    if (docPublicId) {
      const { data: signer } = await supabaseAdmin
        .from('contract_signers')
        .select('contract_id')
        .eq('autentique_public_id', String(docPublicId))
        .limit(1)
        .maybeSingle()
      contractId = signer?.contract_id || null
    }

    // 4) Registra o evento (histórico + dedup)
    await supabaseAdmin.from('autentique_events').insert({
      event_id: eventId ? String(eventId) : null,
      event_type: eventType || 'UNKNOWN',
      contract_id: contractId,
      payload: payload as any,
    })

    if (!docPublicId) return json(200, { ok: true, ignored: 'sem document.publicId' })

    // 5) Assinatura individual: marca o signatário
    if (SIGNATURE_SIGNED_TYPES.includes(eventType)) {
      const signPublicId =
        payload?.signature?.publicId ||
        payload?.signature?.public_id ||
        payload?.signature_id ||
        null
      const patch: Record<string, unknown> = { status: 'Assinado', signed_at: new Date() }
      let query = supabaseAdmin.from('contract_signers').update(patch)
      query = signPublicId
        ? query.eq('autentique_signature_id', String(signPublicId))
        : query.eq('autentique_public_id', String(docPublicId))
      const { error: upErr } = await query
      if (upErr) console.error('autentique-webhook signers:', upErr.message)
      return json(200, { ok: true, handled: 'assinatura registrada' })
    }

    // 6) DOCUMENT_FINISHED: arquiva o PDF assinado e ativa o contrato
    if (isDocumentFinished(eventType)) {
      if (!contractId) return json(200, { ok: true, ignored: 'contrato não localizado' })

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

      // bucket privado: grava o path interno (acesso futuro via Storage signed URL)
      const { error: cErr } = await supabaseAdmin
        .from('contratos')
        .update({ status: 'ativo', signed_at: new Date(), signed_pdf_url: path })
        .eq('id', contractId)
      if (cErr) throw cErr
      console.log(`autentique-webhook: contrato ${contractId} ativado, PDF ${path}`)
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
