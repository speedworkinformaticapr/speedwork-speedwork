import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UseFormReturn } from 'react-hook-form'
import { SystemDataFormData } from '../SystemDataSchema'

export function ExternalIntegrationsTab({ form }: { form: UseFormReturn<SystemDataFormData> }) {
  const activeGateway = form.watch('active_payment_gateway') || 'stripe'

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Gateway de Pagamento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="active_payment_gateway"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>API Ativa</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payment_environment"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Ambiente</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />

          {activeGateway === 'stripe' && (
            <>
              <FormField
                control={form.control}
                name="stripe_public_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stripe Public Key</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Stripe Secret Key</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {activeGateway === 'asaas' && (
            <>
              <FormField
                control={form.control}
                name="asaas_production_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asaas Production Key</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="asaas_sandbox_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asaas Sandbox Key</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <div className="col-span-1 md:col-span-2 border-t my-8" />

        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          APIs e Serviços Externos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="google_maps_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google Maps API Key</FormLabel>
                <FormControl>
                  <Input type="password" {...field} value={field.value || ''} />
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
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="openai_environment"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Ambiente OpenAI</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || 'test'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="test">Testes Internos</SelectItem>
                    <SelectItem value="production">Produção</SelectItem>
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
                  <Input type="password" {...field} value={field.value || ''} />
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
                  <Input type="password" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recaptcha_site_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google reCaptcha Site Key</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Google reCaptcha Secret Key</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="smtp_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SMTP2GO API Key</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="correios_token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correios Token</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
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
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
