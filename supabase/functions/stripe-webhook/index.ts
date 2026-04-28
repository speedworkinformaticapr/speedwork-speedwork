import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@^14.0.0'

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const tenant_id = '00000000-0000-0000-0000-000000000001'

    const { data: config } = await supabase
      .from('stripe_config')
      .select('webhook_secret')
      .eq('tenant_id', tenant_id)
      .single()

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    let event
    const stripe = new Stripe('', { apiVersion: '2023-10-16' })

    if (config?.webhook_secret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, config.webhook_secret)
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`)
        return new Response('Webhook Error', { status: 400 })
      }
    } else {
      event = JSON.parse(body)
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object

      const { data: payment } = await supabase
        .from('stripe_payments')
        .update({
          status: 'succeeded',
          data_pagamento: new Date().toISOString(),
        })
        .eq('payment_intent_id', paymentIntent.id)
        .select()
        .single()

      if (payment?.charge_id) {
        await supabase
          .from('financial_charges')
          .update({
            status: 'pago',
            payment_date: new Date().toISOString().split('T')[0],
          })
          .eq('id', payment.charge_id)
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object

      await supabase
        .from('stripe_payments')
        .update({ status: 'failed' })
        .eq('payment_intent_id', paymentIntent.id)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
