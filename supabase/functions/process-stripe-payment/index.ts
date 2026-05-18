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
      atleta_id,
      charge_id,
      valor,
      metodo_pagamento,
    } = await req.json()

    if (charge_id) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { count: attemptCount } = await supabase
        .from('stripe_payments')
        .select('id', { count: 'exact', head: true })
        .eq('charge_id', charge_id)
        .gte('data_criacao', oneHourAgo)

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

    const { data: systemData } = await supabase
      .from('system_data')
      .select('integrations')
      .limit(1)
      .maybeSingle()

    const integrations = systemData?.integrations || {}
    const gateway = integrations.active_payment_gateway || 'stripe'
    const env = integrations.payment_environment || 'sandbox'

    const { data: config } = await supabase
      .from('stripe_config')
      .select('*')
      .eq('tenant_id', tenant_id)
      .single()

    let paymentIntentId = ''
    let clientSecret = ''
    let pixQrCode = ''
    let pixCopyPaste = ''

    let finalValor = valor
    if (config?.pass_fees_to_customer) {
      const percentageFee = config.card_fee_percentage || 0
      const fixedFee = config.card_fee_fixed || 0
      if (metodo_pagamento === 'card') {
        finalValor = valor * (1 + percentageFee / 100) + fixedFee
      }
    }

    if (gateway === 'stripe') {
      if (!config || !config.secret_key) {
        throw new Error('Configuração do Stripe não encontrada ou inválida.')
      }

      const stripe = new Stripe(config.secret_key, { apiVersion: '2023-10-16' })
      const amountInCents = Math.round(finalValor * 100)

      if (metodo_pagamento === 'card') {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'brl',
          payment_method_types: ['card'],
          metadata: { tenant_id, atleta_id, charge_id, original_amount: valor },
        })
        paymentIntentId = paymentIntent.id
        clientSecret = paymentIntent.client_secret || ''
      } else if (metodo_pagamento === 'pix') {
        if (!config.pix_enabled)
          throw new Error('Pagamento via Pix não está ativado nas configurações.')

        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'brl',
          payment_method_types: ['pix'],
          metadata: { tenant_id, atleta_id, charge_id },
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
      const asaasApiKey = integrations.asaas_api_key
      if (!asaasApiKey) throw new Error('Asaas API Key não configurada no sistema.')

      const asaasUrl =
        env === 'production' ? 'https://api.asaas.com/v3' : 'https://sandbox.asaas.com/api/v3'

      let name = 'Cliente Não Identificado'
      let document = '00000000000'
      let email = 'cliente@naoinformado.com'

      if (atleta_id) {
        const { data } = await supabase
          .from('profiles')
          .select('name, cpf_cnpj, email')
          .eq('id', atleta_id)
          .maybeSingle()
        if (data) {
          name = data.name || name
          document = data.cpf_cnpj ? data.cpf_cnpj.replace(/\D/g, '') : document
          email = data.email || email
        }
      } else if (charge_id) {
        const { data } = await supabase
          .from('financial_charges')
          .select('client_name')
          .eq('id', charge_id)
          .maybeSingle()
        if (data) {
          name = data.client_name || name
        }
      }

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
            value: finalValor,
            dueDate: dueDate.toISOString().split('T')[0],
            description: `Fatura ${charge_id}`,
            externalReference: charge_id,
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

    const { error: insertError } = await supabase.from('stripe_payments').insert({
      tenant_id,
      payment_intent_id: paymentIntentId,
      atleta_id,
      charge_id,
      valor: finalValor,
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
