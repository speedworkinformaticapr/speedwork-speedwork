import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // In a real scenario, you would fetch GOOGLE_ADS_REFRESH_TOKEN from env
    // const refreshToken = Deno.env.get('GOOGLE_ADS_REFRESH_TOKEN');
    // Call Google OAuth2 endpoint to get access_token
    // Call Google Ads API endpoint to query campaigns and metrics
    // Since we don't have real credentials, we will mock the response and update the database

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not set')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // Get the user ID from the authorization header if available
    const authHeader = req.headers.get('Authorization')
    let userId = null

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token)
      if (!error && user) {
        userId = user.id
      }
    }

    // Mock new data representing the latest sync
    const today = new Date().toISOString().split('T')[0]

    const mockSyncData = [
      {
        user_id: userId,
        campaign_id: 'C-001',
        campaign_name: 'Campanha Inverno 2026',
        impressions: Math.floor(Math.random() * 2000 + 500),
        clicks: Math.floor(Math.random() * 100 + 20),
        cost: Math.floor(Math.random() * 50 + 10),
        conversions: Math.floor(Math.random() * 5 + 1),
        date: today,
      },
      {
        user_id: userId,
        campaign_id: 'C-002',
        campaign_name: 'Retargeting Associados',
        impressions: Math.floor(Math.random() * 1000 + 300),
        clicks: Math.floor(Math.random() * 80 + 10),
        cost: Math.floor(Math.random() * 40 + 8),
        conversions: Math.floor(Math.random() * 4 + 1),
        date: today,
      },
      {
        user_id: userId,
        campaign_id: 'C-003',
        campaign_name: 'Busca Institucional',
        impressions: Math.floor(Math.random() * 3000 + 800),
        clicks: Math.floor(Math.random() * 150 + 30),
        cost: Math.floor(Math.random() * 60 + 15),
        conversions: Math.floor(Math.random() * 6 + 1),
        date: today,
      },
    ]

    // Upsert or insert the new data
    // For simplicity, we just insert it. In a real scenario, you'd use ON CONFLICT to update
    const { data, error } = await supabaseAdmin
      .from('google_ads_cache')
      .insert(mockSyncData)
      .select()

    if (error) {
      console.error('DB Insert Error:', error)
      throw error
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dados sincronizados com sucesso (Mock)',
        recordsAdded: mockSyncData.length,
        data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Sync error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
