import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export default function CommunicationTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, watch } = useForm()
  const [waConfigId, setWaConfigId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const [sysRes, waRes] = await Promise.all([
        supabase
          .from('system_data')
          .select('integrations')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .single(),
        supabase.from('whatsapp_config').select('*').limit(1).maybeSingle(),
      ])

      if (sysRes.data?.integrations) {
        const ints = sysRes.data.integrations as any
        setValue('smtp_server', ints.smtp_server || '')
        setValue('smtp_port', ints.smtp_port || '')
        setValue('smtp_user', ints.smtp_user || '')
        setValue('smtp_password', ints.smtp_password || '')
        setValue('smtp_key', ints.smtp_key || '')
      }

      if (waRes.data) {
        setWaConfigId(waRes.data.id)
        setValue('wa_api_provider', waRes.data.api_provider || 'evolution')
        setValue('wa_instance_name', waRes.data.instance_name || '')
        setValue('wa_account_sid', waRes.data.account_sid || '')
        setValue('wa_auth_token', waRes.data.auth_token || '')
        setValue('wa_phone_number', waRes.data.phone_number || '')
        setValue('wa_is_active', waRes.data.is_active || false)
        setValue('wa_is_production', waRes.data.is_production || false)
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
      smtp_server: data.smtp_server,
      smtp_port: data.smtp_port,
      smtp_user: data.smtp_user,
      smtp_password: data.smtp_password,
      smtp_key: data.smtp_key,
    }

    const p1 = supabase
      .from('system_data')
      .update({ integrations: newIntegrations })
      .eq('id', '00000000-0000-0000-0000-000000000001')

    let p2: any = Promise.resolve({})
    if (waConfigId) {
      p2 = supabase
        .from('whatsapp_config')
        .update({
          api_provider: data.wa_api_provider,
          instance_name: data.wa_instance_name,
          account_sid: data.wa_account_sid,
          auth_token: data.wa_auth_token,
          phone_number: data.wa_phone_number,
          is_active: data.wa_is_active,
          is_production: data.wa_is_production,
        })
        .eq('id', waConfigId)
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
      toast({ title: 'Sucesso', description: 'Configurações de comunicação salvas.' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comunicação e WhatsApp</CardTitle>
        <CardDescription>
          Gerencie os provedores de envio de e-mails e a integração com WhatsApp.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Configuração de E-mail (SMTP/SMTP2GO)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Servidor SMTP</Label>
                <Input {...register('smtp_server')} />
              </div>
              <div className="space-y-2">
                <Label>Porta</Label>
                <Input {...register('smtp_port')} />
              </div>
              <div className="space-y-2">
                <Label>Usuário SMTP</Label>
                <Input {...register('smtp_user')} />
              </div>
              <div className="space-y-2">
                <Label>Senha SMTP</Label>
                <Input type="password" {...register('smtp_password')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Chave da API (SMTP2GO)</Label>
                <Input type="password" {...register('smtp_key')} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Integração WhatsApp</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provedor da API</Label>
                <Select
                  value={watch('wa_api_provider')}
                  onValueChange={(v) => setValue('wa_api_provider', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="evolution">Evolution API</SelectItem>
                    <SelectItem value="twilio">Twilio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome da Instância</Label>
                <Input {...register('wa_instance_name')} />
              </div>
              <div className="space-y-2">
                <Label>Account SID / Base URL</Label>
                <Input type="password" {...register('wa_account_sid')} />
              </div>
              <div className="space-y-2">
                <Label>Auth Token / API Key</Label>
                <Input type="password" {...register('wa_auth_token')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Número do Remetente</Label>
                <Input {...register('wa_phone_number')} />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch('wa_is_active')}
                  onCheckedChange={(v) => setValue('wa_is_active', v)}
                />
                <Label>WhatsApp Ativo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch('wa_is_production')}
                  onCheckedChange={(v) => setValue('wa_is_production', v)}
                />
                <Label>Ambiente de Produção</Label>
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
