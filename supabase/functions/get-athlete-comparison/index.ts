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
    const body = await req.json()
    const { user_id, attribute_id } = body
    if (!user_id || !attribute_id) throw new Error('user_id and attribute_id are required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: profile } = await supabase
      .from('profiles')
      .select('club_id')
      .eq('id', user_id)
      .single()
    const club_id = profile?.club_id

    const { data: allValues } = await supabase
      .from('athlete_attribute_values')
      .select('valor, user_id, profiles!inner(club_id, deleted_at)')
      .eq('attribute_id', attribute_id)
      .is('profiles.deleted_at', null)

    let athleteAvg = 0
    let clubAvg = 0
    let fedAvg = 0

    if (allValues && allValues.length > 0) {
      const athleteVals = allValues
        .filter((v: any) => v.user_id === user_id)
        .map((v: any) => parseFloat(v.valor))
        .filter((v: number) => !isNaN(v))
      athleteAvg = athleteVals.length
        ? athleteVals.reduce((a, b) => a + b, 0) / athleteVals.length
        : 0

      if (club_id) {
        const clubVals = allValues
          .filter((v: any) => v.profiles?.club_id === club_id)
          .map((v: any) => parseFloat(v.valor))
          .filter((v: number) => !isNaN(v))
        clubAvg = clubVals.length ? clubVals.reduce((a, b) => a + b, 0) / clubVals.length : 0
      }

      const fedVals = allValues
        .map((v: any) => parseFloat(v.valor))
        .filter((v: number) => !isNaN(v))
      fedAvg = fedVals.length ? fedVals.reduce((a, b) => a + b, 0) / fedVals.length : 0
    }

    return new Response(JSON.stringify({ athleteAvg, clubAvg, fedAvg }), {
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
