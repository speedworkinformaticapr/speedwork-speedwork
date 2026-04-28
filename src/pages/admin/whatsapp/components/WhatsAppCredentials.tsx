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
  is_active: z.boolean().default(false),
  is_production: z.boolean().default(false),
})

export default function WhatsAppCredentials() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [configId, setConfigId] = useState<string | null>(null)

  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      api_provider: 'evolution',
      account_sid: '',
      auth_token: '',
      phone_number: '',
      is_active: false,
      is_production: false,
    },
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  async function fetchConfig() {
    try {
      const { data, error } = await supabase.from('whatsapp_config').select('*').limit(1).single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setConfigId(data.id)
        form.reset({
          api_provider: data.api_provider || 'evolution',
          account_sid: data.account_sid || '',
          auth_token: data.auth_token || '',
          phone_number: data.phone_number || '',
          is_active: data.is_active || false,
          is_production: (data as any).is_production || false,
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
      const { data: userData } = await supabase.auth.getUser()
      const { data, error } = await supabase.functions.invoke('enviar_whatsapp', {
        body: {
          empresa_id: userData.user?.id,
          tipo_mensagem: 'teste_conexao',
          telefone_destino: testPhone,
        },
      })

      if (error) throw error
      if (data?.status === 'erro_config') throw new Error(data.erro)
      if (data?.status === 'falha')
        throw new Error('Falha ao enviar a mensagem. Verifique os logs e as credenciais.')

      toast({
        title: 'Sucesso',
        description: 'Mensagem de teste enviada com sucesso! Verifique o WhatsApp de destino.',
      })
      setIsTestDialogOpen(false)
      setTestPhone('')
    } catch (error: any) {
      toast({
        title: 'Erro no Teste',
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
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id

      if (configId) {
        const { error } = await supabase
          .from('whatsapp_config')
          .update(values as any)
          .eq('id', configId)
        if (error) throw error
      } else {
        const payload: any = { ...values, empresa_id: userId }
        const { error } = await supabase.from('whatsapp_config').insert(payload)
        if (error) throw error
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
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch('api_provider') === 'evolution'
                        ? 'Nome da Instância'
                        : 'Número de Telefone'}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: footgolf-bot" {...field} />
                    </FormControl>
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
                      {form.watch('api_provider') === 'evolution'
                        ? 'URL da API (Base URL)'
                        : 'Account SID'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          form.watch('api_provider') === 'evolution'
                            ? 'https://sua-api.com'
                            : 'AC...'
                        }
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
                      {form.watch('api_provider') === 'evolution' ? 'Global API Key' : 'Auth Token'}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="***" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                          ? 'Ativo: As mensagens serão enviadas de verdade.'
                          : 'Inativo: Modo Sandbox. Envios serão apenas simulados.'}
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
                disabled={isLoading || isFetching}
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
              Será enviada uma mensagem curta ("TESTE") para o número informado. Isso evita o limite
              de comprimento para contas Trial do Twilio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <FormLabel>Número de Destino</FormLabel>
              <Input
                placeholder="Ex: +5511999999999"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Para o Sandbox do Twilio, use o mesmo número de teste cadastrado (incluindo o código
                do país).
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
