import { cn } from '@/lib/utils'

interface CharCounterProps {
  value: string
  max?: number
  type?: 'char' | 'word'
}

export function CharCounter({ value, max, type = 'char' }: CharCounterProps) {
  const count = type === 'word' ? value.trim().split(/\s+/).filter(Boolean).length : value.length
  const label = type === 'word' ? 'palavras' : 'caracteres'
  const isOver = max !== undefined && count > max

  return (
    <span
      className={cn('text-xs', isOver ? 'text-destructive font-medium' : 'text-muted-foreground')}
    >
      {count}
      {max !== undefined ? `/${max}` : ''} {label}
    </span>
  )
}
