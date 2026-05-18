import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const bodyText = await req.text()
    if (!bodyText) return new Response('Empty body', { status: 400 })
    const event = JSON.parse(bodyText)

    if (event.event === 'PAYMENT_RECEIVED' || event.event === 'PAYMENT_CONFIRMED') {
      const paymentId = event.payment?.id
      if (!paymentId) return new Response('No payment ID', { status: 400 })

      const now = new Date().toISOString()

      const { data: regPayment } = await supabase
        .from('registration_payments')
        .update({ status: 'succeeded', data_pagamento: now })
        .eq('payment_intent_id', paymentId)
        .select()
        .maybeSingle()

      if (regPayment) {
        const entityType = regPayment.entity_type
        const entityId = regPayment.entity_id

        if (entityType === 'athlete') {
          await supabase.from('profiles').update({ status: 'active' }).eq('id', entityId)
          await supabase
            .from('athletes')
            .update({ status: 'active' })
            .eq('id', entityId)
            .or(`user_id.eq.${entityId}`)
          await supabase
            .from('financial_charges')
            .update({ status: 'pago', payment_date: now.split('T')[0] })
            .eq('athlete_id', entityId)
            .eq('category', 'filiação')
            .eq('status', 'pendente')
        } else if (entityType === 'club') {
          await supabase
            .from('profiles')
            .update({ status: 'active', affiliation_status: 'active' })
            .eq('id', entityId)
          await supabase
            .from('clubs')
            .update({ status: 'active', affiliation_status: 'active' })
            .eq('id', entityId)
          await supabase
            .from('financial_charges')
            .update({ status: 'pago', payment_date: now.split('T')[0] })
            .eq('club_id', entityId)
            .eq('category', 'filiação')
            .eq('status', 'pendente')
        }
      } else {
        const { data: stripePayment } = await supabase
          .from('stripe_payments')
          .update({ status: 'succeeded', data_pagamento: now })
          .eq('payment_intent_id', paymentId)
          .select()
          .maybeSingle()

        if (stripePayment?.charge_id) {
          await supabase
            .from('financial_charges')
            .update({
              status: 'pago',
              payment_date: now.split('T')[0],
            })
            .eq('id', stripePayment.charge_id)
        }
      }
    } else if (
      event.event === 'PAYMENT_DELETED' ||
      event.event === 'PAYMENT_REFUNDED' ||
      event.event === 'PAYMENT_FAILED'
    ) {
      const paymentId = event.payment?.id
      if (paymentId) {
        await supabase
          .from('registration_payments')
          .update({ status: 'failed' })
          .eq('payment_intent_id', paymentId)
        await supabase
          .from('stripe_payments')
          .update({ status: 'failed' })
          .eq('payment_intent_id', paymentId)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
