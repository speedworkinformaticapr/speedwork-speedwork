import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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

const schema = z.object({
  title: z.string().min(1, 'Obrigatório'),
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
  const form = useForm<PlanServiceData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
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

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({ ...initialData, observation: initialData.observation || '' })
      } else {
        form.reset({
          title: '',
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
    await onSave(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
  )
}
