import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { UseFormReturn } from 'react-hook-form'
import { SystemDataFormData } from '../SystemDataSchema'

export function QuotesOrdersTab({ form }: { form: UseFormReturn<SystemDataFormData> }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        Parâmetros de Orçamentos e Pedidos
      </h3>

      <FormField
        control={form.control}
        name="quote_footer_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mensagem de Rodapé (Orçamentos)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Orçamento válido por 15 dias. Valores sujeitos a alteração."
                className="min-h-[150px] bg-background"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Este texto será exibido em letras pequenas no rodapé dos orçamentos gerados.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
