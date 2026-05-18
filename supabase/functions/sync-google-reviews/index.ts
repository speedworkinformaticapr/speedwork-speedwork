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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch integrations config
    const { data: sysData, error: sysError } = await supabase
      .from('system_data')
      .select('integrations')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()

    if (sysError || !sysData) {
      throw new Error('Erro ao buscar configurações do sistema.')
    }

    const integrations = (sysData.integrations as any) || {}
    const apiKey = integrations.google_maps_api_key
    const placeId = integrations.place_id

    if (!apiKey || !placeId) {
      throw new Error('Chave da API do Google Maps ou Place ID não configurados.')
    }

    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}&language=pt-BR`

    const response = await fetch(googleApiUrl)
    const data = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`Erro na API do Google: ${data.status} - ${data.error_message || ''}`)
    }

    const reviews = data.result?.reviews || []

    let upsertedCount = 0

    if (reviews.length > 0) {
      const recordsToUpsert = reviews.map((review: any) => ({
        author_name: review.author_name,
        author_url: review.author_url,
        profile_photo_url: review.profile_photo_url,
        rating: review.rating,
        text: review.text,
        time: review.time,
        relative_time_description: review.relative_time_description,
      }))

      const { error: upsertError } = await supabase
        .from('google_reviews')
        .upsert(recordsToUpsert, { onConflict: 'author_name,time' })

      if (upsertError) {
        throw new Error(`Erro ao salvar reviews no banco: ${upsertError.message}`)
      }

      upsertedCount = recordsToUpsert.length
    }

    return new Response(JSON.stringify({ success: true, count: upsertedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
