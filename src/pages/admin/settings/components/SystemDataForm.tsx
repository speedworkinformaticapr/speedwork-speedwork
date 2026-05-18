import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save } from 'lucide-react'
import { useSystemData } from '@/hooks/use-system-data'
import { useToast } from '@/hooks/use-toast'
import { systemDataSchema, SystemDataFormData } from './SystemDataSchema'

import { VisualIdentityTab } from './tabs/VisualIdentityTab'
import { ExternalIntegrationsTab } from './tabs/ExternalIntegrationsTab'
import { TermsTab } from './tabs/TermsTab'
import { QuotesOrdersTab } from './tabs/QuotesOrdersTab'
import { BusinessHoursTab } from './tabs/BusinessHoursTab'
import { SystemPreferencesTab } from './tabs/SystemPreferencesTab'
import { FooterSettingsTab } from './tabs/FooterSettingsTab'

export default function SystemDataForm() {
  const { data, loading, updateData } = useSystemData()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<SystemDataFormData>({
    resolver: zodResolver(systemDataSchema),
    defaultValues: {
      records_per_page: 50,
      bg_opacity: 100,
    },
  })

  useEffect(() => {
    if (data) {
      form.reset({
        ...data,
        records_per_page: data.records_per_page || 50,
        bg_opacity: data.bg_opacity ?? 100,
        active_theme: data.active_theme || 'system',
        menu_logo_size: data.menu_logo_size ?? 100,
        footer_icon_size: (data as any).footer_icon_size ?? 100,
        short_description: (data as any).short_description || '',
        dark_mode: data.dark_mode ?? false,
        libras_enabled: data.libras_enabled ?? false,
        bg_image_url: data.bg_image_url || '',
        platform_name: data.platform_name || '',
        email: data.email || '',
        browser_icon_url: data.browser_icon_url || '',
        show_cnpj: data.show_cnpj ?? true,
        show_contact_bar: data.show_contact_bar ?? true,
        session_lifetime: data.session_lifetime || 24,
        ai_context: data.ai_context || '',
        language: data.language || 'pt',
        two_factor_auth: data.two_factor_auth ?? false,
        two_factor_method: data.two_factor_method || 'email',
        instagram: data.integrations?.instagram || '',
        facebook: data.integrations?.facebook || '',
        youtube: data.integrations?.youtube || '',
        recaptcha_site_key: data.integrations?.recaptcha_site_key || '',
        recaptcha_secret_key: data.integrations?.recaptcha_secret_key || '',
        smtp_key: data.integrations?.smtp_key || '',
        correios_token: data.integrations?.correios_token || '',
        mercadolivre_token: data.integrations?.mercadolivre_token || '',
        stripe_public_key: data.integrations?.stripe_public_key || '',
        stripe_secret_key: data.integrations?.stripe_secret_key || '',
        whatsapp_enabled: data.integrations?.whatsapp_enabled || false,
        accessibility_enabled: data.integrations?.accessibility_enabled ?? true,
        cookie_consent_enabled: data.integrations?.cookie_consent_enabled ?? true,
        whatsapp_number: data.integrations?.whatsapp_number || '',
        google_maps_key: data.integrations?.google_maps_key || '',
        google_place_id: data.integrations?.google_place_id || '',
        active_payment_gateway: data.integrations?.active_payment_gateway || 'stripe',
        payment_environment: data.integrations?.payment_environment || 'sandbox',
        asaas_api_key: data.integrations?.asaas_api_key || '',
        openai_api_key_test: data.integrations?.openai_api_key_test || '',
        openai_api_key_production: data.integrations?.openai_api_key_production || '',
        openai_environment: data.integrations?.openai_environment || 'test',
        term_content_uso: data.terms?.uso || '',
        term_content_lgpd: data.terms?.lgpd || '',
        term_content_cookies: data.terms?.cookies || '',
        footer_links: data.footer_links || { columns: 3, links: [] },
        business_hours: data.business_hours || {
          monday: {
            is_open: true,
            open_time: '08:00',
            close_time: '18:00',
            lunch_start: '12:00',
            lunch_end: '13:00',
          },
          tuesday: {
            is_open: true,
            open_time: '08:00',
            close_time: '18:00',
            lunch_start: '12:00',
            lunch_end: '13:00',
          },
          wednesday: {
            is_open: true,
            open_time: '08:00',
            close_time: '18:00',
            lunch_start: '12:00',
            lunch_end: '13:00',
          },
          thursday: {
            is_open: true,
            open_time: '08:00',
            close_time: '18:00',
            lunch_start: '12:00',
            lunch_end: '13:00',
          },
          friday: {
            is_open: true,
            open_time: '08:00',
            close_time: '18:00',
            lunch_start: '12:00',
            lunch_end: '13:00',
          },
          saturday: {
            is_open: true,
            open_time: '08:00',
            close_time: '12:00',
            lunch_start: '',
            lunch_end: '',
          },
          sunday: { is_open: false, open_time: '', close_time: '', lunch_start: '', lunch_end: '' },
        },
      })
    }
  }, [data, form])

  const { toast } = useToast()

  const onError = (errors: any) => {
    console.error('Erros de validação do formulário:', errors)

    const fieldNames: Record<string, string> = {
      stripe_public_key: 'Chave Pública Stripe',
      stripe_secret_key: 'Chave Secreta Stripe',
      records_per_page: 'Registros por página',
      bg_opacity: 'Opacidade do Fundo',
      menu_logo_size: 'Tamanho da Logo',
      footer_icon_size: 'Tamanho do Ícone (Rodapé)',
      platform_name: 'Título',
      short_description: 'Texto Curto',
      email: 'E-mail Principal',
    }

    const errorList = Object.entries(errors).map(([key, err]: [string, any]) => {
      const fieldName = fieldNames[key] || key
      return `${fieldName}: ${err.message || 'Campo inválido'}`
    })

    toast({
      title: 'Erros de validação',
      description: (
        <div className="mt-2 text-sm flex flex-col gap-1">
          <p>Verifique os seguintes campos antes de salvar:</p>
          <ul className="list-disc pl-4">
            {errorList.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      ),
      variant: 'destructive',
    })
  }

  const onSubmit = async (values: SystemDataFormData) => {
    setIsSaving(true)
    try {
      const payload = {
        logo_url: values.logo_url,
        menu_logo_size: values.menu_logo_size,
        footer_icon_size: values.footer_icon_size,
        platform_name: values.platform_name,
        slogan: values.slogan,
        short_description: values.short_description,
        cnpj: values.cnpj,
        razao_social: values.razao_social,
        address_street: values.address_street,
        address_number: values.address_number,
        address_complement: values.address_complement,
        address_city: values.address_city,
        address_state: values.address_state,
        address_zip: values.address_zip,
        phone: values.phone,
        email: values.email,
        mobile: values.mobile,
        responsible_name: values.responsible_name,
        responsible_cpf: values.responsible_cpf,
        responsible_role: values.responsible_role,
        responsible_email: values.responsible_email,
        responsible_phone: values.responsible_phone,
        dark_mode: values.dark_mode ?? false,
        libras_enabled: values.libras_enabled ?? false,
        records_per_page: values.records_per_page || 50,
        quote_footer_text: values.quote_footer_text,
        bg_image_url: values.bg_image_url,
        bg_opacity: values.bg_opacity,
        active_theme: values.active_theme,
        business_hours: values.business_hours,
        browser_icon_url: values.browser_icon_url,
        show_cnpj: values.show_cnpj,
        show_contact_bar: values.show_contact_bar,
        session_lifetime: values.session_lifetime,
        ai_context: values.ai_context,
        language: values.language,
        two_factor_auth: values.two_factor_auth,
        two_factor_method: values.two_factor_method,
        integrations: {
          ...data?.integrations,
          instagram: values.instagram,
          facebook: values.facebook,
          youtube: values.youtube,
          recaptcha_site_key: values.recaptcha_site_key,
          recaptcha_secret_key: values.recaptcha_secret_key,
          smtp_key: values.smtp_key,
          correios_token: values.correios_token,
          mercadolivre_token: values.mercadolivre_token,
          stripe_public_key: values.stripe_public_key,
          stripe_secret_key: values.stripe_secret_key,
          whatsapp_enabled: values.whatsapp_enabled,
          accessibility_enabled: values.accessibility_enabled,
          cookie_consent_enabled: values.cookie_consent_enabled,
          whatsapp_number: values.whatsapp_number,
          google_maps_key: values.google_maps_key,
          google_place_id: values.google_place_id,
          active_payment_gateway: values.active_payment_gateway,
          payment_environment: values.payment_environment,
          asaas_api_key: values.asaas_api_key,
          openai_api_key_test: values.openai_api_key_test,
          openai_api_key_production: values.openai_api_key_production,
          openai_environment: values.openai_environment,
        },
        terms: {
          uso: values.term_content_uso,
          lgpd: values.term_content_lgpd,
          cookies: values.term_content_cookies,
        },
        footer_links: values.footer_links,
      }

      const success = await updateData(payload as any)
      if (!success) {
        console.warn('O salvamento falhou na camada de serviço.')
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Erro inesperado na aplicação.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="flex flex-wrap w-full h-auto bg-muted/50 p-1 justify-start">
            <TabsTrigger value="visual" className="flex-1 text-sm md:text-base whitespace-nowrap">
              Identidade Visual
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="flex-1 text-sm md:text-base whitespace-nowrap"
            >
              Integrações Externas
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex-1 text-sm md:text-base whitespace-nowrap">
              Termos e Políticas
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex-1 text-sm md:text-base whitespace-nowrap">
              Orçamentos/Pedidos
            </TabsTrigger>
            <TabsTrigger
              value="business_hours"
              className="flex-1 text-sm md:text-base whitespace-nowrap"
            >
              Horários de Funcionamento
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex-1 text-sm md:text-base whitespace-nowrap"
            >
              Preferências do Sistema
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex-1 text-sm md:text-base whitespace-nowrap">
              Rodapé / Textos
            </TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="visual">
              <VisualIdentityTab form={form} />
            </TabsContent>
            <TabsContent value="integrations">
              <ExternalIntegrationsTab form={form} />
            </TabsContent>
            <TabsContent value="terms">
              <TermsTab form={form} />
            </TabsContent>
            <TabsContent value="quotes">
              <QuotesOrdersTab form={form} />
            </TabsContent>
            <TabsContent value="business_hours">
              <BusinessHoursTab form={form} />
            </TabsContent>
            <TabsContent value="preferences">
              <SystemPreferencesTab form={form} />
            </TabsContent>
            <TabsContent value="footer">
              <FooterSettingsTab form={form} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end pt-6 border-t">
          <Button type="submit" disabled={isSaving} size="lg" className="min-w-[200px] shadow-sm">
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </form>
    </Form>
  )
}
