import { useState, useMemo, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getChargeStatus, formatCurrency } from '@/lib/financial-utils'
import { useSystemData } from '@/hooks/use-system-data'
import { SortableTableHead } from './SortableTableHead'
import { GridPagination } from './GridPagination'
import type { SortConfig } from './use-cash-flow-grid'

interface InstallmentSubGridProps {
  charges: any[]
  masterDescription: string
  entryDate?: string
  accounts: Record<string, any>
  onPayment: (charge: any) => void
}

export function InstallmentSubGrid({
  charges,
  masterDescription,
  entryDate,
  accounts,
  onPayment,
}: InstallmentSubGridProps) {
  const { data: systemData } = useSystemData()
  const pageSize = systemData?.records_per_page || 10
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'parcela_numero',
    direction: 'asc',
  })
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [charges])

  const sortedCharges = useMemo(() => {
    const arr = [...charges]
    const { column, direction } = sortConfig
    arr.sort((a, b) => {
      let cmp = 0
      switch (column) {
        case 'description':
          cmp = (a.description || '').localeCompare(b.description || '')
          break
        case 'parcela_numero':
          cmp = (a.parcela_numero || 0) - (b.parcela_numero || 0)
          break
        case 'conta_origem_id':
          cmp = (a.conta_origem_id || '').localeCompare(b.conta_origem_id || '')
          break
        case 'conta_destino_id':
          cmp = (a.conta_destino_id || '').localeCompare(b.conta_destino_id || '')
          break
        case 'amount':
          cmp = (Number(a.amount) || 0) - (Number(b.amount) || 0)
          break
        case 'realized_amount':
          cmp = (Number(a.realized_amount) || 0) - (Number(b.realized_amount) || 0)
          break
        default:
          cmp = 0
      }
      return direction === 'desc' ? -cmp : cmp
    })
    return arr
  }, [charges, sortConfig])

  const paginatedCharges = useMemo(() => {
    const start = page * pageSize
    return sortedCharges.slice(start, start + pageSize)
  }, [sortedCharges, page, pageSize])

  const handleSort = (column: string) => {
    setSortConfig((c) =>
      c.column === column
        ? { column, direction: c.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'asc' },
    )
  }

  const getAcctLabel = (id: string | null | undefined) => {
    if (!id) return '-'
    const a = accounts[id]
    return a ? `${a.codigo_estrutural} - ${a.nome}` : '-'
  }

  return (
    <div className="rounded-lg border flex flex-col max-h-[280px] overflow-hidden">
      <div className="overflow-auto flex-1">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
            <TableRow>
              <SortableTableHead
                label="Descrição"
                column="description"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <TableHead className="text-xs">Data de Vencimento</TableHead>
              <SortableTableHead
                label="Parcela"
                column="parcela_numero"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHead
                label="Origem"
                column="conta_origem_id"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHead
                label="Destino"
                column="conta_destino_id"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHead
                label="Previsto"
                column="amount"
                sortConfig={sortConfig}
                onSort={handleSort}
                className="text-right"
              />
              <SortableTableHead
                label="Realizado"
                column="realized_amount"
                sortConfig={sortConfig}
                onSort={handleSort}
                className="text-right"
              />
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Baixa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCharges.map((c) => {
              const cs = getChargeStatus(c)
              return (
                <TableRow key={c.id}>
                  <TableCell className="text-sm">
                    {masterDescription || c.description || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {c.due_date
                      ? new Date(c.due_date + 'T00:00:00').toLocaleDateString('pt-BR')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.parcela_numero ? `${c.parcela_numero}/${c.parcela_total}` : '-'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {getAcctLabel(c.conta_origem_id)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {getAcctLabel(c.conta_destino_id)}
                  </TableCell>
                  <TableCell className="text-right text-sm">{formatCurrency(c.amount)}</TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(Number(c.realized_amount) || 0)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('rounded-md px-2 py-0.5 text-xs border-none', cs.color)}>
                      {cs.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => onPayment(c)}>
                      Baixa
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <GridPagination
        page={page}
        pageSize={pageSize}
        total={sortedCharges.length}
        onPageChange={setPage}
      />
    </div>
  )
}
