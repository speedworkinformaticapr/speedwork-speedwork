import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Missing server configuration' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const body = await req.json().catch(() => ({}))
    const userId = body.userId
    const accessToken = body.accessToken
    const refreshToken = body.refreshToken
    const clientId = body.clientId
    const clientSecret = body.clientSecret
    const customerId = body.customerId

    if (!accessToken || !customerId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: accessToken and customerId' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      )
    }

    const googleAdsUrl = `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:searchStream`
    const query =
      body.query ||
      'SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM campaign WHERE segments.date DURING LAST_7_DAYS'

    const response = await fetch(googleAdsUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': body.developerToken || '',
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorDetail: unknown = errorText
      try {
        errorDetail = JSON.parse(errorText)
      } catch {
        // response was not JSON, keep raw text
      }
      return new Response(
        JSON.stringify({
          error: 'Google Ads API request failed',
          detail: errorDetail,
          status: response.status,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        },
      )
    }

    const responseText = await response.text()
    let adsData: unknown = []
    try {
      adsData = JSON.parse(responseText)
    } catch {
      adsData = [{ raw: responseText }]
    }

    const results = Array.isArray(adsData) ? adsData : [adsData]
    let totalImpressions = 0
    let totalClicks = 0
    let totalCost = 0
    let totalConversions = 0

    for (const batch of results) {
      const batchResults = (batch as Record<string, unknown>)?.results
      if (Array.isArray(batchResults)) {
        for (const row of batchResults) {
          const metrics = (row as Record<string, Record<string, string>>)?.metrics
          if (metrics) {
            totalImpressions += parseInt(metrics.impressions || '0', 10)
            totalClicks += parseInt(metrics.clicks || '0', 10)
            totalCost += parseInt(metrics.cost_micros || '0', 10) / 1_000_000
            totalConversions += parseFloat(metrics.conversions || '0')
          }
        }
      }
    }

    if (userId) {
      const today = new Date().toISOString().split('T')[0]
      const { error: upsertError } = await supabase.from('google_ads_cache').upsert(
        {
          user_id: userId,
          campaign_id: customerId,
          campaign_name: `Customer ${customerId}`,
          impressions: totalImpressions,
          clicks: totalClicks,
          cost: totalCost,
          conversions: totalConversions,
          date: today,
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'user_id,campaign_id,date' },
      )

      if (upsertError) {
        return new Response(
          JSON.stringify({ error: 'Failed to cache Google Ads data', detail: upsertError.message }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
        )
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          impressions: totalImpressions,
          clicks: totalClicks,
          cost: totalCost,
          conversions: totalConversions,
        },
        raw: adsData,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
