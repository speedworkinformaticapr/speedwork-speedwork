import { UseFormReturn } from 'react-hook-form'
import { SystemDataFormValues } from '../schema'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

export function SystemLegalTab({ form }: { form: UseFormReturn<SystemDataFormValues> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Termos e Legal</CardTitle>
        <CardDescription>Política de privacidade, LGPD e termos de uso.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="terms_uso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Termos de Uso</FormLabel>
              <FormControl>
                <Textarea className="min-h-[100px]" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terms_lgpd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Política de Privacidade (LGPD)</FormLabel>
              <FormControl>
                <Textarea className="min-h-[100px]" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terms_cookies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Política de Cookies</FormLabel>
              <FormControl>
                <Textarea className="min-h-[100px]" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
