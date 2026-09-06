import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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

const schema = z.object({
  title: z.string().min(1, 'Obrigatório'),
  description: z.string().min(1, 'Obrigatório'),
  evaluation_slug: z.string().optional().nullable(),
  exec_time: z.string().optional().nullable(),
  cost_value: z.coerce.number().min(0).optional().default(0),
  sale_value: z.coerce.number().min(0).optional().default(0),
  category_id: z.string().optional().nullable(),
  avulso_value: z.coerce.number().min(0),
  avulso_discount: z.coerce.number().min(0).max(100).optional().default(0),
  monthly_value: z.coerce.number().min(0),
  semiannual_value: z.coerce.number().min(0),
  annual_value: z.coerce.number().min(0),
  monthly_discount: z.coerce.number().min(0).max(100).optional().default(0),
  semiannual_discount: z.coerce.number().min(0).max(100).optional().default(0),
  annual_discount: z.coerce.number().min(0).max(100).optional().default(0),
  observation: z.string().optional().default(''),
  avulso_promo_discount: z.coerce.number().min(0).max(100).optional().default(0),
  avulso_promo_expires_at: z.string().optional().nullable(),
  monthly_promo_discount: z.coerce.number().min(0).max(100).optional().default(0),
  monthly_promo_expires_at: z.string().optional().nullable(),
  semiannual_promo_discount: z.coerce.number().min(0).max(100).optional().default(0),
  semiannual_promo_expires_at: z.string().optional().nullable(),
  annual_promo_discount: z.coerce.number().min(0).max(100).optional().default(0),
  annual_promo_expires_at: z.string().optional().nullable(),
})

export type PlanServiceData = z.infer<typeof schema> & { id?: string }

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: PlanServiceData | null
  onSave: (data: PlanServiceData) => Promise<void>
}

const toDateInputValue = (val: any): string => {
  if (!val) return ''
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ''
  }
}

const toISOOrNull = (val: string | null | undefined): string | null => {
  if (!val) return null
  const d = new Date(val)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

export function PlanServiceFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [categories, setCategories] = useState<{ id: string; title: string }[]>([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryTitle, setNewCategoryTitle] = useState('')
  const { toast } = useToast()

  const form = useForm<PlanServiceData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
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
    },
  })

  const loadCategories = async () => {
    const { data } = await supabase.from('plan_categories').select('*').order('title')
    if (data) setCategories(data)
  }

  useEffect(() => {
    if (open) {
      loadCategories()
      if (initialData) {
        form.reset({
          ...initialData,
          category_id: initialData.category_id || '',
          evaluation_slug: (initialData as any).evaluation_slug || '',
          exec_time: (initialData as any).exec_time || '',
          cost_value: (initialData as any).cost_value || 0,
          sale_value: (initialData as any).sale_value || 0,
          observation: initialData.observation || '',
          avulso_promo_expires_at: toDateInputValue((initialData as any).avulso_promo_expires_at),
          monthly_promo_expires_at: toDateInputValue((initialData as any).monthly_promo_expires_at),
          semiannual_promo_expires_at: toDateInputValue(
            (initialData as any).semiannual_promo_expires_at,
          ),
          annual_promo_expires_at: toDateInputValue((initialData as any).annual_promo_expires_at),
        })
      } else {
        form.reset({
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
        })
      }
    }
  }, [open, initialData, form])

  const onSubmit = async (values: PlanServiceData) => {
    const payload = {
      ...values,
      category_id: values.category_id || null,
      evaluation_slug: values.evaluation_slug || null,
      exec_time: values.exec_time || null,
      avulso_promo_expires_at: toISOOrNull(values.avulso_promo_expires_at),
      monthly_promo_expires_at: toISOOrNull(values.monthly_promo_expires_at),
      semiannual_promo_expires_at: toISOOrNull(values.semiannual_promo_expires_at),
      annual_promo_expires_at: toISOOrNull(values.annual_promo_expires_at),
    } as any
    await onSave(payload)
  }

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
      form.setValue('category_id', data.id)
      setIsCategoryModalOpen(false)
      setNewCategoryTitle('')
      toast({ title: 'Sucesso', description: 'Categoria criada' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
  }

  const promoFields: {
    discount: keyof PlanServiceData
    expires: keyof PlanServiceData
    label: string
  }[] = [
    { discount: 'avulso_promo_discount', expires: 'avulso_promo_expires_at', label: 'Avulso' },
    { discount: 'monthly_promo_discount', expires: 'monthly_promo_expires_at', label: 'Mensal' },
    {
      discount: 'semiannual_promo_discount',
      expires: 'semiannual_promo_expires_at',
      label: 'Semestral',
    },
    { discount: 'annual_promo_discount', expires: 'annual_promo_expires_at', label: 'Anual' },
  ]

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{initialData ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(val) => field.onChange(val === 'none' ? '' : val)}
                          value={field.value || 'none'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-primary">Dados Técnicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="evaluation_slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Slug de Avaliação</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ex: suporte-tecnico"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="exec_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Tempo Execução (hh:mm:ss)</FormLabel>
                        <FormControl>
                          <Input placeholder="00:00:00" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cost_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Custo (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sale_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Venda (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="avulso_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Avulso *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avulso_discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>% Desc. Avulso</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthly_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Mensal *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthly_discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>% Desc. Mensal</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="semiannual_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Semestral *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="semiannual_discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>% Desc. Semestral</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annual_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Anual *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annual_discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>% Desc. Anual</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-primary">
                  Descontos Promocionais (cumulativos)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {promoFields.map((pf) => (
                    <div key={pf.label} className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={pf.discount}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">% Promo {pf.label}</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" max="100" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={pf.expires}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Expira {pf.label}</FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                value={field.value || ''}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="observation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ''}
                        onChange={field.onChange}
                        withAi
                        aiContext="Observações sobre o serviço"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
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
