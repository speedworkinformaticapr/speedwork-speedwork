import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { SystemDataFormValues } from '../schema'

interface Props {
  form: UseFormReturn<SystemDataFormValues>
}

export function SystemLegalTab({ form }: Props) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-lg font-medium">Termos e Legal</h2>
        <p className="text-sm text-muted-foreground">
          Política de privacidade, LGPD e termos de uso.
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          control={form.control}
          name="terms_uso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Termos de Uso</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  withAi
                  aiContext="Termos de Uso do Sistema"
                />
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
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  withAi
                  aiContext="Política de Privacidade e Tratamento de Dados (LGPD)"
                />
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
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  withAi
                  aiContext="Política de Cookies"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
