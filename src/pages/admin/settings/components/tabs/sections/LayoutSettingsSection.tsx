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
import { SystemDataFormData } from '../../SystemDataSchema'

export function LayoutSettingsSection({ form }: { form: UseFormReturn<SystemDataFormData> }) {
  return (
    <div className="space-y-4 pt-6 border-t">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        Configurações de Layout
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="records_per_page"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registros por Página (Grids)</FormLabel>
              <Select
                value={field.value?.toString() || '50'}
                onValueChange={(val) => field.onChange(parseInt(val))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="5">5 registros</SelectItem>
                  <SelectItem value="15">15 registros</SelectItem>
                  <SelectItem value="25">25 registros</SelectItem>
                  <SelectItem value="50">50 registros</SelectItem>
                  <SelectItem value="100">100 registros</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bg_image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Imagem de Fundo (Acesso Negado)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bg_opacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opacidade do Fundo (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  {...field}
                  value={field.value ?? 100}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
