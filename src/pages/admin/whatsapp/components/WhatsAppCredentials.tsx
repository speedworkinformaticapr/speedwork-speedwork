import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Loader2, Send } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const formSchema = z.object({
  api_provider: z.string().min(1, 'Selecione um provedor'),
  account_sid: z.string().optional(),
  auth_token: z.string().optional(),
  phone_number: z.string().optional(),
  instance_name: z.string().optional(),
  is_active: z.boolean().default(false),
  is_production: z.boolean().default(false),
})

export default function WhatsAppCredentials() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [configId, setConfigId] = useState<string | null>(null)
  const [empresaId, setEmpresaId] = useState<string | null>(null)

  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      api_provider: 'twilio',
      account_sid: '',
      auth_token: '',
      phone_number: '',
      instance_name: '',
      is_active: false,
      is_production: false,
    },
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  async function fetchConfig() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      let currentEmpresaId = user.id
      const { data: profile } = await supabase
        .from('profiles')
        .select('club_id')
        .eq('id', user.id)
        .maybeSingle()
      if (profile?.club_id) {
        currentEmpresaId = profile.club_id
      }
      setEmpresaId(currentEmpresaId)

      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('empresa_id', currentEmpresaId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setConfigId(data.id)
        form.reset({
          api_provider: data.api_provider || 'twilio',
          account_sid: data.account_sid || '',
          auth_token: data.auth_token || '',
          phone_number: data.phone_number || '',
          instance_name: (data as any).instance_name || '',
          is_active: data.is_active || false,
          is_production: data.is_production || false,
        })
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setIsFetching(false)
    }
  }

  async function onTestConnection() {
    if (!testPhone) {
      toast({
        title: 'Atenção',
        description: 'Informe o número de destino com código do país (ex: +5511999999999)',
        variant: 'destructive',
      })
      return
    }

    setIsTesting(true)
    try {
      const values = form.getValues()
      const payload = {
        ...values,
        test_phone: testPhone,
        empresa_id: empresaId,
      }

      const { data, error } = await supabase.functions.invoke('validar_whatsapp_config', {
        body: payload,
      })

      if (error) throw error
      if (!data?.valido) {
        throw new Error(data?.mensagem || 'Falha ao validar a conexão.')
      }

      toast({
        title: 'Sucesso',
        description: data.mensagem || 'Mensagem de teste enviada com sucesso!',
      })
      setIsTestDialogOpen(false)
      setTestPhone('')
    } catch (error: any) {
      toast({
        title: 'Erro na Validação',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsTesting(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      if (!empresaId) throw new Error('Não foi possível identificar a empresa do usuário.')

      const payload: any = { ...values, empresa_id: empresaId }

      if (configId) {
        const { error } = await supabase.from('whatsapp_config').update(payload).eq('id', configId)
        if (error) throw error
      } else {
        const { data: existing } = await supabase
          .from('whatsapp_config')
          .select('id')
          .eq('empresa_id', empresaId)
          .maybeSingle()
        if (existing) {
          const { error } = await supabase
            .from('whatsapp_config')
            .update(payload)
            .eq('id', existing.id)
          if (error) throw error
          setConfigId(existing.id)
        } else {
          const { data, error } = await supabase
            .from('whatsapp_config')
            .insert(payload)
            .select()
            .single()
          if (error) throw error
          setConfigId(data.id)
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso.',
      })
      fetchConfig()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const provider = form.watch('api_provider')
  const sid = form.watch('account_sid')
  const token = form.watch('auth_token')
  const instance = form.watch('instance_name')
  const phone = form.watch('phone_number')

  const isTestDisabled =
    isLoading ||
    isFetching ||
    !empresaId ||
    !sid ||
    !token ||
    (provider === 'evolution' ? !instance : !phone)

  if (isFetching) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credenciais da API</CardTitle>
        <CardDescription>
          Configure as credenciais do seu provedor de WhatsApp (Evolution API ou Twilio).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="api_provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provedor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o provedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="evolution">Evolution API</SelectItem>
                        <SelectItem value="twilio">Twilio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="account_sid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {provider === 'evolution' ? 'URL da API (Base URL)' : 'Account SID'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={provider === 'evolution' ? 'https://sua-api.com' : 'AC...'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auth_token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {provider === 'evolution' ? 'Global API Key' : 'Auth Token'}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="***" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {provider === 'evolution' ? (
                <FormField
                  control={form.control}
                  name="instance_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Instância</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: footgolf-bot" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Telefone (Sender)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: +1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full sm:w-1/2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Integração Ativa</FormLabel>
                      <FormDescription>Habilita o uso do WhatsApp no sistema.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_production"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full sm:w-1/2 bg-slate-50 dark:bg-slate-900">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-semibold text-primary">
                        Modo Produção
                      </FormLabel>
                      <FormDescription>
                        {field.value
                          ? 'Ativo: Mensagens enviadas de verdade.'
                          : 'Inativo: Modo Sandbox (Twilio).'}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configurações
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTestDialogOpen(true)}
                disabled={isTestDisabled}
                className="w-full sm:w-auto"
              >
                <Send className="mr-2 h-4 w-4" />
                Testar Conexão
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testar Conexão WhatsApp</DialogTitle>
            <DialogDescription>
              Será enviada uma mensagem curta ("TESTE") para o número informado utilizando os dados
              configurados acima.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Número de Destino</Label>
              <Input
                placeholder="Ex: +5511999999999"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Para o Sandbox do Twilio, use o número de teste cadastrado no painel.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTestDialogOpen(false)}
              disabled={isTesting}
            >
              Cancelar
            </Button>
            <Button onClick={onTestConnection} disabled={isTesting}>
              {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Teste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
