import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UploadCloud } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { SystemDataFormData } from '../../SystemDataSchema'

export function VisualIdentitySection({ form }: { form: UseFormReturn<SystemDataFormData> }) {
  const logoUrl = form.watch('logo_url')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () =>
        form.setValue('logo_url', reader.result as string, { shouldValidate: true })
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        Logo e Plataforma
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="platform_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Plataforma</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slogan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slogan</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="menu_logo_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamanho da Logo no Menu (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col space-y-3 p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          <Label>Logo da Plataforma</Label>
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-950 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-2" />
              ) : (
                <UploadCloud className="h-8 w-8 text-slate-300" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
