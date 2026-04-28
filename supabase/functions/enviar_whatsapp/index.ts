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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { empresa_id, cliente_id, tipo_mensagem, variaveis, telefone_destino } = await req.json()

    const { data: config } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single()
    if (!config) throw new Error('Configuração do WhatsApp não encontrada ou inativa.')

    let conteudoFinal = ''

    if (tipo_mensagem === 'teste_conexao') {
      conteudoFinal = 'TESTE'
    } else {
      const { data: template } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('tipo_mensagem', tipo_mensagem)
        .eq('is_active', true)
        .limit(1)
        .single()

      if (!template) throw new Error(`Template para ${tipo_mensagem} não encontrado ou inativo.`)

      conteudoFinal = template.conteudo
      if (variaveis) {
        Object.keys(variaveis).forEach((key) => {
          const value = variaveis[key] || ''
          conteudoFinal = conteudoFinal.replace(new RegExp(`{{${key}}}`, 'g'), value)
        })
      }
    }

    let sucesso = true
    let respostaApi: any = { status: 'success', simulated: true, provider: config.api_provider }

    if ((config as any).is_production) {
      respostaApi.simulated = false
      try {
        if (config.api_provider === 'twilio') {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.account_sid}/Messages.json`
          const formData = new URLSearchParams()
          formData.append('To', telefone_destino)
          formData.append('From', config.phone_number || '')
          formData.append('Body', conteudoFinal)

          const res = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: 'Basic ' + btoa(`${config.account_sid}:${config.auth_token}`),
            },
            body: formData.toString(),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || 'Erro Twilio')
          respostaApi.data = data
        } else if (config.api_provider === 'evolution') {
          const baseUrl = config.account_sid?.replace(/\/$/, '') || ''
          const evolutionUrl = `${baseUrl}/message/sendText/${config.phone_number}`
          const res = await fetch(evolutionUrl, {
            method: 'POST',
            headers: {
              apikey: config.auth_token || '',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              number: telefone_destino,
              options: { delay: 1200, presence: 'composing', linkPreview: false },
              textMessage: { text: conteudoFinal },
            }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || data.error || 'Erro Evolution')
          respostaApi.data = data
        } else {
          throw new Error('Provedor não suportado para envio real')
        }
      } catch (err: any) {
        sucesso = false
        respostaApi = {
          status: 'error',
          error: err.message,
          provider: config.api_provider,
          simulated: false,
        }
      }
    }

    const { error: logError } = await supabase.from('whatsapp_logs').insert({
      empresa_id: empresa_id || config.empresa_id,
      cliente_id,
      telefone: telefone_destino,
      tipo_mensagem,
      status: sucesso ? 'enviado' : 'falha',
      resposta_api: respostaApi,
    })

    if (logError) throw logError

    return new Response(
      JSON.stringify({
        status: sucesso ? 'enviado' : 'falha',
        mensagem: conteudoFinal,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 'erro_config', erro: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
