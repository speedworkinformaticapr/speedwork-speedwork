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
    const { field_context, current_text, system_context, max_length, type, aspect_ratio } =
      await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: sysData } = await supabase
      .from('system_data')
      .select('integrations, ai_context')
      .limit(1)
      .maybeSingle()
    const integrations = (sysData?.integrations as any) || {}
    const openaiEnv = integrations.openai_environment || 'test'
    const apiKey =
      openaiEnv === 'production'
        ? integrations.openai_api_key_production
        : integrations.openai_api_key_test
    const aiModel = integrations.blog_ai_model || 'gpt-4o-mini'
    const aiContext = sysData?.ai_context || ''

    if (type === 'image') {
      if (apiKey) {
        const openai = new OpenAI({ apiKey })
        const prompt = `Generate a professional, high-quality image for a sports/footgolf blog post. Context: ${field_context}. Style: modern, vibrant, suitable for web publication.`
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: aspect_ratio === '16:9' ? '1792x1024' : '1024x1024',
          quality: 'standard',
        })
        const imageUrl = response.data[0]?.url || ''
        return new Response(JSON.stringify({ image_url: imageUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } else {
        const seed = Math.random().toString(36).substring(2, 8)
        const w = aspect_ratio === '16:9' ? 800 : 600
        const h = aspect_ratio === '16:9' ? 450 : 600
        return new Response(
          JSON.stringify({
            image_url: `https://img.usecurling.com/p/${w}/${h}?q=golf&color=green&seed=${seed}`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      }
    }

    let generatedText = ''

    if (apiKey) {
      const openai = new OpenAI({ apiKey })
      let prompt = `Você é um assistente especializado em ajudar na criação de conteúdo de uma plataforma de esportes/Footgolf. O usuário solicitou a geração de um texto para o contexto do campo: "${field_context}".`
      if (system_context || aiContext) {
        prompt += `\nConsidere também as seguintes informações: ${system_context || aiContext}`
      }
      if (current_text) {
        prompt += `\nO texto atual do campo é: "${current_text}". Você deve melhorá-lo ou expandi-lo conforme o contexto.`
      }
      if (max_length) {
        prompt += `\nO tamanho máximo da resposta deve ser próximo de ${max_length} caracteres.`
      }
      prompt += `\nPor favor, forneça apenas o conteúdo gerado de forma limpa, sem introduções adicionais.`

      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: aiModel,
      })
      generatedText = completion.choices[0]?.message?.content || ''
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1200))
      const ctxLower = field_context?.toLowerCase() || ''
      if (ctxLower.includes('título')) {
        generatedText = '5 Estratégias Imbatíveis para Melhorar seu Desempenho no Footgolf'
      } else if (ctxLower.includes('resumo') || ctxLower.includes('meta description')) {
        generatedText =
          'Descubra as principais dicas e táticas dos grandes campeões para aprimorar sua precisão e foco nas competições.'
      } else if (ctxLower.includes('introdução')) {
        generatedText =
          'O footgolf é um esporte que exige muito mais do que força física; requer uma mente afiada e estratégia definida.'
      } else if (ctxLower.includes('conclusão')) {
        generatedText =
          'Aplicar essas estratégias pode transformar seu jogo. Treine com consistência e busque sempre a evolução!'
      } else if (ctxLower.includes('takeaway')) {
        generatedText =
          '- Mantenha o foco em cada chute\n- Analise o terreno antes de agir\n- Pratique a leitura do green\n- Controle a respiração'
      } else if (ctxLower.includes('cta') || ctxLower.includes('chamada')) {
        generatedText = 'Inscreva-se já no próximo torneio e mostre seu talento!'
      } else {
        generatedText = `## Desenvolvimento\n\nA prática constante e a avaliação das próprias habilidades formam a base do sucesso.\n\n### Preparação\nAntes de entrar em campo, a respiração e o foco são essenciais.\n\n> "O talento vence jogos, mas a inteligência vence campeonatos."`
      }
      if (max_length && generatedText.length > max_length) {
        generatedText = generatedText.substring(0, max_length - 3) + '...'
      }
    }

    return new Response(JSON.stringify({ generated_text: generatedText }), {
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
