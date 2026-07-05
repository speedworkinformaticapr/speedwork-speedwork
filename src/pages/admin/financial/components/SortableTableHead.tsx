import { TableHead } from '@/components/ui/table'
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortableTableHeadProps {
  label: string
  column: string
  sortConfig: { column: string; direction: 'asc' | 'desc' } | null
  onSort: (column: string) => void
  className?: string
}

export function SortableTableHead({
  label,
  column,
  sortConfig,
  onSort,
  className,
}: SortableTableHeadProps) {
  const isActive = sortConfig?.column === column
  const direction = isActive ? sortConfig!.direction : null

  return (
    <TableHead
      className={cn('cursor-pointer select-none hover:bg-muted/50 transition-colors', className)}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {direction === 'asc' && <ArrowUp className="h-3 w-3" />}
        {direction === 'desc' && <ArrowDown className="h-3 w-3" />}
        {!direction && <ChevronsUpDown className="h-3 w-3 opacity-40" />}
      </div>
    </TableHead>
  )
}
