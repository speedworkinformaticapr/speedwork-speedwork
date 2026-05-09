import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { field_context, current_text, system_context, max_length } = await req.json()

    // Mocking an AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    let generatedText = ''
    const ctxLower = field_context.toLowerCase()

    if (ctxLower.includes('título')) {
      if (ctxLower.includes('blog')) {
        generatedText = '5 Estratégias Imbatíveis para Melhorar seu Desempenho no Footgolf'
      } else if (ctxLower.includes('regra')) {
        generatedText = 'Regulamento Oficial: Conduta e Penalidades em Campo'
      } else if (ctxLower.includes('manutenção')) {
        generatedText = 'Pausa para Melhorias: Voltamos em Breve!'
      } else {
        generatedText = 'Novo Título Otimizado'
      }
    } else if (ctxLower.includes('resumo')) {
      generatedText =
        'Descubra as principais dicas e táticas utilizadas pelos grandes campeões para aprimorar sua precisão, foco e força mental durante as competições.'
    } else if (ctxLower.includes('introdução')) {
      generatedText =
        'O footgolf é um esporte que exige muito mais do que apenas força física; requer uma mente afiada e uma estratégia bem definida. Neste post, vamos mergulhar fundo nas técnicas fundamentais que farão a diferença no seu próximo torneio.'
    } else if (ctxLower.includes('conclusão')) {
      generatedText =
        'Aplicar essas estratégias no seu dia a dia pode transformar seu jogo. Não perca a oportunidade de treinar com consistência e buscar sempre a evolução. Compartilhe este post com seus amigos de equipe e preparem-se para a próxima vitória!'
    } else if (ctxLower.includes('conteúdo completo')) {
      generatedText = `## O Segredo dos Campeões\n\nA prática constante e a avaliação das próprias habilidades formam a base do sucesso.\n\n### 1. Preparação Mental\nAntes de entrar em campo, a respiração e o foco são essenciais para evitar erros bobos.\n\n### 2. Equipamento Adequado\nUtilizar a bola correta e as chuteiras ideais para a grama pode alterar o trajeto da bola em centímetros cruciais.\n\n> "O talento vence jogos, mas o trabalho em equipe e a inteligência vencem campeonatos."`
    } else if (ctxLower.includes('texto detalhado') && ctxLower.includes('regra')) {
      generatedText = `### Artigo 1: Conduta Antidesportiva\n\nTodos os atletas devem manter o respeito mútuo. Qualquer ofensa verbal resultará em penalidade de 1 ponto.\n\n### Artigo 2: Atrasos\n\nO atraso superior a 15 minutos do horário estipulado causará desclassificação automática da rodada.\n\nEste regulamento entra em vigor imediatamente após sua publicação, visando garantir a integridade e a boa convivência de todos os participantes associados.`
    } else if (ctxLower.includes('manutenção')) {
      generatedText =
        'Nossa equipe técnica está trabalhando nos bastidores para trazer novos recursos e maior estabilidade à plataforma. Agradecemos sua paciência e pedimos que retorne dentro de algumas horas para conferir as novidades.'
    } else if (ctxLower.includes('observações')) {
      generatedText =
        'Usuário apresenta um histórico de excelente conduta. Documentação verificada e pendências financeiras quitadas. Recomendado manter status ativo na plataforma.'
    } else {
      generatedText = `Conteúdo gerado para o contexto: "${field_context}".`
    }

    if (max_length && generatedText.length > max_length) {
      generatedText = generatedText.substring(0, max_length - 3) + '...'
    }

    // Incorporate the system_context lightly if available
    if (
      system_context &&
      !ctxLower.includes('conteúdo completo') &&
      !ctxLower.includes('texto detalhado')
    ) {
      generatedText += ` (Baseado em: ${system_context.substring(0, 30)}...)`
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
