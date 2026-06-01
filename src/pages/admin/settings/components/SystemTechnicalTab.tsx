import { UseFormReturn } from 'react-hook-form'
import { SystemDataFormValues } from '../schema'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export function SystemTechnicalTab({ form }: { form: UseFormReturn<SystemDataFormValues> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Responsável Técnico</CardTitle>
        <CardDescription>Informações do contato principal e representante legal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="responsible_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Responsável</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="responsible_cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF do Responsável</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="responsible_role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo / Função</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="responsible_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail do Responsável</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="responsible_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone do Responsável</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
