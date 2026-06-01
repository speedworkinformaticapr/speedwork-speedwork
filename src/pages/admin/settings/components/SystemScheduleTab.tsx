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
import { Textarea } from '@/components/ui/textarea'

export function SystemScheduleTab({ form }: { form: UseFormReturn<SystemDataFormValues> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários e Agendamento</CardTitle>
        <CardDescription>Configurações de agendamento e horários operacionais.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="business_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horários de Funcionamento (Formato JSON)</FormLabel>
              <FormControl>
                <Textarea
                  className="font-mono text-sm min-h-[150px]"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Exemplo: {`{"seg": "09:00 - 18:00", "ter": "09:00 - 18:00"}`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <FormField
            control={form.control}
            name="scheduling_interval_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intervalo de Agendamento (minutos)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>
                  Tempo em minutos de espaçamento padrão nos agendamentos.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quote_validity_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Validade de Orçamentos (dias)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value || ''} />
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
