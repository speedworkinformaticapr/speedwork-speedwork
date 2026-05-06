import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const todayStr = new Date().toISOString().split('T')[0]

    const { data: contratos } = await supabaseAdmin
      .from('contratos')
      .select('*')
      .eq('status', 'ativo')
      .lte('data_proxima_cobranca', todayStr)

    let processed = 0
    for (const contrato of contratos || []) {
      const { data: existing } = await supabaseAdmin
        .from('lancamentos_financeiros')
        .select('id')
        .eq('referencia_id', contrato.id)
        .eq('categoria', 'Cobrança Contrato')
        .eq('data_lancamento', todayStr)
        .single()

      if (!existing) {
        await supabaseAdmin.from('lancamentos_financeiros').insert({
          tipo: 'entrada',
          descricao: `Cobrança Contrato ${contrato.numero_contrato}`,
          valor: contrato.valor_ciclo,
          data_lancamento: todayStr,
          categoria: 'Cobrança Contrato',
          referencia_id: contrato.id,
          referencia_tipo: 'contrato',
          user_id: contrato.responsavel_id,
          conta_id: contrato.conta_id || null,
        })
      }

      const nextDate = new Date(contrato.data_proxima_cobranca)
      if (contrato.duracao_ciclo === 'mensal') nextDate.setMonth(nextDate.getMonth() + 1)
      else if (contrato.duracao_ciclo === 'trimestral') nextDate.setMonth(nextDate.getMonth() + 3)
      else if (contrato.duracao_ciclo === 'semestral') nextDate.setMonth(nextDate.getMonth() + 6)
      else if (contrato.duracao_ciclo === 'anual') nextDate.setFullYear(nextDate.getFullYear() + 1)

      const nextDateStr = nextDate.toISOString().split('T')[0]

      let newStatus = 'ativo'
      if (
        !contrato.renovacao_automatica &&
        contrato.data_fim &&
        new Date(contrato.data_fim) <= new Date(todayStr)
      ) {
        newStatus = 'expirado'
      }

      await supabaseAdmin
        .from('contratos')
        .update({
          data_proxima_cobranca: nextDateStr,
          status: newStatus,
        })
        .eq('id', contrato.id)

      processed++
    }

    return new Response(JSON.stringify({ success: true, processed }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
