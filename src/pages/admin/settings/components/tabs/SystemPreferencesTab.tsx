import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function SystemPreferencesTab({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="browser_icon_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ícone do Navegador (Favicon URL)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idioma Padrão</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'pt'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pt">Português (BR)</SelectItem>
                  <SelectItem value="en">Inglês</SelectItem>
                  <SelectItem value="es">Espanhol</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="session_lifetime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duração da Sessão (Horas)</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>Tempo em horas para expiração da sessão do usuário</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="two_factor_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de 2FA Padrão</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'email'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="sms">SMS / WhatsApp</SelectItem>
                  <SelectItem value="authenticator">App Autenticador</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md bg-muted/20">
        <FormField
          control={form.control}
          name="show_cnpj"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Mostrar CNPJ no Rodapé</FormLabel>
                <FormDescription>
                  Exibir o CNPJ configurado no rodapé das páginas públicas
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="show_contact_bar"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Barra de Contato</FormLabel>
                <FormDescription>Exibir barra de contato superior no site público</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="two_factor_auth"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2 bg-background">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Exigir Autenticação de 2 Fatores (2FA)</FormLabel>
                <FormDescription>
                  Obrigar todos os administradores a utilizarem autenticação em duas etapas
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="ai_context"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contexto Base para Inteligência Artificial</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Insira as informações de contexto que a IA deve saber sobre a sua organização..."
                className="min-h-[150px] resize-y"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Esse texto será usado para dar contexto às respostas geradas por IA dentro da
              plataforma.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
