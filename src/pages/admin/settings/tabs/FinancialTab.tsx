import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function FinancialTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, watch } = useForm()

  useEffect(() => {
    const fetchData = async () => {
      const [sysRes, stripeRes, billingRes, asaasRes] = await Promise.all([
        supabase
          .from('system_data')
          .select('integrations')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .single(),
        supabase
          .from('stripe_config')
          .select('*')
          .eq('tenant_id', '00000000-0000-0000-0000-000000000001')
          .single(),
        supabase
          .from('billing_configuration')
          .select('*')
          .eq('tenant_id', '00000000-0000-0000-0000-000000000001')
          .single(),
        supabase
          .from('asaas_config' as any)
          .select('*')
          .eq('tenant_id', '00000000-0000-0000-0000-000000000001')
          .maybeSingle(),
      ])

      if (sysRes.data?.integrations) {
        const ints = sysRes.data.integrations as any
        setValue('payment_environment', ints.payment_environment || 'sandbox')
        setValue('active_payment_gateway', ints.active_payment_gateway || 'stripe')
      }

      if (stripeRes.data) {
        setValue('stripe_public_key', stripeRes.data.public_key || '')
        setValue('stripe_secret_key', stripeRes.data.secret_key || '')
        setValue('stripe_webhook_secret', stripeRes.data.webhook_secret || '')
        setValue('pix_enabled', stripeRes.data.pix_enabled || false)
        setValue('pass_fees_to_customer', stripeRes.data.pass_fees_to_customer || false)
      }

      if (billingRes.data) {
        setValue('auto_generate_enabled', billingRes.data.auto_generate_enabled || false)
        setValue('due_day', billingRes.data.due_day || 10)
        setValue('reminders_enabled', billingRes.data.reminders_enabled || false)
        setValue('reminder_days_before', billingRes.data.reminder_days_before || 3)
        setValue('reminder_days_after', billingRes.data.reminder_days_after || 5)
      }

      if (asaasRes.data) {
        setValue('asaas_production_key', asaasRes.data.production_key || '')
        setValue('asaas_sandbox_key', asaasRes.data.sandbox_key || '')
      }
    }
    fetchData()
  }, [setValue])

  const onSubmit = async (data: any) => {
    setLoading(true)

    const { data: sysData } = await supabase
      .from('system_data')
      .select('integrations')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()
    const newIntegrations = {
      ...((sysData?.integrations as any) || {}),
      asaas_production_key: data.asaas_production_key,
      asaas_sandbox_key: data.asaas_sandbox_key,
      payment_environment: data.payment_environment,
      active_payment_gateway: data.active_payment_gateway,
    }

    const p1 = supabase
      .from('system_data')
      .update({ integrations: newIntegrations })
      .eq('id', '00000000-0000-0000-0000-000000000001')

    const p2 = supabase
      .from('stripe_config')
      .update({
        public_key: data.stripe_public_key,
        secret_key: data.stripe_secret_key,
        webhook_secret: data.stripe_webhook_secret,
        pix_enabled: data.pix_enabled,
        pass_fees_to_customer: data.pass_fees_to_customer,
      })
      .eq('tenant_id', '00000000-0000-0000-0000-000000000001')

    const p3 = supabase
      .from('billing_configuration')
      .update({
        auto_generate_enabled: data.auto_generate_enabled,
        due_day: parseInt(data.due_day),
        reminders_enabled: data.reminders_enabled,
        reminder_days_before: parseInt(data.reminder_days_before),
        reminder_days_after: parseInt(data.reminder_days_after),
      })
      .eq('tenant_id', '00000000-0000-0000-0000-000000000001')

    const p4 = supabase.from('asaas_config' as any).upsert(
      {
        tenant_id: '00000000-0000-0000-0000-000000000001',
        production_key: data.asaas_production_key,
        sandbox_key: data.asaas_sandbox_key,
        payment_environment: data.payment_environment,
      },
      { onConflict: 'tenant_id' },
    )

    const [res1, res2, res3, res4] = await Promise.all([p1, p2, p3, p4])
    setLoading(false)

    if (res1.error || res2.error || res3.error || res4.error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar as configurações.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Configurações financeiras salvas.' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financeiro e Faturamento</CardTitle>
        <CardDescription>Configure os gateways de pagamento e o ciclo de cobrança.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border">
            <div className="space-y-2">
              <Label>Gateway Principal</Label>
              <Select
                value={watch('active_payment_gateway')}
                onValueChange={(v) => setValue('active_payment_gateway', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="asaas">Asaas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ambiente de Pagamento</Label>
              <Select
                value={watch('payment_environment')}
                onValueChange={(v) => setValue('payment_environment', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (Teste)</SelectItem>
                  <SelectItem value="production">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Stripe Configuração</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Public Key</Label>
                <Input {...register('stripe_public_key')} />
              </div>
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <Input type="password" {...register('stripe_secret_key')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Webhook Secret</Label>
                <Input type="password" {...register('stripe_webhook_secret')} />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch('pix_enabled')}
                  onCheckedChange={(v) => setValue('pix_enabled', v)}
                />
                <Label>Habilitar Pix (Stripe)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch('pass_fees_to_customer')}
                  onCheckedChange={(v) => setValue('pass_fees_to_customer', v)}
                />
                <Label>Repassar Taxas ao Cliente</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Asaas Configuração</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>API Key (Produção)</Label>
                <Input type="password" {...register('asaas_production_key')} />
              </div>
              <div className="space-y-2">
                <Label>API Key (Sandbox)</Label>
                <Input type="password" {...register('asaas_sandbox_key')} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Ciclo de Cobrança e Lembretes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Dia de Vencimento Padrão</Label>
                <Input type="number" min="1" max="31" {...register('due_day')} />
              </div>
              <div className="space-y-2">
                <Label>Lembretes: Dias Antes</Label>
                <Input type="number" {...register('reminder_days_before')} />
              </div>
              <div className="space-y-2">
                <Label>Lembretes: Dias Depois</Label>
                <Input type="number" {...register('reminder_days_after')} />
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch('auto_generate_enabled')}
                  onCheckedChange={(v) => setValue('auto_generate_enabled', v)}
                />
                <Label>Gerar Cobranças Automaticamente</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch('reminders_enabled')}
                  onCheckedChange={(v) => setValue('reminders_enabled', v)}
                />
                <Label>Enviar Lembretes de Vencimento</Label>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="mt-4">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
