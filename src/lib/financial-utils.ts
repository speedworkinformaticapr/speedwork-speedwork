export interface ChargeData {
  amount: number
  realized_amount: number | null
  due_date: string
  payment_date: string | null
  status?: string
}

export function getChargeStatus(charge: ChargeData): { label: string; color: string } {
  const amount = Number(charge.amount) || 0
  const realized = Number(charge.realized_amount) || 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = charge.due_date ? new Date(charge.due_date) : null
  if (dueDate) dueDate.setHours(0, 0, 0, 0)

  if (realized >= amount) return { label: 'Pago', color: 'bg-emerald-100 text-emerald-800' }
  if (dueDate && today > dueDate) return { label: 'Atrasado', color: 'bg-rose-100 text-rose-800' }
  return { label: 'A Vencer', color: 'bg-amber-100 text-amber-800' }
}

export function getMasterStatus(charges: ChargeData[]): { label: string; color: string } {
  if (!charges?.length) return { label: 'A Vencer', color: 'bg-amber-100 text-amber-800' }
  const statuses = charges.map(getChargeStatus)
  if (statuses.every((s) => s.label === 'Pago'))
    return { label: 'Finalizado', color: 'bg-emerald-100 text-emerald-800' }
  if (statuses.some((s) => s.label === 'Atrasado'))
    return { label: 'Atrasado', color: 'bg-rose-100 text-rose-800' }
  if (statuses.some((s) => s.label === 'Pago') && statuses.some((s) => s.label === 'A Vencer'))
    return { label: 'Parcial', color: 'bg-blue-100 text-blue-800' }
  return { label: 'A Vencer', color: 'bg-amber-100 text-amber-800' }
}

export function getTotalRealized(charges: ChargeData[]): number {
  if (!charges?.length) return 0
  return charges.reduce((sum, c) => sum + (Number(c.realized_amount) || 0), 0)
}

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
}

export function getTypeLabel(type?: string): string {
  return type === 'payable' ? 'Pagar' : 'Receber'
}

export function getNaturezaLabel(natureza: string): string {
  if (natureza === 'D') return 'Débito (Despesa)'
  if (natureza === 'C') return 'Crédito (Receita)'
  if (natureza === 'conta_bancaria') return 'Conta Bancária'
  if (natureza === 'receita') return 'Crédito (Receita)'
  if (natureza === 'despesa') return 'Débito (Despesa)'
  return natureza
}
