import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { api_provider, account_sid, auth_token, phone_number } = await req.json()

    let valido = false
    let mensagem = ''

    // Simulate validation
    if (api_provider === 'twilio') {
      if (account_sid && auth_token) {
        valido = true
        mensagem = 'Conexão Twilio validada com sucesso.'
      } else {
        mensagem = 'Credenciais Twilio inválidas ou ausentes.'
      }
    } else if (api_provider === 'evolution') {
      if (auth_token && phone_number) {
        valido = true
        mensagem = 'Conexão Evolution API validada com sucesso.'
      } else {
        mensagem = 'Credenciais Evolution inválidas ou ausentes.'
      }
    } else {
      mensagem = 'Provedor desconhecido.'
    }

    return new Response(JSON.stringify({ valido, mensagem }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ valido: false, mensagem: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
