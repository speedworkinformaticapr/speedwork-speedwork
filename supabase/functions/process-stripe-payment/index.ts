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

    // Limite de tentativas: máximo de 5 tentativas por hora para a mesma entidade
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

    const { data: config, error: configError } = await supabase
      .from('stripe_config')
      .select('*')
      .eq('tenant_id', tenant_id)
      .single()

    if (configError || !config || !config.secret_key) {
      throw new Error(
        'Configuração do Stripe não encontrada ou inválida. Configure as chaves no painel.',
      )
    }

    const stripe = new Stripe(config.secret_key, { apiVersion: '2023-10-16' })

    let paymentIntentId = ''
    let clientSecret = ''
    let pixQrCode = ''
    let pixCopyPaste = ''

    let finalValor = valor
    if (metodo_pagamento === 'card' && config.pass_fees_to_customer) {
      const percentageFee = config.card_fee_percentage || 0
      const fixedFee = config.card_fee_fixed || 0
      finalValor = valor * (1 + percentageFee / 100) + fixedFee
    }

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
    console.error('Stripe payment processing error:', error)
    let errorMessage = error.message
    if (errorMessage?.includes('The payment method type "pix" is invalid')) {
      errorMessage =
        'O método de pagamento Pix não está ativado na sua conta Stripe. Por favor, acesse o painel do Stripe em Configurações > Métodos de Pagamento e ative o Pix.'
    }
    return new Response(JSON.stringify({ status: 'error', error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
