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

  let empresa_id_ref = ''
  let test_phone_ref = ''

  try {
    const body = await req.json()
    const {
      api_provider,
      account_sid,
      auth_token,
      phone_number,
      instance_name,
      test_phone,
      empresa_id,
    } = body

    empresa_id_ref = empresa_id
    test_phone_ref = test_phone

    if (!test_phone) {
      throw new Error('Número de teste não fornecido.')
    }

    let valido = false
    let mensagem = ''
    let respostaApi: any = null

    try {
      if (api_provider === 'twilio') {
        if (!phone_number) {
          throw new Error('Número do remetente (phone_number) não fornecido para validação Twilio.')
        }

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`
        const formData = new URLSearchParams()

        const formatTwilioNumber = (num: any) => {
          if (!num) return ''
          const strNum = String(num)
          const cleanNum = strNum.replace(/[^\d+]/g, '')
          if (!cleanNum) return strNum
          const withPlus = cleanNum.startsWith('+') ? cleanNum : `+${cleanNum}`
          return `whatsapp:${withPlus}`
        }

        formData.append('To', formatTwilioNumber(test_phone))
        formData.append('From', formatTwilioNumber(phone_number))
        formData.append('Body', 'TESTE de Conexão')

        const res = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + btoa(`${account_sid}:${auth_token}`),
          },
          body: formData.toString(),
        })
        respostaApi = await res.json()
        if (!res.ok) {
          const errorMsg = respostaApi.message || JSON.stringify(respostaApi)
          throw new Error(`Twilio: ${errorMsg}`)
        }

        valido = true
        mensagem = 'Conexão Twilio validada e mensagem enviada com sucesso.'
      } else if (api_provider === 'evolution') {
        const baseUrl = account_sid?.replace(/\/$/, '') || ''
        const instName = instance_name || phone_number || ''
        const evolutionUrl = `${baseUrl}/message/sendText/${instName}`

        const res = await fetch(evolutionUrl, {
          method: 'POST',
          headers: {
            apikey: auth_token || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            number: test_phone,
            options: { delay: 1200, presence: 'composing', linkPreview: false },
            textMessage: { text: 'TESTE de Conexão' },
          }),
        })
        respostaApi = await res.json()
        if (!res.ok) {
          const errorMsg = respostaApi.message || respostaApi.error || JSON.stringify(respostaApi)
          throw new Error(`Evolution API: ${errorMsg}`)
        }

        valido = true
        mensagem = 'Conexão Evolution API validada e mensagem enviada com sucesso.'
      } else {
        throw new Error('Provedor desconhecido.')
      }
    } catch (apiError: any) {
      throw new Error(`Erro na API do Provedor: ${apiError.message}`)
    }

    if (empresa_id_ref) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabase = createClient(supabaseUrl, supabaseKey)

      await supabase.from('whatsapp_logs').insert({
        empresa_id: empresa_id_ref,
        telefone: test_phone_ref,
        tipo_mensagem: 'test_connection',
        status: 'enviado',
        resposta_api: respostaApi,
      })
    }

    return new Response(JSON.stringify({ valido, mensagem }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    if (empresa_id_ref) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        await supabase.from('whatsapp_logs').insert({
          empresa_id: empresa_id_ref,
          telefone: test_phone_ref || '',
          tipo_mensagem: 'test_connection',
          status: 'falha',
          resposta_api: { error: error.message },
        })
      } catch (_) {}
    }

    return new Response(JSON.stringify({ valido: false, mensagem: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
