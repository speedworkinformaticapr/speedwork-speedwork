import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: any
  onSave: (data: any) => void
  services: { id: string; title: string }[]
  defaultServiceId?: string
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'textarea', label: 'Texto Longo' },
  { value: 'select', label: 'Seleção Única' },
  { value: 'multiselect', label: 'Múltipla Escolha' },
  { value: 'boolean', label: 'Sim/Não' },
]

export function QuestionEditorDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
  services,
  defaultServiceId,
}: Props) {
  const [label, setLabel] = useState('')
  const [placeholder, setPlaceholder] = useState('')
  const [fieldType, setFieldType] = useState('text')
  const [options, setOptions] = useState<string[]>([])
  const [newOption, setNewOption] = useState('')
  const [isRequired, setIsRequired] = useState(true)
  const [orderIndex, setOrderIndex] = useState(0)
  const [serviceId, setServiceId] = useState('')

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label || '')
      setPlaceholder(initialData.placeholder || '')
      setFieldType(initialData.field_type || 'text')
      setOptions(initialData.options || [])
      setIsRequired(initialData.is_required ?? true)
      setOrderIndex(initialData.order_index ?? 0)
      setServiceId(initialData.service_id || defaultServiceId || '')
    } else {
      setLabel('')
      setPlaceholder('')
      setFieldType('text')
      setOptions([])
      setNewOption('')
      setIsRequired(true)
      setOrderIndex(0)
      setServiceId(defaultServiceId || '')
    }
  }, [initialData, open, defaultServiceId])

  const addOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()])
      setNewOption('')
    }
  }

  const handleSave = () => {
    onSave({
      label,
      placeholder: placeholder || null,
      field_type: fieldType,
      options: fieldType === 'select' || fieldType === 'multiselect' ? options : [],
      is_required: isRequired,
      order_index: orderIndex,
      service_id: serviceId,
    })
    onOpenChange(false)
  }

  const showOptions = fieldType === 'select' || fieldType === 'multiselect'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Pergunta' : 'Nova Pergunta'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Serviço *</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço..." />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Pergunta *</Label>
            <Input
              showAIGenerator={false}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Digite a pergunta..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Campo</Label>
              <Select value={fieldType} onValueChange={setFieldType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input
                showAIGenerator={false}
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Placeholder (opcional)</Label>
            <Input
              showAIGenerator={false}
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="Texto de ajuda..."
            />
          </div>
          <Button
            type="button"
            variant={isRequired ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsRequired(!isRequired)}
          >
            {isRequired ? 'Obrigatória' : 'Opcional'}
          </Button>
          {showOptions && (
            <div className="space-y-2">
              <Label>Opções</Label>
              <div className="flex gap-2">
                <Input
                  showAIGenerator={false}
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addOption()
                    }
                  }}
                  placeholder="Nova opção..."
                />
                <Button type="button" size="icon" onClick={addOption}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {options.map((opt, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {opt}
                    <button onClick={() => setOptions(options.filter((_, j) => j !== i))}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!label.trim() || !serviceId}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
