export interface WizardFormData {
  type: 'receivable' | 'payable'
  isAvulso: boolean
  entityId: string
  entityName: string
  categoryId: string
  description: string
  totalAmount: string
  dueDate: string
  installments: string
  accountId: string
}

export function safeDate(val: string | Date): Date | null {
  const d = typeof val === 'string' ? new Date(val + 'T00:00:00') : new Date(val)
  return isNaN(d.getTime()) ? null : d
}

export function safeISODate(val: string | Date): string {
  const d = safeDate(val)
  if (!d) return new Date().toISOString().split('T')[0]
  return d.toISOString().split('T')[0]
}

export interface InstallmentItem {
  num: number
  total: number
  amount: number
  due: string
}

export function computeInstallments(
  totalStr: string,
  numStr: string,
  dueDateStr: string,
): InstallmentItem[] {
  const total = parseFloat(totalStr) || 0
  const num = Math.max(1, parseInt(numStr) || 1)
  const parcelValue = Math.round((total / num) * 100) / 100
  const base = safeDate(dueDateStr)
  if (!base || total <= 0) return []
  return Array.from({ length: num }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() + i, base.getDate())
    if (isNaN(d.getTime())) return null
    const isLast = i === num - 1
    return {
      num: i + 1,
      total: num,
      amount:
        isLast && num > 1 ? Math.round((total - parcelValue * (num - 1)) * 100) / 100 : parcelValue,
      due: safeISODate(d),
    }
  }).filter(Boolean) as InstallmentItem[]
}
