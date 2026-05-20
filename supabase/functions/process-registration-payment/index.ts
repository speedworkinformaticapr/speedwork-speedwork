import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@^14.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const {
      tenant_id = '00000000-0000-0000-0000-000000000001',
      entity_type,
      entity_id,
      valor,
      metodo_pagamento = 'card',
    } = await req.json()

    // Limite de tentativas: máximo de 5 tentativas por hora para a mesma entidade
    if (entity_id) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { count: attemptCount } = await supabase
        .from('registration_payments')
        .select('id', { count: 'exact', head: true })
        .eq('entity_type', entity_type)
        .eq('entity_id', entity_id)
        .gte('created_at', oneHourAgo)

      if (attemptCount !== null && attemptCount >= 5) {
        return new Response(
          JSON.stringify({
            status: 'error',
            error:
              'Limite de 5 tentativas excedido. Você tentou gerar o pagamento muitas vezes recentemente. Aguarde alguns minutos e tente novamente.',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      }
    }

    const { data: systemData, error: sysError } = await supabase
      .from('system_data')
      .select('integrations')
      .limit(1)
      .maybeSingle()

    const integrations = systemData?.integrations || {}
    const gateway = integrations.active_payment_gateway || 'stripe'
    const env = integrations.payment_environment || 'sandbox'

    let paymentIntentId = ''
    let clientSecret = ''
    let pixQrCode = ''
    let pixCopyPaste = ''

    if (gateway === 'stripe') {
      const stripeSecretKey = integrations.stripe_secret_key
      if (!stripeSecretKey)
        throw new Error(
          'Stripe Secret Key não configurada no sistema. Ajuste na tela Dados do Sistema.',
        )

      const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' })
      const amountInCents = Math.round(valor * 100)

      if (metodo_pagamento === 'card') {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'brl',
          payment_method_types: ['card'],
          metadata: { tenant_id, entity_type, entity_id, type: 'registration' },
        })
        paymentIntentId = paymentIntent.id
        clientSecret = paymentIntent.client_secret || ''
      } else if (metodo_pagamento === 'pix') {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'brl',
          payment_method_types: ['pix'],
          metadata: { tenant_id, entity_type, entity_id, type: 'registration' },
        })

        const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method_data: { type: 'pix' },
        })

        paymentIntentId = confirmed.id
        clientSecret = confirmed.client_secret || ''
        const pixDetails = confirmed.next_action?.pix_display_details
        pixQrCode = pixDetails?.image_url_png || ''
        pixCopyPaste = pixDetails?.pix_string || ''
      }
    } else if (gateway === 'asaas') {
      const asaasApiKey =
        env === 'production' ? integrations.asaas_production_key : integrations.asaas_sandbox_key
      if (!asaasApiKey)
        throw new Error(
          'Asaas API Key não configurada no sistema. Ajuste na tela Dados do Sistema.',
        )

      const asaasUrl =
        env === 'production' ? 'https://api.asaas.com/v3' : 'https://sandbox.asaas.com/api/v3'

      let name = 'Cliente Não Identificado'
      let document = '00000000000'
      let email = 'cliente@naoinformado.com'

      if (entity_type === 'athlete') {
        const { data } = await supabase
          .from('athletes')
          .select('name, cpf, email')
          .eq('id', entity_id)
          .maybeSingle()
        if (data) {
          name = data.name || name
          document = data.cpf ? data.cpf.replace(/\D/g, '') : document
          email = data.email || email
        }
      } else {
        const { data } = await supabase
          .from('clubs')
          .select('name, cnpj, email')
          .eq('id', entity_id)
          .maybeSingle()
        if (data) {
          name = data.name || name
          document = data.cnpj ? data.cnpj.replace(/\D/g, '') : document
          email = data.email || email
        }
      }

      // Cria ou recupera o cliente no Asaas
      const customerRes = await fetch(`${asaasUrl}/customers`, {
        method: 'POST',
        headers: { access_token: asaasApiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, cpfCnpj: document, email }),
      })

      const customer = await customerRes.json()
      if (!customerRes.ok)
        throw new Error(customer.errors?.[0]?.description || 'Erro ao processar cliente no Asaas')

      const customerId = customer.id

      if (metodo_pagamento === 'pix') {
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 1)

        const paymentRes = await fetch(`${asaasUrl}/payments`, {
          method: 'POST',
          headers: { access_token: asaasApiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: customerId,
            billingType: 'PIX',
            value: valor,
            dueDate: dueDate.toISOString().split('T')[0],
            description: `Taxa de Inscrição - ${entity_type}`,
            externalReference: entity_id,
          }),
        })
        const payment = await paymentRes.json()
        if (!paymentRes.ok)
          throw new Error(payment.errors?.[0]?.description || 'Erro ao gerar cobrança Pix no Asaas')

        paymentIntentId = payment.id

        const qrCodeRes = await fetch(`${asaasUrl}/payments/${payment.id}/pixQrCode`, {
          headers: { access_token: asaasApiKey },
        })
        const qrCode = await qrCodeRes.json()
        if (!qrCodeRes.ok)
          throw new Error(qrCode.errors?.[0]?.description || 'Erro ao obter QR Code do Asaas')

        pixQrCode = `data:image/png;base64,${qrCode.encodedImage}`
        pixCopyPaste = qrCode.payload
      } else if (metodo_pagamento === 'card') {
        paymentIntentId = `sim_asaas_${Date.now()}`
      }
    }

    const { error: insertError } = await supabase.from('registration_payments').insert({
      tenant_id,
      payment_intent_id: paymentIntentId,
      entity_type,
      entity_id,
      valor,
      status: 'pending',
      metodo_pagamento,
    })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({
        status: 'success',
        payment_intent_id: paymentIntentId,
        client_secret: clientSecret,
        pix_qr_code: pixQrCode,
        pix_copy_paste: pixCopyPaste,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Payment processing error:', error)
    return new Response(JSON.stringify({ status: 'error', error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
