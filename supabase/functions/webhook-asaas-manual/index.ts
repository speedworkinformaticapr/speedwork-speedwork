import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { asaas_id } = await req.json()
    if (!asaas_id) throw new Error('asaas_id is required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: sysData } = await supabase.from('system_data').select('integrations').single()
    const integrations = (sysData?.integrations as any) || {}
    const env = integrations.payment_environment || 'sandbox'
    const asaasApiKey =
      env === 'production' ? integrations.asaas_production_key : integrations.asaas_sandbox_key

    if (!asaasApiKey) throw new Error('Asaas API Key não configurada.')

    const asaasUrl =
      env === 'production' ? 'https://api.asaas.com/v3' : 'https://sandbox.asaas.com/api/v3'

    const res = await fetch(`${asaasUrl}/payments/${asaas_id}/receiveInCash`, {
      method: 'POST',
      headers: { access_token: asaasApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 0, paymentDate: new Date().toISOString().split('T')[0] }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.errors?.[0]?.description || 'Erro ao baixar pagamento no Asaas')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
