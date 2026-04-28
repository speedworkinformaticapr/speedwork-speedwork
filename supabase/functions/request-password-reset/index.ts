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
    const { email, redirectTo } = await req.json()
    if (!email) throw new Error('Email is required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // Generate recovery link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectTo || 'https://www.footgolfpr.com.br/reset-password',
      },
    })

    if (linkError) {
      // If user not found, we still return success to prevent email enumeration
      if (
        linkError.message.includes('not found') ||
        linkError.status === 404 ||
        linkError.message.includes('User not found')
      ) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
      throw linkError
    }

    // Try to get name for the email
    let userName = 'Usuário'
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('email', email)
      .single()
    if (profile?.name) {
      userName = profile.name
    }

    // Send the email using our send-email edge function
    const { error: sendError } = await supabaseAdmin.functions.invoke('send-email', {
      body: {
        type: 'password_reset',
        email: email,
        name: userName,
        resetLink: linkData.properties.action_link,
      },
    })

    if (sendError) {
      console.error('Error invoking send-email:', sendError)
      throw new Error('Falha ao enviar o e-mail de recuperação.')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Password reset error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
