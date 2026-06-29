import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions: string[]
}

export function TagInput({ tags, onChange, suggestions }: TagInputProps) {
  const [input, setInput] = useState('')

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase()
    if (clean && !tags.includes(clean)) onChange([...tags, clean])
    setInput('')
  }

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag))

  const filtered = suggestions
    .filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s))
    .slice(0, 6)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[28px]">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            #{tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag(input)
            }
          }}
          placeholder="Digite uma tag e pressione Enter..."
        />
        <Button type="button" variant="outline" size="icon" onClick={() => addTag(input)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filtered.map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => addTag(s)}
            >
              {s}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
