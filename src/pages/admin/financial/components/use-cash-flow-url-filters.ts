import { useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DateRange } from 'react-day-picker'
import { parseISO, isValid, format } from 'date-fns'

const VALID_TYPES = ['all', 'receivable', 'payable']
const VALID_STATUSES = ['all', 'finalizado', 'atrasado', 'parcial', 'a vencer']

function parseValidDate(value: string | null): Date | undefined {
  if (!value) return undefined
  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : undefined
}

export interface CashFlowUrlFilters {
  search: string
  typeFilter: string
  statusFilter: string
  dateRange: DateRange | undefined
  setSearch: (value: string) => void
  setTypeFilter: (value: string) => void
  setStatusFilter: (value: string) => void
  setDateRange: (range: DateRange | undefined) => void
}

export function useCashFlowUrlFilters(): CashFlowUrlFilters {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = useMemo(() => searchParams.get('q') ?? '', [searchParams])

  const typeFilter = useMemo(() => {
    const t = searchParams.get('type') ?? 'all'
    return VALID_TYPES.includes(t) ? t : 'all'
  }, [searchParams])

  const statusFilter = useMemo(() => {
    const s = searchParams.get('status') ?? 'all'
    return VALID_STATUSES.includes(s) ? s : 'all'
  }, [searchParams])

  const dateRange = useMemo(() => {
    const from = parseValidDate(searchParams.get('from'))
    const to = parseValidDate(searchParams.get('to'))
    if (!from && !to) return undefined
    return { from, to }
  }, [searchParams])

  const setSearch = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) next.set('q', value)
          else next.delete('q')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setTypeFilter = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value && value !== 'all') next.set('type', value)
          else next.delete('type')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setStatusFilter = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value && value !== 'all') next.set('status', value)
          else next.delete('status')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setDateRange = useCallback(
    (range: DateRange | undefined) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (range?.from) next.set('from', format(range.from, 'yyyy-MM-dd'))
          else next.delete('from')
          if (range?.to) next.set('to', format(range.to, 'yyyy-MM-dd'))
          else next.delete('to')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return {
    search,
    typeFilter,
    statusFilter,
    dateRange,
    setSearch,
    setTypeFilter,
    setStatusFilter,
    setDateRange,
  }
}
