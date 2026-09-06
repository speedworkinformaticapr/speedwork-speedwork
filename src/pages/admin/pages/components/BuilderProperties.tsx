import { useState, useEffect, useCallback } from 'react'
import usePageBuilderStore from '@/stores/use-page-builder-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Settings,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Layers,
  ArrowRight,
  GripVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AIGenerateButton } from '@/components/AIGenerateButton'
import { MediaPicker } from '@/components/MediaPicker'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { toast } from '@/hooks/use-toast'
import { z } from 'zod'
import { ELEMENT_CONFIGS, type FieldType, type FieldDef, type ListDef } from './builder-config'
import { BUILDER_ELEMENTS } from './builder-elements-data'

const urlSchema = z.string().url().or(z.literal(''))
const colorSchema = z
  .string()
  .regex(/^#([0-9A-F]{3}){1,2}$/i, 'Hex inválido')
  .or(z.literal(''))
const numberSchema = z.coerce.number().or(z.literal(''))

function SlaSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [slas, setSlas] = useState<any[]>([])
  useEffect(() => {
    import('@/lib/supabase/client').then(({ supabase }) => {
      supabase
        .from('sla_types')
        .select('id, name')
        .then(({ data }) => {
          if (data) setSlas(data)
        })
    })
  }, [])

  return (
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder="Selecione um SLA..." />
      </SelectTrigger>
      <SelectContent>
        {slas.map((sla) => (
          <SelectItem key={sla.id} value={sla.id} className="text-xs">
            {sla.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ServiceSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [services, setServices] = useState<any[]>([])
  useEffect(() => {
    import('@/lib/supabase/client').then(({ supabase }) => {
      supabase
        .from('services')
        .select('id, title, evaluation_slug')
        .order('title', { ascending: true })
        .then(({ data }) => {
          if (data) setServices(data)
        })
    })
  }, [])

  return (
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder="Selecione um serviço..." />
      </SelectTrigger>
      <SelectContent>
        {services.map((srv) => (
          <SelectItem key={srv.id} value={srv.evaluation_slug || srv.id} className="text-xs">
            {srv.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ServicesMultiselect({
  value,
  onChange,
}: {
  value: string[]
  onChange: (v: string[]) => void
}) {
  const [services, setServices] = useState<any[]>([])
  useEffect(() => {
    import('@/lib/supabase/client').then(({ supabase }) => {
      supabase
        .from('services')
        .select('id, title, category_id, plan_categories(title)')
        .then(({ data }) => {
          if (data) setServices(data)
        })
    })
  }, [])

  const selected = value || []
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="space-y-2 border p-2 rounded-md max-h-48 overflow-y-auto bg-background">
      {services.map((srv) => (
        <label key={srv.id} className="flex items-center space-x-2 text-xs cursor-pointer">
          <Checkbox checked={selected.includes(srv.id)} onCheckedChange={() => toggle(srv.id)} />
          <span className="truncate">
            {srv.title}{' '}
            <span className="text-muted-foreground">
              ({srv.plan_categories?.title || 'Outros'})
            </span>
          </span>
        </label>
      ))}
    </div>
  )
}

function validateValue(type: FieldType, value: any) {
  try {
    if (type === 'url' && value) urlSchema.parse(value)
    if (type === 'color' && value) colorSchema.parse(value)
    if (type === 'number' && value) numberSchema.parse(value)
    return null
  } catch (e: any) {
    return e.errors?.[0]?.message || 'Inválido'
  }
}

function FieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: FieldDef
  value: any
  onChange: (v: any) => void
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">{field.label}</Label>
        {(field.type === 'text' || field.type === 'textarea') && (
          <AIGenerateButton
            onGenerate={onChange}
            fieldContext={`Preencha o campo "${field.label}" de forma criativa.`}
            currentText={value || ''}
            maxLength={field.type === 'text' ? 100 : 500}
          />
        )}
      </div>
      {field.type === 'text' && (
        <div className="relative">
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs pr-12"
            maxLength={field.maxLength}
          />
          {field.maxLength && (
            <span className="absolute right-2 top-2 text-[10px] text-muted-foreground">
              {(value || '').length}/{field.maxLength}
            </span>
          )}
        </div>
      )}
      {field.type === 'textarea' && (
        <div className="relative">
          {field.maxLength ? (
            <Textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="text-xs min-h-[80px]"
              maxLength={field.maxLength}
            />
          ) : (
            <RichTextEditor value={value || ''} onChange={onChange} minHeight="120px" />
          )}
          {field.maxLength && (
            <span className="absolute right-2 bottom-2 text-[10px] text-muted-foreground">
              {(value || '').length}/{field.maxLength}
            </span>
          )}
        </div>
      )}
      {field.type === 'color' && (
        <div className="flex gap-2">
          <Input
            type="color"
            value={value || '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-8 p-1 cursor-pointer"
          />
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs flex-1 uppercase"
            placeholder="#000000"
          />
        </div>
      )}
      {field.type === 'url' && (
        <div className="flex gap-2">
          <Input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs flex-1"
            placeholder="https://..."
          />
          <MediaPicker
            onSelect={(url) => onChange(url)}
            trigger={
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                title="Buscar na Galeria"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            }
          />
        </div>
      )}
      {field.type === 'number' && (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs"
        />
      )}
      {field.type === 'range' && (
        <div className="flex items-center gap-3">
          <Input
            type="range"
            min="0"
            max="100"
            value={value || 0}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="flex-1 cursor-pointer"
          />
          <span className="text-xs font-mono bg-muted px-2 py-1 rounded w-12 text-center">
            {value || 0}%
          </span>
        </div>
      )}
      {field.type === 'date' && (
        <Input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs"
        />
      )}
      {field.type === 'boolean' && (
        <div className="flex items-center h-8">
          <Switch checked={!!value} onCheckedChange={onChange} />
        </div>
      )}
      {field.type === 'select' && field.options && (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {field.type === 'anchor_id' && (
        <Input
          value={value || ''}
          onChange={(e) => {
            const slugified = e.target.value
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
            onChange(slugified)
          }}
          className="h-8 text-xs font-mono"
          placeholder="ex: nossos-servicos"
        />
      )}
      {field.type === 'sla_select' && <SlaSelect value={value} onChange={onChange} />}
      {field.type === 'service_select' && <ServiceSelect value={value} onChange={onChange} />}
      {field.type === 'services_multiselect' && (
        <ServicesMultiselect value={value} onChange={onChange} />
      )}
      {field.type === 'string_list' && <StringListEditor value={value || []} onChange={onChange} />}
      {error && <span className="text-[10px] text-destructive block mt-1">{error}</span>}
    </div>
  )
}

function ItemPositionInput({
  currentIndex,
  totalItems,
  onMove,
  className,
}: {
  currentIndex: number
  totalItems: number
  onMove: (fromIndex: number, toIndex: number) => void
  className?: string
}) {
  const [localVal, setLocalVal] = useState<string>(String(currentIndex + 1))

  useEffect(() => {
    setLocalVal(String(currentIndex + 1))
  }, [currentIndex])

  const commitValue = () => {
    const trimmed = localVal.trim()
    const parsed = parseInt(trimmed, 10)
    if (isNaN(parsed) || parsed < 1) {
      setLocalVal(String(currentIndex + 1))
      return
    }
    const clampedTarget = Math.max(1, Math.min(parsed, totalItems))
    setLocalVal(String(clampedTarget))
    const targetIndex = clampedTarget - 1
    if (targetIndex !== currentIndex) {
      onMove(currentIndex, targetIndex)
    }
  }

  return (
    <Input
      type="number"
      min={1}
      max={totalItems}
      value={localVal}
      onChange={(e) => {
        setLocalVal(e.target.value)
      }}
      onBlur={commitValue}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === 'Enter') {
          e.preventDefault()
          commitValue()
          ;(e.target as HTMLInputElement).blur()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setLocalVal(String(currentIndex + 1))
          ;(e.target as HTMLInputElement).blur()
        }
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      draggable={false}
      aria-label={`Posição do item (1 a ${totalItems})`}
      title={`Posição do item (1 a ${totalItems})`}
      className={cn(
        'w-12 h-7 text-center font-mono text-xs px-1 py-0 shrink-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        className,
      )}
    />
  )
}

function StringListEditor({
  value,
  onChange,
}: {
  value: string[]
  onChange: (v: string[]) => void
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const items = value || []

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return
    const newArr = [...items]
    const [moved] = newArr.splice(fromIndex, 1)
    newArr.splice(toIndex, 0, moved)
    onChange(newArr)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }
    handleMove(draggedIndex, dropIndex)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-2 mt-1">
      {items.map((item: string, idx: number) => (
        <div
          key={idx}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={(e) => handleDrop(e, idx)}
          className={cn(
            'flex items-center gap-1.5 p-1 rounded-md border bg-background transition-all',
            draggedIndex === idx && 'opacity-40 scale-[0.99] border-dashed',
            dragOverIndex === idx &&
              draggedIndex !== idx &&
              'border-t-2 border-t-primary bg-primary/5',
          )}
        >
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 shrink-0 rounded hover:bg-muted/60"
            title="Arraste para reordenar"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          <ItemPositionInput currentIndex={idx} totalItems={items.length} onMove={handleMove} />

          <Input
            value={item || ''}
            onChange={(e) => {
              const newArr = [...items]
              newArr[idx] = e.target.value
              onChange(newArr)
            }}
            className="h-8 text-xs flex-1"
          />

          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              onClick={() => {
                const newArr = [...items]
                newArr.splice(idx, 1)
                onChange(newArr)
              }}
              title="Excluir item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="w-full h-8 text-xs border-dashed"
        onClick={() => onChange([...items, ''])}
      >
        <Plus className="w-3 h-3 mr-1" /> Adicionar
      </Button>
    </div>
  )
}

function ListRenderer({
  listDef,
  items,
  onChange,
}: {
  listDef: ListDef
  items: any[]
  onChange: (v: any[]) => void
}) {
  const isStringList = !listDef.fields
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleAdd = () => {
    if (isStringList) onChange([...(items || []), ''])
    else onChange([...(items || []), {}])
  }

  const handleRemove = (idx: number) => {
    const newItems = [...(items || [])]
    newItems.splice(idx, 1)
    onChange(newItems)
  }

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (!items || toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return
    const newItems = [...items]
    const [moved] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, moved)
    onChange(newItems)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }
    handleMove(draggedIndex, dropIndex)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleUpdateItem = (idx: number, fieldName: string, value: any) => {
    const newItems = [...(items || [])]
    newItems[idx] = { ...newItems[idx], [fieldName]: value }
    onChange(newItems)
  }

  const handleUpdateStringItem = (idx: number, value: string) => {
    const newItems = [...(items || [])]
    newItems[idx] = value
    onChange(newItems)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-sm">{listDef.label}</Label>
        <Button variant="outline" size="sm" onClick={handleAdd} className="h-7 text-xs px-2">
          <Plus className="w-3 h-3 mr-1" /> Adicionar
        </Button>
      </div>

      {(!items || items.length === 0) && (
        <p className="text-xs text-muted-foreground italic">Nenhum item adicionado.</p>
      )}

      <Accordion type="multiple" className="w-full">
        {(items || []).map((item, idx) => {
          const isMediaList = listDef.name === 'items' && listDef.label.includes('URLs')
          const displayTitle = isStringList
            ? item || `Item ${idx + 1}`
            : isMediaList && typeof item === 'string'
              ? item || `Mídia ${idx + 1}`
              : item.title ||
                item.name ||
                item.question ||
                item.author ||
                item.date ||
                `Item ${idx + 1}`

          return (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              className={cn(
                'border rounded-md px-3 mb-2 bg-card transition-all',
                draggedIndex === idx && 'opacity-40 scale-[0.99] border-dashed',
                dragOverIndex === idx &&
                  draggedIndex !== idx &&
                  'border-t-2 border-t-primary bg-primary/5',
              )}
            >
              <div className="flex items-center justify-between w-full h-10 gap-2">
                {/* Drag Handle */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 shrink-0 rounded hover:bg-muted/60"
                  title="Arraste para reordenar"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>

                {/* Position Input */}
                <ItemPositionInput
                  currentIndex={idx}
                  totalItems={(items || []).length}
                  onMove={handleMove}
                />

                {/* Accordion Trigger (Title + Chevron) */}
                <AccordionTrigger className="hover:no-underline py-0 flex-1 justify-start text-xs font-medium truncate px-1">
                  <span className="truncate">{displayTitle}</span>
                </AccordionTrigger>

                {/* Delete Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(idx)
                  }}
                  title="Excluir item"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <AccordionContent className="pb-3 pt-1 space-y-4">
                {isStringList ? (
                  <div className="flex gap-2">
                    <Input
                      value={item || ''}
                      onChange={(e) => handleUpdateStringItem(idx, e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    {listDef.label.includes('URLs') && (
                      <MediaPicker
                        onSelect={(url) => handleUpdateStringItem(idx, url)}
                        trigger={
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            title="Buscar na Galeria"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                        }
                      />
                    )}
                  </div>
                ) : (
                  listDef.fields?.map((f) => (
                    <FieldRenderer
                      key={f.name}
                      field={f}
                      value={item[f.name]}
                      onChange={(v) => handleUpdateItem(idx, f.name, v)}
                    />
                  ))
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

function DynamicForm({ block, onUpdate }: { block: any; onUpdate: (data: any) => void }) {
  const config = ELEMENT_CONFIGS[block.type]
  const [formData, setFormData] = useState<any>(block.data || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData(block.data || {})
    setErrors({})
  }, [block.id])

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasErrors = Object.values(errors).some((err) => err !== '')
      if (!hasErrors) onUpdate(formData)
    }, 500)
    return () => clearTimeout(timer)
  }, [formData, errors])

  const handleChange = (field: string, value: any, type: FieldType) => {
    const err = validateValue(type, value)
    setErrors((prev) => ({ ...prev, [field]: err || '' }))
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!config) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="py-2 px-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Elemento não suportado pelo form visual. Use o JSON abaixo.
          </AlertDescription>
        </Alert>
        <Textarea
          value={JSON.stringify(formData, null, 2)}
          onChange={(e) => {
            try {
              const p = JSON.parse(e.target.value)
              setFormData(p)
              onUpdate(p)
            } catch {
              /* intentionally ignored */
            }
          }}
          className="font-mono text-xs min-h-[300px]"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-4">
      {config.sections.map((sec, i) => (
        <div key={i} className="space-y-4 bg-card p-4 rounded-xl border shadow-sm">
          <h4 className="font-bold text-sm border-b pb-2 text-primary">{sec.title}</h4>
          <div className="space-y-4 pt-2">
            {sec.fields.map((f) => (
              <FieldRenderer
                key={f.name}
                field={f}
                value={formData[f.name]}
                error={errors[f.name]}
                onChange={(v) => handleChange(f.name, v, f.type)}
              />
            ))}
          </div>
        </div>
      ))}

      {config.lists?.map((lst, i) => (
        <div key={`list-${i}`} className="pt-2 bg-card p-4 rounded-xl border shadow-sm">
          <ListRenderer
            listDef={lst}
            items={formData[lst.name] || []}
            onChange={(v) => setFormData((prev) => ({ ...prev, [lst.name]: v }))}
          />
        </div>
      ))}
    </div>
  )
}

function GoogleReviewsModerator() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('@/lib/supabase/client').then(({ supabase }) => {
      supabase
        .from('google_reviews')
        .select('*')
        .order('time', { ascending: false })
        .then(({ data }) => {
          setReviews(data || [])
          setLoading(false)
        })
    })
  }, [])

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved'
    const { supabase } = await import('@/lib/supabase/client')
    await (supabase.from('google_reviews') as any).update({ status: newStatus }).eq('id', id)
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)))
  }

  if (loading) return <div className="text-xs text-muted-foreground">Carregando avaliações...</div>

  if (reviews.length === 0)
    return <div className="text-xs text-muted-foreground">Nenhuma avaliação encontrada.</div>

  return (
    <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto pr-2">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs truncate">{review.author_name}</span>
              <span className="text-[10px] text-yellow-500 font-bold">★ {review.rating}</span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1" title={review.text}>
              {review.text || '(Sem texto)'}
            </p>
          </div>
          <Switch
            checked={review.status === 'approved' || !review.status}
            onCheckedChange={() => toggleStatus(review.id, review.status || 'approved')}
          />
        </div>
      ))}
    </div>
  )
}

export function BuilderProperties() {
  const { state, setState } = usePageBuilderStore()
  const selectedBlock = state.blocks.find((b) => b.id === state.selectedBlockId)

  const elementDef = BUILDER_ELEMENTS.find((el) => el.type === selectedBlock?.type)
  const elementLabel = elementDef?.label || selectedBlock?.name || selectedBlock?.type || 'Elemento'

  const updateBlockData = useCallback(
    (data: any) => {
      if (!selectedBlock) return
      setState((prev) => ({
        blocks: prev.blocks.map((b) => (b.id === selectedBlock.id ? { ...b, data } : b)),
      }))
    },
    [selectedBlock?.id, setState],
  )

  const updateBlockProp = (updates: Partial<typeof selectedBlock>) => {
    if (!selectedBlock) return
    setState((prev) => ({
      blocks: prev.blocks.map((b) => (b.id === selectedBlock.id ? { ...b, ...updates } : b)),
    }))
  }

  const handleSave = () => {
    toast({
      title: 'Alterações aplicadas',
      description: 'As propriedades do elemento foram atualizadas no Canvas.',
      variant: 'default',
    })
  }

  return (
    <div className="flex-1 bg-muted/10 overflow-y-auto p-4 md:p-8 flex flex-col transition-colors">
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
        {!selectedBlock ? (
          <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-2xl p-12 text-center text-muted-foreground bg-card my-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum elemento selecionado</h3>
            <p className="max-w-md text-sm mb-6">
              Selecione um elemento na guia <strong>Page Builder</strong> para editar suas
              propriedades (título, subtítulo, cores, mídias, links e listas).
            </p>
            <Button
              onClick={() => setState({ activeTab: 'builder' })}
              variant="outline"
              className="gap-2"
            >
              Ir para o Page Builder
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6 pb-12">
            {/* Header of properties tab */}
            <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase font-bold text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                    Editando: {elementLabel}
                  </span>
                  {selectedBlock.isHidden && (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                      Oculto
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-foreground">Propriedades do Elemento</h2>
                <p className="text-xs text-muted-foreground">
                  Altere os campos visuais, textos e configurações deste bloco.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState({ activeTab: 'builder' })}
                >
                  Ver no Canvas
                </Button>
                <Button size="sm" onClick={handleSave} className="gap-2 shadow-sm">
                  <Save className="w-4 h-4" />
                  Salvar Propriedades
                </Button>
              </div>
            </div>

            {/* General Block Identifiers */}
            <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
              <h3 className="font-bold text-sm border-b pb-2 text-primary flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Identificação do Bloco
              </h3>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Nome / Rótulo de Identificação Interna
                </Label>
                <Input
                  value={selectedBlock.name || ''}
                  onChange={(e) => updateBlockProp({ name: e.target.value })}
                  placeholder={`Ex: ${elementLabel} Principal`}
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Usado para identificar este bloco no Page Builder e navegação interna.
                </p>
              </div>
            </div>

            {/* Dynamic visual form according to block type */}
            <DynamicForm block={selectedBlock} onUpdate={updateBlockData} />

            {/* Google Reviews special section if testimonials */}
            {selectedBlock.type === 'testimonials' && (
              <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
                <h4 className="font-bold text-sm border-b pb-2 text-primary">
                  Moderação Google Meu Negócio
                </h4>
                <GoogleReviewsModerator />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
