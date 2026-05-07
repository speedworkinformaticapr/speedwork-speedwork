import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export function FooterSettingsTab({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
        <h3 className="text-lg font-semibold mb-4">Configurações do Rodapé</h3>

        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="slogan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texto de Impacto do Rodapé (Gatilho Mental)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Eleve o seu jogo, viva a paixão pelo esporte. Junte-se à revolução!"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Frase curta exibida na primeira coluna do rodapé, abaixo da logomarca. Aproveite
                  para engajar seus usuários com gatilhos mentais.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
