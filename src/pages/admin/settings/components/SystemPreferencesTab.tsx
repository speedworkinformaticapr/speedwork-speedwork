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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SystemDataFormValues } from '../schema'

export function SystemPreferencesTab({ form }: { form: UseFormReturn<SystemDataFormValues> }) {
  return (
    <div className="space-y-6">
      {/* Inteligência Artificial Contexto */}
      <Card>
        <CardHeader>
          <CardTitle>Contexto Base para Inteligência Artificial</CardTitle>
          <CardDescription>
            Informações sobre o negócio fornecidas como contexto aos assistentes e na geração de
            posts do blog.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="ai_context"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contexto Corporativo / Instruções Globais</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Insira as informações de contexto que a IA deve saber sobre a sua organização..."
                    className="min-h-[220px] resize-y font-mono text-sm leading-relaxed"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Esse texto é injetado no prompt de sistema das edge functions de geração de
                  conteúdo e IA.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Preferências de Segurança e Acesso */}
      <Card>
        <CardHeader>
          <CardTitle>Segurança e Autenticação</CardTitle>
          <CardDescription>
            Controle de autenticação em dois fatores e políticas de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="two_factor_auth"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Exigir 2FA para Administradores</FormLabel>
                    <FormDescription>
                      Obriga o uso de autenticação de dois fatores no login administrativo.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="two_factor_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de 2FA Padrão</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'email'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Código via E-mail</SelectItem>
                      <SelectItem value="sms">SMS / WhatsApp</SelectItem>
                      <SelectItem value="authenticator">Aplicativo Autenticador (TOTP)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Canal prioritário para envio do código de verificação.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exibição e Recursos no Site */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Visuais e Acessibilidade</CardTitle>
          <CardDescription>
            Controle a exibição de recursos complementares no site público.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="show_contact_bar"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Barra de Contato Superior</FormLabel>
                    <FormDescription>
                      Exibe a barra com e-mail e telefone no topo do site.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accessibility_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Menu de Acessibilidade</FormLabel>
                    <FormDescription>
                      Ativa o widget flutuante de contraste e tamanho de fonte.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cookie_consent_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Banner de Consentimento LGPD</FormLabel>
                    <FormDescription>
                      Exibe o banner de aceite de cookies para visitantes.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
