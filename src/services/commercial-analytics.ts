import { supabase } from '@/lib/supabase/client'

export async function getOrcamentosMetrics() {
  const { data } = await supabase.from('orcamentos').select('*, clientes(nome)')
  if (!data) return { orcamentos: [], total: 0, valor: 0, taxa: 0, vencidos: 0 }

  const total = data.length
  const valor = data.reduce((acc, curr) => acc + (curr.total || 0), 0)
  const aprovados = data.filter((d) => d.status === 'aprovado' || d.status === 'convertido').length
  const taxa = total ? (aprovados / total) * 100 : 0
  const vencidos = data.filter(
    (d) =>
      new Date(d.data_validade) < new Date() &&
      d.status !== 'aprovado' &&
      d.status !== 'convertido',
  ).length

  return { orcamentos: data, total, valor, taxa, vencidos }
}

export async function getPedidosMetrics() {
  const { data } = await supabase.from('pedidos').select('*, clientes(nome)')
  if (!data) return { pedidos: [], total: 0, valor: 0, taxaEntrega: 0, atrasados: 0 }

  const total = data.length
  const valor = data.reduce((acc, curr) => acc + (curr.valor_total || 0), 0)
  const entregues = data.filter((d) => d.status === 'entregue')
  const entreguesNoPrazo = entregues.filter(
    (d) => new Date(d.data_entrega_real) <= new Date(d.data_entrega_prevista),
  ).length
  const taxaEntrega = entregues.length ? (entreguesNoPrazo / entregues.length) * 100 : 0
  const atrasados = data.filter(
    (d) =>
      new Date(d.data_entrega_prevista) < new Date() &&
      d.status !== 'entregue' &&
      d.status !== 'cancelado',
  ).length

  return { pedidos: data, total, valor, taxaEntrega, atrasados }
}

export async function getContratosMetrics() {
  const { data } = await supabase.from('contratos').select('*, clientes(nome)')
  if (!data) return { contratos: [], ativos: 0, mrr: 0, retencao: 0, proximosVencer: 0 }

  const ativosList = data.filter((d) => d.status === 'ativo')
  const ativos = ativosList.length

  const mrr = ativosList.reduce((acc, curr) => {
    let monthly = curr.valor_ciclo || 0
    if (curr.duracao_ciclo === 'trimestral') monthly /= 3
    if (curr.duracao_ciclo === 'semestral') monthly /= 6
    if (curr.duracao_ciclo === 'anual') monthly /= 12
    return acc + monthly
  }, 0)

  const retencao = data.length ? (ativos / data.length) * 100 : 0

  const trintaDias = new Date()
  trintaDias.setDate(trintaDias.getDate() + 30)
  const proximosVencer = ativosList.filter(
    (d) => d.data_fim && new Date(d.data_fim) < trintaDias,
  ).length

  return { contratos: data, ativos, mrr, retencao, proximosVencer }
}
