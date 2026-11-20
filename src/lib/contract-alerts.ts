// Regras de alerta do módulo de contratos:
//  - Renovação: 60 e 30 dias antes de renewal_date
//  - Reajuste: 30 dias antes de reajuste_date
//  - Exportação: 30 dias contados do cancelamento (export_deadline_date)
export interface AlertaContrato {
  contratoId: string
  numeroContrato: string
  cliente?: string | null
  tipo: 'renovacao60' | 'renovacao30' | 'reajuste' | 'exportacao'
  mensagem: string
  data: string
  dias: number
}

export const diasAte = (iso?: string | null): number | null => {
  if (!iso) return null
  const alvo = new Date(`${String(iso).split('T')[0]}T12:00:00`)
  if (Number.isNaN(alvo.getTime())) return null
  const hoje = new Date()
  hoje.setHours(12, 0, 0, 0)
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000)
}

export const STATUS_COM_ALERTA = ['ativo', 'em assinatura', 'rascunho', null, '']

/** Alertas vigentes de um contrato, pelas datas de renovação/reajuste/exportação. */
export function getContractAlerts(c: {
  id?: string
  status?: string | null
  renewal_date?: string | null
  reajuste_date?: string | null
  export_deadline_date?: string | null
  numero_contrato?: string | null
  cliente_nome?: string | null
}): AlertaContrato[] {
  const alertas: AlertaContrato[] = []
  const base = {
    contratoId: c.id || '',
    numeroContrato: c.numero_contrato || '—',
    cliente: c.cliente_nome || null,
  }
  const vigente = STATUS_COM_ALERTA.includes(c.status ?? null)

  const diasRenovacao = diasAte(c.renewal_date)
  if (vigente && diasRenovacao !== null && diasRenovacao <= 60) {
    alertas.push({
      ...base,
      tipo: diasRenovacao <= 30 ? 'renovacao30' : 'renovacao60',
      mensagem:
        diasRenovacao <= 30
          ? `Contrato renova em ${diasRenovacao} dia(s) — decidir renovação ou denúncia (aviso mínimo de 30 dias)`
          : `Renovação do contrato se aproxima (${diasRenovacao} dias)`,
      data: String(c.renewal_date),
      dias: diasRenovacao,
    })
  }

  const diasReajuste = diasAte(c.reajuste_date)
  if (vigente && diasReajuste !== null && diasReajuste <= 30) {
    alertas.push({
      ...base,
      tipo: 'reajuste',
      mensagem: `Reajuste do contrato pelo índice contratado em ${diasReajuste} dia(s)`,
      data: String(c.reajuste_date),
      dias: diasReajuste,
    })
  }

  // Exportação aplica-se a contratos cancelados: 30 dias pós-cancelamento.
  const diasExport = diasAte(c.export_deadline_date)
  if (c.status === 'cancelado' && diasExport !== null) {
    alertas.push({
      ...base,
      tipo: 'exportacao',
      mensagem:
        diasExport >= 0
          ? `Cliente tem ${diasExport} dia(s) para exportar os dados (prazo de 30 dias pós-cancelamento)`
          : `Prazo de exportação vencido há ${Math.abs(diasExport)} dia(s) — dados podem ser eliminados`,
      data: String(c.export_deadline_date),
      dias: diasExport,
    })
  }

  return alertas
}
