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
  category_id: z.string().optional().nullable(),
  description: z.string().min(1, 'Obrigatório'),
  monthly_value: z.coerce.number().min(0, 'Inválido'),
  semiannual_value: z.coerce.number().min(0, 'Inválido'),
  annual_value: z.coerce.number().min(0, 'Inválido'),
  monthly_discount: z.coerce.number().min(0).max(100).optional().default(0),
  semiannual_discount: z.coerce.number().min(0).max(100).optional().default(0),
  annual_discount: z.coerce.number().min(0).max(100).optional().default(0),
  observation: z.string().optional().default(''),
})

export type PlanServiceData = z.infer<typeof schema> & { id?: string }

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: PlanServiceData | null
  onSave: (data: PlanServiceData) => Promise<void>
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
      monthly_value: 0,
      semiannual_value: 0,
      annual_value: 0,
      monthly_discount: 0,
      semiannual_discount: 0,
      annual_discount: 0,
      observation: '',
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
        })
      } else {
        form.reset({
          title: '',
          category_id: '',
          description: '',
          monthly_value: 0,
          semiannual_value: 0,
          annual_value: 0,
          monthly_discount: 0,
          semiannual_discount: 0,
          annual_discount: 0,
          observation: '',
        })
      }
    }
  }, [open, initialData, form])

  const onSubmit = async (values: PlanServiceData) => {
    await onSave({
      ...values,
      category_id: values.category_id || null,
    })
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

              <FormField
                control={form.control}
                name="observation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
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
