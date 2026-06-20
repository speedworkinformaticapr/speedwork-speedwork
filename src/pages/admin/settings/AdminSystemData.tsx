import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import { systemDataSchema, type SystemDataFormValues } from './schema'
import { SystemBrandingTab } from './components/SystemBrandingTab'
import { SystemBusinessTab } from './components/SystemBusinessTab'
import { SystemTechnicalTab } from './components/SystemTechnicalTab'
import { SystemScheduleTab } from './components/SystemScheduleTab'
import { SystemUiTab } from './components/SystemUiTab'
import { SystemLegalTab } from './components/SystemLegalTab'
import { SystemFinancialTab } from './components/SystemFinancialTab'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

export default function AdminSystemData() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const form = useForm<SystemDataFormValues>({
    resolver: zodResolver(systemDataSchema),
    defaultValues: {},
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sysRes, stripeRes, asaasRes] = await Promise.all([
          supabase.from('system_data').select('*').eq('id', TENANT_ID).single(),
          supabase.from('stripe_config').select('*').eq('tenant_id', TENANT_ID).maybeSingle(),
          supabase.from('asaas_config').select('*').eq('tenant_id', TENANT_ID).maybeSingle(),
        ])

        const sys = sysRes.data || {}
        const stripe = stripeRes.data || {}
        const asaas = asaasRes.data || {}

        form.reset({
          platform_name: sys.platform_name || '',
          slogan: sys.slogan || '',
          logo_url: sys.logo_url || '',
          browser_icon_url: sys.browser_icon_url || '',
          menu_logo_size: sys.menu_logo_size || 100,
          active_theme: sys.active_theme || 'system',
          razao_social: sys.razao_social || '',
          cnpj: sys.cnpj || '',
          show_cnpj: sys.show_cnpj ?? true,
          email: sys.email || '',
          phone: sys.phone || '',
          mobile: sys.mobile || '',
          address_street: sys.address_street || '',
          address_number: sys.address_number || '',
          address_complement: sys.address_complement || '',
          address_city: sys.address_city || '',
          address_state: sys.address_state || '',
          address_zip: sys.address_zip || '',
          responsible_name: sys.responsible_name || '',
          responsible_cpf: sys.responsible_cpf || '',
          responsible_role: sys.responsible_role || '',
          responsible_email: sys.responsible_email || '',
          responsible_phone: sys.responsible_phone || '',
          business_hours: JSON.stringify(sys.business_hours || {}, null, 2),
          scheduling_interval_minutes: sys.scheduling_interval_minutes || 30,
          quote_validity_days: sys.quote_validity_days || 15,
          records_per_page: sys.records_per_page || 50,
          session_lifetime: sys.session_lifetime || 24,
          dark_mode: sys.dark_mode ?? false,
          language: sys.language || 'pt',
          libras_enabled: sys.libras_enabled ?? false,
          footer_icon_size: sys.footer_icon_size || 100,
          terms_uso: sys.terms?.uso || '',
          terms_lgpd: sys.terms?.lgpd || '',
          terms_cookies: sys.terms?.cookies || '',
          stripe_public_key: stripe.public_key || '',
          stripe_secret_key: stripe.secret_key || '',
          stripe_webhook_secret: stripe.webhook_secret || '',
          stripe_pix_enabled: stripe.pix_enabled ?? false,
          stripe_pass_fees_to_customer: stripe.pass_fees_to_customer ?? false,
          stripe_card_fee_percentage: stripe.card_fee_percentage || 0,
          stripe_card_fee_fixed: stripe.card_fee_fixed || 0,
          asaas_production_key: asaas.production_key || '',
          asaas_sandbox_key: asaas.sandbox_key || '',
          asaas_webhook_secret: asaas.webhook_secret || '',
          asaas_payment_environment: asaas.payment_environment || 'sandbox',
        })
      } catch (err) {
        toast({ title: 'Erro', description: 'Falha ao carregar dados.', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [form, toast])

  const onSubmit = async (values: SystemDataFormValues) => {
    setSaving(true)
    try {
      let businessHours = {}
      try {
        businessHours = JSON.parse(values.business_hours || '{}')
      } catch (e) {
        throw new Error('Formato JSON inválido em Horários de Funcionamento.')
      }

      const dayNames: Record<string, string> = {
        monday: 'Segunda-feira',
        tuesday: 'Terça-feira',
        wednesday: 'Quarta-feira',
        thursday: 'Quinta-feira',
        friday: 'Sexta-feira',
        saturday: 'Sábado',
        sunday: 'Domingo',
      }

      for (const [day, data] of Object.entries(businessHours)) {
        const d = data as any
        const dayName = dayNames[day] || day
        if (d.active) {
          if (d.open >= d.close) {
            throw new Error(`Fechamento deve ser após a abertura (${dayName}).`)
          }
          if (d.has_lunch_break) {
            if (d.lunch_start < d.open) {
              throw new Error(`Almoço começa antes da abertura (${dayName}).`)
            }
            if (d.lunch_end > d.close) {
              throw new Error(`Almoço termina após o fechamento (${dayName}).`)
            }
            if (d.lunch_start >= d.lunch_end) {
              throw new Error(`Fim do almoço deve ser após o início (${dayName}).`)
            }
          }
        }
      }

      await supabase.from('system_data').upsert({
        id: TENANT_ID,
        platform_name: values.platform_name,
        slogan: values.slogan,
        logo_url: values.logo_url,
        browser_icon_url: values.browser_icon_url,
        menu_logo_size: values.menu_logo_size,
        active_theme: values.active_theme,
        razao_social: values.razao_social,
        cnpj: values.cnpj,
        show_cnpj: values.show_cnpj,
        email: values.email,
        phone: values.phone,
        mobile: values.mobile,
        address_street: values.address_street,
        address_number: values.address_number,
        address_complement: values.address_complement,
        address_city: values.address_city,
        address_state: values.address_state,
        address_zip: values.address_zip,
        responsible_name: values.responsible_name,
        responsible_cpf: values.responsible_cpf,
        responsible_role: values.responsible_role,
        responsible_email: values.responsible_email,
        responsible_phone: values.responsible_phone,
        business_hours: businessHours,
        scheduling_interval_minutes: values.scheduling_interval_minutes,
        quote_validity_days: values.quote_validity_days,
        records_per_page: values.records_per_page,
        session_lifetime: values.session_lifetime,
        dark_mode: values.dark_mode,
        language: values.language,
        libras_enabled: values.libras_enabled,
        footer_icon_size: values.footer_icon_size,
        terms: {
          uso: values.terms_uso,
          lgpd: values.terms_lgpd,
          cookies: values.terms_cookies,
        },
      })

      await supabase.from('stripe_config').upsert(
        {
          tenant_id: TENANT_ID,
          public_key: values.stripe_public_key,
          secret_key: values.stripe_secret_key,
          webhook_secret: values.stripe_webhook_secret,
          pix_enabled: values.stripe_pix_enabled,
          pass_fees_to_customer: values.stripe_pass_fees_to_customer,
          card_fee_percentage: values.stripe_card_fee_percentage,
          card_fee_fixed: values.stripe_card_fee_fixed,
        },
        { onConflict: 'tenant_id' },
      )

      await supabase.from('asaas_config').upsert(
        {
          tenant_id: TENANT_ID,
          production_key: values.asaas_production_key,
          sandbox_key: values.asaas_sandbox_key,
          webhook_secret: values.asaas_webhook_secret,
          payment_environment: values.asaas_payment_environment,
        },
        { onConflict: 'tenant_id' },
      )

      toast({ title: 'Sucesso', description: 'Configurações salvas.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dados do Sistema</h1>
          <p className="text-muted-foreground">
            Configure as informações e integrações da plataforma.
          </p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" /> Salvar Alterações
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="branding" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-2 justify-start mb-6">
              <TabsTrigger value="branding">Identidade e Branding</TabsTrigger>
              <TabsTrigger value="business">Negócio</TabsTrigger>
              <TabsTrigger value="technical">Responsável</TabsTrigger>
              <TabsTrigger value="schedule">Horários</TabsTrigger>
              <TabsTrigger value="ui">Interface</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
            </TabsList>

            <TabsContent value="branding">
              <SystemBrandingTab form={form} />
            </TabsContent>
            <TabsContent value="business">
              <SystemBusinessTab form={form} />
            </TabsContent>
            <TabsContent value="technical">
              <SystemTechnicalTab form={form} />
            </TabsContent>
            <TabsContent value="schedule">
              <SystemScheduleTab form={form} />
            </TabsContent>
            <TabsContent value="ui">
              <SystemUiTab form={form} />
            </TabsContent>
            <TabsContent value="legal">
              <SystemLegalTab form={form} />
            </TabsContent>
            <TabsContent value="financial">
              <SystemFinancialTab form={form} />
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}
