import { useState, useMemo, useEffect } from 'react'
import { useFinancialGridData } from './use-financial-grid-data'
import { getMasterStatus, getTotalRealized } from '@/lib/financial-utils'

export type SortConfig = { column: string; direction: 'asc' | 'desc' }

export function useCashFlowGrid(records: any[], pageSize: number) {
  const { profiles, partners, accounts } = useFinancialGridData(records)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'created_at',
    direction: 'desc',
  })
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [records])

  const enriched = useMemo(() => {
    return records.map((r) => {
      const charges = r.financial_charges || []
      const chargeWithProfile = charges.find((c: any) => c.profile_id)
      const profileId = r.client_id || chargeWithProfile?.profile_id
      const profile = profileId ? profiles[profileId] : null
      const partner = r.client_name ? partners[r.client_name] : null
      const doc = profile?.cpf_cnpj || profile?.document || partner?.document || '-'
      const name = r.client_name || profile?.name || partner?.name || '-'
      const realized = Number(r.paid_amount) || getTotalRealized(charges)
      const status = getMasterStatus(charges)
      return {
        ...r,
        _doc: doc,
        _name: name,
        _realized: realized,
        _statusLabel: status.label,
        _statusColor: status.color,
      }
    })
  }, [records, profiles, partners])

  const sorted = useMemo(() => {
    const arr = [...enriched]
    const { column, direction } = sortConfig
    arr.sort((a, b) => {
      let cmp = 0
      switch (column) {
        case 'created_at':
          cmp = (a.created_at || '').localeCompare(b.created_at || '')
          break
        case 'doc':
          cmp = (a._doc || '').localeCompare(b._doc || '')
          break
        case 'type':
          cmp = (a.type || '').localeCompare(b.type || '')
          break
        case 'description':
          cmp = (a.description || '').localeCompare(b.description || '')
          break
        case 'total_amount':
          cmp = (Number(a.total_amount) || 0) - (Number(b.total_amount) || 0)
          break
        case 'realized':
          cmp = a._realized - b._realized
          break
        case 'status':
          cmp = (a._statusLabel || '').localeCompare(b._statusLabel || '')
          break
        default:
          cmp = 0
      }
      return direction === 'desc' ? -cmp : cmp
    })
    return arr
  }, [enriched, sortConfig])

  const paginated = useMemo(() => {
    const start = page * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, pageSize])

  const handleSort = (column: string) => {
    setSortConfig((c) =>
      c.column === column
        ? { column, direction: c.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'asc' },
    )
  }

  return {
    enriched: paginated,
    total: sorted.length,
    sortConfig,
    handleSort,
    page,
    setPage,
    accounts,
  }
}
