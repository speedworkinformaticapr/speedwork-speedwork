import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineCellSelectProps {
  value: string
  options: { label: string; value: string }[]
  onUpdate: (value: string) => Promise<void>
  className?: string
  placeholder?: string
}

export function InlineCellSelect({
  value,
  options,
  onUpdate,
  className,
  placeholder,
}: InlineCellSelectProps) {
  const [current, setCurrent] = useState(value)
  const [loading, setLoading] = useState(false)

  const handleChange = async (newVal: string) => {
    if (newVal === current) return
    const prev = current
    setCurrent(newVal)
    setLoading(true)
    try {
      await onUpdate(newVal)
    } catch {
      setCurrent(prev)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Select value={current} onValueChange={handleChange} disabled={loading}>
        <SelectTrigger
          className={cn(
            'h-8 w-auto min-w-[110px] border-dashed bg-transparent text-xs hover:bg-muted/50',
            className,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground flex-shrink-0" />}
    </div>
  )
}
