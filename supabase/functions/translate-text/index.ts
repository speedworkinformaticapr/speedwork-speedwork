import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import OpenAI from 'npm:openai@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { texts } = await req.json() // Expects: { [field_name]: "text to translate" }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: sysData } = await supabase
      .from('system_data')
      .select('integrations')
      .limit(1)
      .maybeSingle()
    const integrations = (sysData?.integrations as any) || {}
    const openaiEnv = integrations.openai_environment || 'test'
    const apiKey =
      openaiEnv === 'production'
        ? integrations.openai_api_key_production
        : integrations.openai_api_key_test

    let translatedTexts: any = {}

    if (apiKey) {
      const openai = new OpenAI({ apiKey })

      const prompt = `Você é um tradutor especializado. Traduza os valores do seguinte objeto JSON (que contém textos em português) para o Inglês e o Espanhol. Mantenha a estrutura HTML se houver.
Retorne APENAS um objeto JSON válido no formato estrito abaixo (sem formatação markdown adicional):
{
  "en": { "chave1": "translated text in english", ... },
  "es": { "chave1": "texto traducido en español", ... }
}

JSON a traduzir:
${JSON.stringify(texts)}`

      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content || '{}'
      translatedTexts = JSON.parse(content)
    } else {
      // Mock translation se a chave da API não estiver configurada
      await new Promise((resolve) => setTimeout(resolve, 1500))
      translatedTexts = { en: {}, es: {} }
      for (const key of Object.keys(texts)) {
        if (texts[key]) {
          translatedTexts.en[key] = texts[key] + ' (EN)'
          translatedTexts.es[key] = texts[key] + ' (ES)'
        }
      }
    }

    return new Response(JSON.stringify(translatedTexts), {
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
