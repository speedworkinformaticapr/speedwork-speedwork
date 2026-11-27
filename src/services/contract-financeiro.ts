// Geração das mensalidades do contrato no financeiro (etapa ASSINADO → FINANCEIRO).
// Cria 1 registro-mestre + as parcelas em financial_charges, com due_date
// escalado do data_inicio pelo duracao_ciclo, valor_ciclo e conta_id do contrato.
import { supabase } from '@/lib/supabase/client'
import { cicloMeses } from '@/lib/contract-status'

export interface GerarMensalidadesResultado {
  ok: boolean
  parcelas: number
  message?: string
}

/** Soma as parcelas na data de início, escalando pelo ciclo em meses. */
function vencimentos(dataInicio: string, meses: number, total: number): Date[] {
  const base = new Date(`${dataInicio}T12:00:00`)
  const datas: Date[] = []
  for (let i = 0; i < total; i++) {
    const d = new Date(base)
    d.setMonth(d.getMonth() + meses * i)
    datas.push(d)
  }
  return datas
}

/**
 * Cria as mensalidades do contrato no financeiro.
 * - registro-mestre em financial_master_records (referência ao contrato);
 * - parcelas em financial_charges (parcela_numero/parcela_total,
 *   due_date escalado do data_inicio, valor_ciclo, conta_id do contrato).
 * Idempotente: se já existem parcelas com reference_id = contrato, não duplica.
 */
export async function gerarMensalidadesContrato(
  contrato: {
    id: string
    numero_contrato?: string | null
    cliente_id?: string | null
    clienteNome?: string | null
    valor_ciclo?: number | null
    duracao_ciclo?: string | null
    data_inicio?: string | null
    conta_id?: string | null
    responsavelNome?: string | null
  },
  opts: { meses?: number; parcelas?: number } = {},
): Promise<GerarMensalidadesResultado> {
  const { id, numero_contrato } = contrato
  if (!id) return { ok: false, parcelas: 0, message: 'Contrato sem id' }
  if (!contrato.data_inicio)
    return { ok: false, parcelas: 0, message: 'Contrato sem data de início' }

  // Idempotência: já existem parcelas deste contrato?
  const { count } = await supabase
    .from('financial_charges')
    .select('id', { count: 'exact', head: true })
    .eq('master_record_id', id)
  if (count && count > 0) {
    return { ok: true, parcelas: count, message: 'Mensalidades já geradas' }
  }

  const meses = opts.meses ?? cicloMeses(contrato.duracao_ciclo)
  const total = opts.parcelas ?? (meses > 0 ? Math.max(1, meses) : 1)
  const valor = Number(contrato.valor_ciclo || 0)
  const datas = vencimentos(contrato.data_inicio, meses, total)

  const { data: master, error: masterErr } = await supabase
    .from('financial_master_records')
    .insert({
      description: `Mensalidades do contrato ${numero_contrato || id}`,
      client_id: contrato.cliente_id || null,
      client_name: contrato.clienteNome || 'Contrato',
      total_amount: valor * total,
      status: 'pendente',
      type: 'receivable',
      category: 'contrato',
      reference_id: id,
      reference_type: 'contrato',
      entry_date: contrato.data_inicio,
    })
    .select('id')
    .single()
  if (masterErr || !master) {
    return {
      ok: false,
      parcelas: 0,
      message: masterErr?.message || 'Falha ao criar registro-mestre no financeiro',
    }
  }

  const charges = datas.map((d, i) => ({
    master_record_id: master.id,
    client_name: contrato.clienteNome || 'Contrato',
    profile_id: contrato.cliente_id || null,
    amount: valor,
    due_date: d.toISOString().split('T')[0],
    description: `Mensalidade ${i + 1}/${total} — contrato ${numero_contrato || id}`,
    status: 'pendente',
    type: 'receivable',
    category: 'contrato',
    conta_id: contrato.conta_id || null,
    parcela_numero: i + 1,
    parcela_total: total,
  })) as any

  const { error: chargesErr } = await supabase.from('financial_charges').insert(charges)
  if (chargesErr) {
    return { ok: false, parcelas: 0, message: chargesErr.message }
  }

  return { ok: true, parcelas: total }
}
