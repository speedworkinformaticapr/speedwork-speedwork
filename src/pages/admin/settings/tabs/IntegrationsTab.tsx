import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function IntegrationsTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, watch } = useForm()
  const [maintenanceId, setMaintenanceId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const [sysRes, maintRes] = await Promise.all([
        supabase
          .from('system_data')
          .select('integrations')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .single(),
        supabase.from('maintenance_config').select('*').limit(1).maybeSingle(),
      ])

      if (sysRes.data?.integrations) {
        const ints = sysRes.data.integrations as any
        setValue('google_analytics_id', ints.google_analytics_id || '')
        setValue('recaptcha_site_key', ints.recaptcha_site_key || '')
        setValue('recaptcha_secret_key', ints.recaptcha_secret_key || '')
      }

      if (maintRes.data) {
        setMaintenanceId(maintRes.data.id)
        setValue('maint_is_active', maintRes.data.is_active || false)
        setValue('maint_title', maintRes.data.title || '')
        setValue('maint_message', maintRes.data.message || '')
        if (maintRes.data.return_date) {
          setValue('maint_return_date', maintRes.data.return_date.substring(0, 16))
        }
        setValue('maint_facebook_url', maintRes.data.facebook_url || '')
        setValue('maint_instagram_url', maintRes.data.instagram_url || '')
        setValue('maint_whatsapp_url', maintRes.data.whatsapp_url || '')
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
      google_analytics_id: data.google_analytics_id,
      recaptcha_site_key: data.recaptcha_site_key,
      recaptcha_secret_key: data.recaptcha_secret_key,
    }

    const p1 = supabase
      .from('system_data')
      .update({ integrations: newIntegrations })
      .eq('id', '00000000-0000-0000-0000-000000000001')

    let p2: any = Promise.resolve({})
    if (maintenanceId) {
      p2 = supabase
        .from('maintenance_config')
        .update({
          is_active: data.maint_is_active,
          title: data.maint_title,
          message: data.maint_message,
          return_date: data.maint_return_date
            ? new Date(data.maint_return_date).toISOString()
            : null,
          facebook_url: data.maint_facebook_url,
          instagram_url: data.maint_instagram_url,
          whatsapp_url: data.maint_whatsapp_url,
        })
        .eq('id', maintenanceId)
    }

    const [res1, res2] = await Promise.all([p1, p2])
    setLoading(false)

    if (res1.error || res2.error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar as configurações.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Integrações salvas com sucesso.' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrações e SEO</CardTitle>
        <CardDescription>
          Configure chaves de API externas e o modo de manutenção do site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Google & Segurança</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Google Analytics Tracking ID (G-XXXXXXX)</Label>
                <Input {...register('google_analytics_id')} />
              </div>
              <div className="space-y-2">
                <Label>reCAPTCHA Site Key</Label>
                <Input {...register('recaptcha_site_key')} />
              </div>
              <div className="space-y-2">
                <Label>reCAPTCHA Secret Key</Label>
                <Input type="password" {...register('recaptcha_secret_key')} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-medium">Modo Manutenção</h3>
              <div className="flex items-center gap-2">
                <Label className="font-normal">Ativar</Label>
                <Switch
                  checked={watch('maint_is_active')}
                  onCheckedChange={(v) => setValue('maint_is_active', v)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input {...register('maint_title')} />
              </div>
              <div className="space-y-2">
                <Label>Data/Hora de Retorno Previsto</Label>
                <Input type="datetime-local" {...register('maint_return_date')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Mensagem</Label>
                <Textarea {...register('maint_message')} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>URL Facebook</Label>
                <Input {...register('maint_facebook_url')} />
              </div>
              <div className="space-y-2">
                <Label>URL Instagram</Label>
                <Input {...register('maint_instagram_url')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>URL WhatsApp</Label>
                <Input {...register('maint_whatsapp_url')} />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
