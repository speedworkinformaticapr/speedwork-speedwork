import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DataTableColumnHeader({ title, column, sortConfig, onSort, className }: any) {
  const isActive = sortConfig?.column === column
  return (
    <div
      className={cn(
        'flex items-center gap-1 cursor-pointer select-none hover:text-primary transition-colors',
        className,
      )}
      onClick={() => onSort(column)}
    >
      <span>{title}</span>
      {isActive ? (
        sortConfig.direction === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-30" />
      )}
    </div>
  )
}
