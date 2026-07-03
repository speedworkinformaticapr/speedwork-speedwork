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

  if (realized >= amount && amount > 0)
    return { label: 'Em dia', color: 'bg-emerald-100 text-emerald-800' }
  if (realized > 0 && realized < amount)
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

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
}

export function getTypeLabel(type?: string): string {
  return type === 'payable' ? 'Pagar' : 'Receber'
}
