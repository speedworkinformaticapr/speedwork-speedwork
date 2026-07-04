export interface ChargeData {
  amount: number
  realized_amount: number | null
  due_date: string
  payment_date: string | null
  status?: string
}

export function getChargeStatus(charge: ChargeData): { label: string; color: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(charge.due_date)
  dueDate.setHours(0, 0, 0, 0)
  const amount = Number(charge.amount) || 0
  const realized = Number(charge.realized_amount) || 0

  if (charge.status === 'pago' || (amount > 0 && realized >= amount))
    return { label: 'Em dia', color: 'bg-emerald-100 text-emerald-800' }
  if (charge.status === 'parcial' || (realized > 0 && realized < amount))
    return { label: 'Parcial', color: 'bg-blue-100 text-blue-800' }
  if (today > dueDate) return { label: 'Atrasado', color: 'bg-rose-100 text-rose-800' }
  return { label: 'Em dia', color: 'bg-emerald-100 text-emerald-800' }
}

export function getMasterStatus(charges: ChargeData[]): { label: string; color: string } {
  if (!charges?.length) return { label: 'Em dia', color: 'bg-emerald-100 text-emerald-800' }
  const statuses = charges.map(getChargeStatus)
  if (statuses.some((s) => s.label === 'Atrasado'))
    return { label: 'Atrasado', color: 'bg-rose-100 text-rose-800' }
  if (statuses.some((s) => s.label === 'Parcial'))
    return { label: 'Parcial', color: 'bg-blue-100 text-blue-800' }
  return { label: 'Em dia', color: 'bg-emerald-100 text-emerald-800' }
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
