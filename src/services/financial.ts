import { supabase } from '@/lib/supabase/client'

export async function createFinancialEntry(data: {
  tipo: 'entrada' | 'saida'
  descricao: string
  valor: number
  data_lancamento: string
  categoria: string
  referencia_id: string
  referencia_tipo: string
  user_id: string
}) {
  const { data: existing } = await supabase
    .from('lancamentos_financeiros')
    .select('id')
    .eq('referencia_id', data.referencia_id)
    .eq('referencia_tipo', data.referencia_tipo)
    .eq('categoria', data.categoria)
    .maybeSingle()

  if (existing) return existing

  const { data: newEntry, error } = await supabase
    .from('lancamentos_financeiros')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return newEntry
}
