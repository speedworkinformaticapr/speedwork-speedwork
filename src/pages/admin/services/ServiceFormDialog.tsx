// Formulário de serviço comercial (catálogo de serviços, aba "Serviços" de
// /admin/services). Substitui o antigo PlanServiceFormDialog das telas de
// planos — a aba Planos agora gerencia fichas em `plans` via PlanFormDialog.
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface ServiceData {
  id?: string
  title: string
  description: string
  evaluation_slug?: string | null
  exec_time?: string | null
  cost_value?: number | null
  sale_value?: number | null
  category_id?: string | null
  avulso_value: number
  avulso_discount?: number
  monthly_value: number
  semiannual_value: number
  annual_value: number
  monthly_discount?: number
  semiannual_discount?: number
  annual_discount?: number
  observation?: string
  avulso_promo_discount?: number
  avulso_promo_expires_at?: string | null
  monthly_promo_discount?: number
  monthly_promo_expires_at?: string | null
  semiannual_promo_discount?: number
  semiannual_promo_expires_at?: string | null
  annual_promo_discount?: number
  annual_promo_expires_at?: string | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: ServiceData | null
  onSave: (data: ServiceData) => Promise<void>
}

const EMPTY: ServiceData = {
  title: '',
  description: '',
  evaluation_slug: '',
  exec_time: '',
  cost_value: 0,
  sale_value: 0,
  category_id: '',
  avulso_value: 0,
  avulso_discount: 0,
  monthly_value: 0,
  semiannual_value: 0,
  annual_value: 0,
  monthly_discount: 0,
  semiannual_discount: 0,
  annual_discount: 0,
  observation: '',
  avulso_promo_discount: 0,
  avulso_promo_expires_at: '',
  monthly_promo_discount: 0,
  monthly_promo_expires_at: '',
  semiannual_promo_discount: 0,
  semiannual_promo_expires_at: '',
  annual_promo_discount: 0,
  annual_promo_expires_at: '',
}

const toDateInputValue = (val?: string | null): string => {
  if (!val) return ''
  const d = new Date(val)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16)
}

const toISOOrNull = (val?: string | null): string | null => {
  if (!val) return null
  const d = new Date(val)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

const PROMOS: { discount: keyof ServiceData; expires: keyof ServiceData; label: string }[] = [
  { discount: 'avulso_promo_discount', expires: 'avulso_promo_expires_at', label: 'Avulso' },
  { discount: 'monthly_promo_discount', expires: 'monthly_promo_expires_at', label: 'Mensal' },
  {
    discount: 'semiannual_promo_discount',
    expires: 'semiannual_promo_expires_at',
    label: 'Semestral',
  },
  { discount: 'annual_promo_discount', expires: 'annual_promo_expires_at', label: 'Anual' },
]

const PRICE_FIELDS: { key: keyof ServiceData; label: string }[] = [
  { key: 'avulso_value', label: 'Valor Avulso *' },
  { key: 'avulso_discount', label: '% Desc. Avulso' },
  { key: 'monthly_value', label: 'Valor Mensal *' },
  { key: 'monthly_discount', label: '% Desc. Mensal' },
  { key: 'semiannual_value', label: 'Valor Semestral *' },
  { key: 'semiannual_discount', label: '% Desc. Semestral' },
  { key: 'annual_value', label: 'Valor Anual *' },
  { key: 'annual_discount', label: '% Desc. Anual' },
]

export function ServiceFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [categories, setCategories] = useState<{ id: string; title: string }[]>([])
  const [form, setForm] = useState<ServiceData>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryTitle, setNewCategoryTitle] = useState('')
  const { toast } = useToast()

  const loadCategories = async () => {
    const { data } = await supabase.from('plan_categories').select('id, title').order('title')
    if (data) setCategories(data)
  }

  useEffect(() => {
    if (!open) return
    loadCategories()
    setForm(initialData ? { ...EMPTY, ...initialData } : { ...EMPTY })
  }, [open, initialData])

  const set = (key: keyof ServiceData, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleCreateCategory = async () => {
    if (!newCategoryTitle.trim()) return
    try {
      const { data, error } = await supabase
        .from('plan_categories')
        .insert({ title: newCategoryTitle.trim() })
        .select()
        .single()
      if (error) throw error
      await loadCategories()
      set('category_id', data.id)
      setIsCategoryModalOpen(false)
      setNewCategoryTitle('')
      toast({ title: 'Sucesso', description: 'Categoria criada' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Título e descrição são obrigatórios.',
      })
      return
    }
    setSaving(true)
    try {
      await onSave({
        ...form,
        category_id: form.category_id || null,
        evaluation_slug: form.evaluation_slug || null,
        exec_time: form.exec_time || null,
        avulso_promo_expires_at: toISOOrNull(form.avulso_promo_expires_at),
        monthly_promo_expires_at: toISOOrNull(form.monthly_promo_expires_at),
        semiannual_promo_expires_at: toISOOrNull(form.semiannual_promo_expires_at),
        annual_promo_expires_at: toISOOrNull(form.annual_promo_expires_at),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{initialData ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <div className="flex gap-2">
                  <Select
                    value={form.category_id || 'none'}
                    onValueChange={(v) => set('category_id', v === 'none' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem categoria</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsCategoryModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-primary">Dados Técnicos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Slug de Avaliação</Label>
                  <Input
                    placeholder="ex: suporte-tecnico"
                    value={form.evaluation_slug || ''}
                    onChange={(e) => set('evaluation_slug', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Tempo Execução (hh:mm:ss)</Label>
                  <Input
                    placeholder="00:00:00"
                    value={form.exec_time || ''}
                    onChange={(e) => set('exec_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Custo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.cost_value ?? 0}
                    onChange={(e) => set('cost_value', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Venda (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.sale_value ?? 0}
                    onChange={(e) => set('sale_value', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRICE_FIELDS.map((pf) => (
                <div key={pf.key} className="space-y-2">
                  <Label>{pf.label}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(form[pf.key] as number) ?? 0}
                    onChange={(e) => set(pf.key, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-primary">
                Descontos Promocionais (cumulativos)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROMOS.map((pf) => (
                  <div key={pf.label} className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">% Promo {pf.label}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={(form[pf.discount] as number) ?? 0}
                        onChange={(e) => set(pf.discount, Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Expira {pf.label}</Label>
                      <Input
                        type="datetime-local"
                        value={toDateInputValue(form[pf.expires] as string | null | undefined)}
                        onChange={(e) => set(pf.expires, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observação</Label>
              <RichTextEditor
                value={form.observation || ''}
                onChange={(v) => set('observation', v)}
                withAi
                aiContext="Observações sobre o serviço"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={saving}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título da Categoria</Label>
              <Input
                value={newCategoryTitle}
                onChange={(e) => setNewCategoryTitle(e.target.value)}
                placeholder="Ex: Consultoria"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCategory} disabled={!newCategoryTitle.trim()}>
              Salvar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
