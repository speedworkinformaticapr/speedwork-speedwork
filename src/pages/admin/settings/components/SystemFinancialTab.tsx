import { UseFormReturn } from 'react-hook-form'
import { SystemDataFormValues } from '../schema'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function SystemFinancialTab({ form }: { form: UseFormReturn<SystemDataFormValues> }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integração Stripe</CardTitle>
          <CardDescription>Configurações para o gateway de pagamentos Stripe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="stripe_public_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave Pública</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stripe_secret_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave Secreta</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stripe_webhook_secret"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Segredo do Webhook</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stripe_card_fee_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxa do Cartão (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stripe_card_fee_fixed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxa Fixa do Cartão (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <FormField
              control={form.control}
              name="stripe_pix_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativar Pix</FormLabel>
                    <FormDescription>Habilita pagamento via Pix no Stripe.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stripe_pass_fees_to_customer"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Repassar Taxas</FormLabel>
                    <FormDescription>Adiciona o valor da taxa ao total do cliente.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integração Asaas</CardTitle>
          <CardDescription>Configurações para o gateway de pagamentos Asaas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="asaas_payment_environment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ambiente de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'sandbox'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ambiente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
                      <SelectItem value="production">Produção (Real)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="asaas_sandbox_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave da API (Sandbox)</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="asaas_production_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave da API (Produção)</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="asaas_webhook_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Segredo do Webhook (Asaas)</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} value={field.value || ''} />
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
