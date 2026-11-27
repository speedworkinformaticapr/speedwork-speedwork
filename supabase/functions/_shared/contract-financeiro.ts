// Geração das mensalidades do contrato no financeiro (etapa ASSINADO → FINANCEIRO).
// Espelho da rotina de src/services/contract-financeiro.ts, adaptada para rodar
// na edge function autentique-webhook (Deno): o client Supabase é injetado.
// Cria 1 registro-mestre em financial_master_records + as parcelas em
// financial_charges (parcela_numero/parcela_total, due_date escalado do
// data_inicio pelo duracao_ciclo, valor_ciclo e conta_id do contrato).

export interface ContratoFinanceiroInput {
  id: string
  numero_contrato?: string | null
  cliente_id?: string | null
  clienteNome?: string | null
  valor_ciclo?: number | null
  duracao_ciclo?: string | null
  data_inicio?: string | null
  conta_id?: string | null
}

export interface GerarMensalidadesResultado {
  ok: boolean
  parcelas: number
  message?: string
}

/** Duração do ciclo → meses por parcela (mensal=1, trimestral=3, semestral=6, anual=12). */
export function cicloMeses(duracao: string | null | undefined): number {
  switch (duracao) {
    case 'trimestral':
      return 3
    case 'semestral':
      return 6
    case 'anual':
      return 12
    default:
      return 1
  }
}

/** Soma as parcelas na data de início, escalando pelo ciclo em meses. */
function vencimentos(dataInicio: string, meses: number, total: number): string[] {
  const base = new Date(`${dataInicio}T12:00:00`)
  const datas: string[] = []
  for (let i = 0; i < total; i++) {
    const d = new Date(base)
    d.setMonth(d.getMonth() + meses * i)
    datas.push(d.toISOString().split('T')[0])
  }
  return datas
}

type AnyClient = {
  from: (table: string) => any
}

/**
 * Cria as mensalidades do contrato no financeiro.
 * Idempotente: se já existe registro-mestre com reference_id = contrato
 * (reference_type 'contrato'), não duplica.
 */
export async function gerarMensalidadesContrato(
  supabaseAdmin: AnyClient,
  contrato: ContratoFinanceiroInput,
): Promise<GerarMensalidadesResultado> {
  const { id, numero_contrato } = contrato
  if (!id) return { ok: false, parcelas: 0, message: 'Contrato sem id' }
  if (!contrato.data_inicio)
    return { ok: false, parcelas: 0, message: 'Contrato sem data de início' }

  // Idempotência: já existe registro-mestre deste contrato?
  const { count } = await supabaseAdmin
    .from('financial_master_records')
    .select('id', { count: 'exact', head: true })
    .eq('reference_id', id)
    .eq('reference_type', 'contrato')
  if (count && count > 0) {
    return { ok: true, parcelas: count, message: 'Mensalidades já geradas' }
  }

  const meses = cicloMeses(contrato.duracao_ciclo)
  const total = meses > 0 ? Math.max(1, meses) : 1
  const valor = Number(contrato.valor_ciclo || 0)
  const datas = vencimentos(contrato.data_inicio, meses, total)

  const { data: master, error: masterErr } = await supabaseAdmin
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

  const charges = datas.map((due, i) => ({
    master_record_id: master.id,
    client_name: contrato.clienteNome || 'Contrato',
    profile_id: contrato.cliente_id || null,
    amount: valor,
    due_date: due,
    description: `Mensalidade ${i + 1}/${total} — contrato ${numero_contrato || id}`,
    status: 'pendente',
    type: 'receivable',
    category: 'contrato',
    conta_id: contrato.conta_id || null,
    parcela_numero: i + 1,
    parcela_total: total,
  }))

  const { error: chargesErr } = await supabaseAdmin.from('financial_charges').insert(charges)
  if (chargesErr) {
    // Não deixa o mestre órfão: remove o registro criado e reporta a falha
    // (o contrato permanece ASSINADO; novo evento/poderação reexecuta).
    await supabaseAdmin.from('financial_master_records').delete().eq('id', master.id)
    return { ok: false, parcelas: 0, message: chargesErr.message }
  }

  return { ok: true, parcelas: total }
}
