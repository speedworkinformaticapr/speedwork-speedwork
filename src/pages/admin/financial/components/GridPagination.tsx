import { Button } from '@/components/ui/button'

interface GridPaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function GridPagination({ page, pageSize, total, onPageChange }: GridPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, total)

  const pageButtons: (number | string)[] = []
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
      pageButtons.push(i)
    } else if (pageButtons[pageButtons.length - 1] !== '...') {
      pageButtons.push('...')
    }
  }

  return (
    <div className="flex items-center justify-between p-3 border-t bg-card shrink-0">
      <span className="text-sm text-muted-foreground">
        Mostrando {start} a {end} de {total} registro(s)
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          Anterior
        </Button>
        {pageButtons.map((btn, idx) =>
          typeof btn === 'number' ? (
            <Button
              key={idx}
              variant={btn === page ? 'default' : 'outline'}
              size="sm"
              className="h-8 min-w-8 px-2"
              onClick={() => onPageChange(btn)}
            >
              {btn + 1}
            </Button>
          ) : (
            <span key={idx} className="px-1 text-muted-foreground text-sm">
              ...
            </span>
          ),
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}
