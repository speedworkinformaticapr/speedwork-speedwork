import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

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
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch configs with reminders enabled
    const { data: configs, error: configError } = await supabaseAdmin
      .from('billing_configuration')
      .select('*')
      .eq('reminders_enabled', true)

    if (configError) throw configError

    let processed = 0
    const results = []

    for (const config of configs || []) {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      // Target Dates
      const targetBeforeDate = new Date(today)
      targetBeforeDate.setDate(today.getDate() + (config.reminder_days_before || 3))
      const targetBeforeStr = targetBeforeDate.toISOString().split('T')[0]

      const targetAfterDate = new Date(today)
      targetAfterDate.setDate(today.getDate() - (config.reminder_days_after || 5))
      const targetAfterStr = targetAfterDate.toISOString().split('T')[0]

      // Find pending charges matching these dates
      const { data: charges, error: chargesError } = await supabaseAdmin
        .from('financial_charges')
        .select(`
          id, due_date, amount, description, athlete_id,
          profiles!financial_charges_athlete_id_fkey ( id, name, email )
        `)
        .in('status', ['pendente', 'aberto', 'atrasado'])
        .or(`due_date.eq.${targetBeforeStr},due_date.eq.${targetAfterStr}`)

      if (chargesError) {
        console.error('Error fetching charges:', chargesError)
        continue
      }

      for (const charge of charges || []) {
        if (!charge.profiles?.email) continue // No email to send

        const isOverdue = charge.due_date === targetAfterStr
        const reminderType = isOverdue ? 'overdue' : 'before_due'

        // Check if already sent today
        const { data: existingLog } = await supabaseAdmin
          .from('billing_reminders_log')
          .select('id')
          .eq('charge_id', charge.id)
          .eq('reminder_type', reminderType)
          .gte('sent_at', `${todayStr}T00:00:00Z`)
          .lte('sent_at', `${todayStr}T23:59:59Z`)
          .limit(1)

        if (existingLog && existingLog.length > 0) continue

        const templateType = isOverdue ? 'billing_overdue' : 'billing_reminder'

        try {
          await supabaseAdmin.functions.invoke('send-email', {
            body: {
              type: templateType,
              email: charge.profiles.email,
              name: charge.profiles.name,
              chargeDetails: {
                description: charge.description,
                due_date: charge.due_date.split('-').reverse().join('/'),
                amount: charge.amount.toFixed(2).replace('.', ','),
              },
            },
          })

          await supabaseAdmin.from('billing_reminders_log').insert({
            charge_id: charge.id,
            athlete_id: charge.athlete_id,
            reminder_type: reminderType,
          })

          processed++
        } catch (err) {
          console.error('Failed to send reminder for charge:', charge.id, err)
        }
      }
      results.push({ tenant_id: config.tenant_id, processed })
    }

    return new Response(JSON.stringify({ success: true, total_processed: processed, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Reminder trigger error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
