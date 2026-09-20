import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SystemDataFormValues } from '../schema'

export function SystemIntegrationsTab({ form }: { form: UseFormReturn<SystemDataFormValues> }) {
  const activeGateway = form.watch('active_payment_gateway') || 'stripe'

  return (
    <div className="space-y-6">
      {/* Gateway de Pagamento Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Gateway de Pagamento Ativo</CardTitle>
          <CardDescription>
            Selecione qual provedor processa os pagamentos gerais da plataforma e o ambiente ativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="active_payment_gateway"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gateway Ativo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'stripe'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="asaas">Asaas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Define o provedor padrão utilizado no checkout e cobranças.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_environment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ambiente de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'sandbox'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
                      <SelectItem value="production">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Alterne entre o modo de testes e modo de produção.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground">
            Dica: Credenciais detalhadas, taxas e webhooks do Stripe e Asaas também podem ser
            configurados na aba <strong>Financeiro</strong>.
          </div>
        </CardContent>
      </Card>

      {/* OpenAI e Inteligência Artificial */}
      <Card>
        <CardHeader>
          <CardTitle>OpenAI e Inteligência Artificial</CardTitle>
          <CardDescription>
            Chaves de API para geração de posts de blog, tradução e assistentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="openai_environment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ambiente OpenAI</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'test'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ambiente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="test">Testes Internos (chave de teste)</SelectItem>
                      <SelectItem value="production">Produção (chave de produção)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    A edge function usará a chave correspondente ao ambiente ativo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="blog_ai_model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo de IA Padrão (Blog / Geração)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'gpt-4o-mini'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Rápido e Econômico)</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o (Avançado / Multimodal)</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Legado)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="openai_api_key_test"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI API Key (Testes)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      value={field.value || ''}
                      placeholder="sk-..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="openai_api_key_production"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI API Key (Produção)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      value={field.value || ''}
                      placeholder="sk-proj-..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Google Maps e Places */}
      <Card>
        <CardHeader>
          <CardTitle>Google Maps e Google Places</CardTitle>
          <CardDescription>
            Configuração de mapas dinâmicos e sincronização de avaliações do Google Meu Negócio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="google_maps_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps API Key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      value={field.value || ''}
                      placeholder="AIzaSy..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="google_place_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Place ID</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="ChIJ..." />
                  </FormControl>
                  <FormDescription>
                    Identificador do seu local no Google Maps para busca de avaliações.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* reCAPTCHA e Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Google reCAPTCHA v2 / v3</CardTitle>
          <CardDescription>
            Proteção contra spams em formulários de contato e agendamento público.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="recaptcha_site_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>reCAPTCHA Site Key (Pública)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="6L..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recaptcha_secret_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>reCAPTCHA Secret Key (Privada)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      value={field.value || ''}
                      placeholder="6L..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Disparo de E-mails Transacionais (SMTP2GO) */}
      <Card>
        <CardHeader>
          <CardTitle>E-mails Transacionais (SMTP2GO)</CardTitle>
          <CardDescription>
            API para envio de confirmações de agendamento, orçamentos e notificações por e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="smtp_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP2GO API Key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      value={field.value || ''}
                      placeholder="api-..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smtp_sender_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail Remetente Autorizado</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      value={field.value || ''}
                      placeholder="contato@empresa.com"
                    />
                  </FormControl>
                  <FormDescription>
                    Endereço de e-mail verificado no painel da SMTP2GO.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logística e Marketplaces (Correios & Mercado Livre) */}
      <Card>
        <CardHeader>
          <CardTitle>Logística e E-commerce (Correios e Mercado Livre)</CardTitle>
          <CardDescription>
            Integrações para cálculo de frete e sincronização com marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="correios_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correios Token de Acesso</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      value={field.value || ''}
                      placeholder="Token CWS Correios"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mercadolivre_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mercado Livre Access Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      value={field.value || ''}
                      placeholder="APP_USR-..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
