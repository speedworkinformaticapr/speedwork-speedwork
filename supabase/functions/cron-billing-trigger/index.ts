import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // NOTE: This endpoint should be triggered by a pg_cron job or a scheduled webhook daily.
  // It iterates over active configurations and invokes the billing generation logic.

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch active configurations
    const { data: configs, error: configError } = await supabaseAdmin
      .from('billing_configuration')
      .select('tenant_id')
      .eq('auto_generate_enabled', true)

    if (configError) throw configError

    if (!configs || configs.length === 0) {
      return new Response(JSON.stringify({ message: 'No active configurations found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const results = []

    // 2. Loop and trigger generation for each tenant
    for (const config of configs) {
      try {
        const { data, error } = await supabaseAdmin.functions.invoke(
          'generate-affiliation-billing',
          {
            body: { tenant_id: config.tenant_id, manual: false },
          },
        )

        if (error) throw error
        results.push({ tenant_id: config.tenant_id, status: 'invoked', data })
      } catch (err: any) {
        console.error(`Failed to invoke generation for tenant ${config.tenant_id}:`, err)
        results.push({ tenant_id: config.tenant_id, status: 'error', error: err.message })
      }
    }

    return new Response(JSON.stringify({ success: true, processed: configs.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Cron trigger error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
