import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import type { PlanCatalogRow } from '@/services/plan-catalog'

const schema = z.object({
  name: z.string().min(1, 'Informe o título da ficha'),
  description: z.string().optional(),
  service_id: z.string().optional(),
  max_users: z.coerce.number().int('Deve ser um número inteiro').min(0).optional(),
  max_storage_gb: z.coerce.number().min(0).optional(),
  max_traffic_gb: z.coerce.number().min(0).optional(),
  max_pages: z.coerce.number().int('Deve ser um número inteiro').min(0).optional(),
  max_emails: z.coerce.number().int('Deve ser um número inteiro').min(0).optional(),
  max_domains: z.coerce.number().int('Deve ser um número inteiro').min(0).optional(),
  support_hours: z.coerce.number().min(0).optional(),
  sla_id: z.string().optional(),
  sla_description: z.string().optional(),
  reajuste_index: z.string().optional(),
  is_active: z.boolean(),
})

export type PlanFormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: PlanCatalogRow | null
  onSave: (values: PlanFormData) => Promise<void>
}

interface ServiceOption {
  id: string
  title: string
  monthly_value: number | null
  is_active: boolean | null
}

const numberValue = (v: unknown): number | undefined =>
  v === null || v === undefined || v === ('' as unknown) ? undefined : Number(v)

const loadServices = async (set: (rows: ServiceOption[]) => void) => {
  const { data: rows } = await supabase
    .from('services')
    .select('id, title, monthly_value, is_active')
    .order('title')
  set((rows || []) as ServiceOption[])
}

const loadSlaTypes = async (set: (rows: { id: string; name: string }[]) => void) => {
  const { data: rows } = await supabase
    .from('sla_types')
    .select('id, name, response_time, resolution_time')
    .order('name')
  set((rows || []) as { id: string; name: string }[])
}

// Sugere a descrição de SLA para a ficha a partir do tipo escolhido.
export const slaDescriptionFromType = (
  name: string,
  response?: string | null,
  resolution?: string | null,
) =>
  response && resolution
    ? `Atendimento em até ${response}, resolução em até ${resolution}.`
    : `Atendimento conforme ${name}.`

export function PlanFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [services, setServices] = useState<ServiceOption[]>([])
  const [slaTypes, setSlaTypes] = useState<
    { id: string; name: string; response_time?: string | null; resolution_time?: string | null }[]
  >([])
  const [submitting, setSubmitting] = useState(false)

  const emptyValues = {
    name: '',
    description: '',
    service_id: undefined,
    max_users: undefined,
    max_storage_gb: undefined,
    max_traffic_gb: undefined,
    max_pages: undefined,
    max_emails: undefined,
    max_domains: undefined,
    support_hours: undefined,
    sla_id: undefined,
    sla_description: '',
    reajuste_index: '',
    is_active: true,
  }

  const form = useForm<PlanFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    loadServices(setServices)
    loadSlaTypes(setSlaTypes)
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || '',
        service_id: initialData.service_id || undefined,
        max_users: numberValue(initialData.max_users),
        max_storage_gb: numberValue(initialData.max_storage_gb),
        max_traffic_gb: numberValue(initialData.max_traffic_gb),
        max_pages: numberValue(initialData.max_pages),
        max_emails: numberValue(initialData.max_emails),
        max_domains: numberValue(initialData.max_domains),
        support_hours: numberValue(initialData.support_hours),
        sla_id: initialData.sla_id || undefined,
        sla_description: initialData.sla_description || '',
        reajuste_index: initialData.reajuste_index || '',
        is_active: initialData.is_active !== false,
      })
    } else {
      form.reset(emptyValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData])

  const selectedService = services.find((s) => s.id === form.watch('service_id'))

  const onSubmit = async (values: PlanFormData) => {
    setSubmitting(true)
    try {
      await onSave(values)
    } finally {
      setSubmitting(false)
    }
  }

  const handleValueChange = <K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) => {
    form.setValue(key, value, { shouldValidate: true })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Ficha de Plano' : 'Nova Ficha de Plano'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="plan-name">Título da Ficha *</Label>
            <Input id="plan-name" placeholder="Ex: CMS - A" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-service">Serviço Vinculado (fonte do preço)</Label>
            <Select
              value={form.watch('service_id') || 'none'}
              onValueChange={(v) => handleValueChange('service_id', v === 'none' ? undefined : v)}
            >
              <SelectTrigger id="plan-service">
                <SelectValue placeholder="Selecione um serviço..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (ficha sem preço)</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                    {s.monthly_value != null
                      ? ` — ${new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(s.monthly_value)}/mês`
                      : ''}
                    {s.is_active === false ? ' (inativo)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              O preço exibido no wizard de contratos vem deste serviço (valor mensal).
            </p>
          </div>

          {selectedService?.monthly_value != null && (
            <p className="text-sm font-medium">
              Preço do plano:{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(selectedService.monthly_value)}
              /mês
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="plan-desc">Descrição</Label>
            <Textarea id="plan-desc" rows={2} {...form.register('description')} />
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-primary">Limites do Anexo I</h4>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="max-users" className="text-xs">
                  Usuários
                </Label>
                <Input id="max-users" type="number" min="0" {...form.register('max_users')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max-storage" className="text-xs">
                  Armazenamento (GB)
                </Label>
                <Input
                  id="max-storage"
                  type="number"
                  min="0"
                  {...form.register('max_storage_gb')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max-traffic" className="text-xs">
                  Tráfego (GB)
                </Label>
                <Input
                  id="max-traffic"
                  type="number"
                  min="0"
                  {...form.register('max_traffic_gb')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max-pages" className="text-xs">
                  Páginas
                </Label>
                <Input id="max-pages" type="number" min="0" {...form.register('max_pages')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max-emails" className="text-xs">
                  E-mails
                </Label>
                <Input id="max-emails" type="number" min="0" {...form.register('max_emails')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max-domains" className="text-xs">
                  Domínios
                </Label>
                <Input id="max-domains" type="number" min="0" {...form.register('max_domains')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="support-hours" className="text-xs">
                  Franquia de Suporte (h/mês)
                </Label>
                <Input
                  id="support-hours"
                  type="number"
                  min="0"
                  {...form.register('support_hours')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sla-id" className="text-xs">
                  SLA
                </Label>
                <Select
                  value={form.watch('sla_id') || 'none'}
                  onValueChange={(v) => {
                    handleValueChange('sla_id', v === 'none' ? undefined : v)
                    const sla = slaTypes.find((s) => s.id === v)
                    if (sla) {
                      handleValueChange(
                        'sla_description',
                        slaDescriptionFromType(sla.name, sla.response_time, sla.resolution_time),
                      )
                    }
                  }}
                >
                  <SelectTrigger id="sla-id">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {slaTypes.map((sla) => (
                      <SelectItem key={sla.id} value={sla.id}>
                        {sla.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reajuste" className="text-xs">
                  Índice de Reajuste
                </Label>
                <Input id="reajuste" placeholder="Ex: IPCA" {...form.register('reajuste_index')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sla-desc" className="text-xs">
                Descrição do SLA
              </Label>
              <Input id="sla-desc" {...form.register('sla_description')} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="plan-active">Ficha Ativa</Label>
              <p className="text-xs text-muted-foreground">
                Planos inativos não aparecem no wizard, mas contratos antigos continuam legíveis.
              </p>
            </div>
            <Switch
              id="plan-active"
              checked={form.watch('is_active')}
              onCheckedChange={(v) => handleValueChange('is_active', v)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
