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

const promoField = (label: string) =>
  z.object({
    [`${label}_promo_discount`]: z.coerce.number().min(0).max(100).optional().default(0),
    [`${label}_promo_expires_at`]: z.string().optional().nullable(),
  })

const schema = z.object({
  title: z.string().min(1, 'Obrigatório'),
  category_id: z.string().optional().nullable(),
  description: z.string().min(1, 'Obrigatório'),
  avulso_value: z.coerce.number().min(0, 'Inválido'),
  avulso_discount: z.coerce.number().min(0).max(100).optional().default(0),
  monthly_value: z.coerce.number().min(0, 'Inválido'),
  semiannual_value: z.coerce.number().min(0, 'Inválido'),
  annual_value: z.coerce.number().min(0, 'Inválido'),
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
    return d.toISOString().slice(0, 16)
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
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      category_id: '',
      description: '',
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
    const { data } = await supabase
      .from('plan_categories' as any)
      .select('*')
      .order('title')
    if (data) setCategories(data)
  }

  useEffect(() => {
    if (open) {
      loadCategories()
      if (initialData) {
        form.reset({
          ...initialData,
          category_id: initialData.category_id || '',
          observation: initialData.observation || '',
          avulso_value: initialData.avulso_value || 0,
          avulso_discount: initialData.avulso_discount || 0,
          avulso_promo_discount: (initialData as any).avulso_promo_discount || 0,
          avulso_promo_expires_at: toDateInputValue((initialData as any).avulso_promo_expires_at),
          monthly_promo_discount: (initialData as any).monthly_promo_discount || 0,
          monthly_promo_expires_at: toDateInputValue((initialData as any).monthly_promo_expires_at),
          semiannual_promo_discount: (initialData as any).semiannual_promo_discount || 0,
          semiannual_promo_expires_at: toDateInputValue(
            (initialData as any).semiannual_promo_expires_at,
          ),
          annual_promo_discount: (initialData as any).annual_promo_discount || 0,
          annual_promo_expires_at: toDateInputValue((initialData as any).annual_promo_expires_at),
        })
      } else {
        form.reset({
          title: '',
          category_id: '',
          description: '',
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
        .from('plan_categories' as any)
        .insert({ title: newCategoryTitle.trim() })
        .select()
        .single()

      if (error) throw error

      await loadCategories()
      form.setValue('category_id', data.id)
      setIsCategoryModalOpen(false)
      setNewCategoryTitle('')
      toast({ title: 'Sucesso', description: 'Categoria criada com sucesso' })
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
                <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Descontos Promocionais (cumulativos)
                </h4>
                <p className="text-xs text-muted-foreground">
                  A promoção é aplicada sobre o preço já descontado. Expira automaticamente na data
                  definida.
                </p>
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
                        aiContext="Observações sobre o serviço comercial"
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
