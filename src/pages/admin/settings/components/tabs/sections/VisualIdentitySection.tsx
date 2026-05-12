import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UploadCloud, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UseFormReturn } from 'react-hook-form'
import { SystemDataFormData } from '../../SystemDataSchema'

export function VisualIdentitySection({ form }: { form: UseFormReturn<SystemDataFormData> }) {
  const logoUrl = form.watch('logo_url')
  const bgImageUrl = form.watch('bg_image_url')
  const browserIconUrl = form.watch('browser_icon_url')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () =>
        form.setValue('logo_url', reader.result as string, { shouldValidate: true })
      reader.readAsDataURL(file)
    }
  }

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () =>
        form.setValue('bg_image_url', reader.result as string, { shouldValidate: true })
      reader.readAsDataURL(file)
    }
  }

  const handleBrowserIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () =>
        form.setValue('browser_icon_url', reader.result as string, { shouldValidate: true })
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        Logo, Plataforma e Imagem de Fundo
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
                  <Input {...field} value={field.value || ''} />
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
                  <Input {...field} value={field.value || ''} />
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
                    value={field.value || 100}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col space-y-6 p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-3">
            <Label>Logo da Plataforma</Label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-950 overflow-hidden relative group">
                {logoUrl ? (
                  <>
                    <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-2" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => form.setValue('logo_url', '', { shouldValidate: true })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
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

          <div className="space-y-3 pt-4 border-t border-border/50">
            <Label>Ícone do Navegador / Rodapé (Favicon)</Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-950 overflow-hidden relative group">
                {browserIconUrl ? (
                  <>
                    <img
                      src={browserIconUrl}
                      alt="Favicon"
                      className="h-full w-full object-contain p-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        form.setValue('browser_icon_url', '', { shouldValidate: true })
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <UploadCloud className="h-6 w-6 text-slate-300" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBrowserIconUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Usado na aba do navegador e em detalhes de marca.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border/50">
            <Label>Imagem de Fundo (Opcional)</Label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-40 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-900 overflow-hidden relative group">
                {bgImageUrl ? (
                  <>
                    <img src={bgImageUrl} alt="Background" className="h-full w-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => form.setValue('bg_image_url', '', { shouldValidate: true })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <UploadCloud className="h-8 w-8 text-slate-300" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBgImageUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Usada em telas de login, manutenção e temas específicos. Recomendado: 1920x1080px.
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="bg_image_url"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel className="text-xs">Ou cole uma URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder="https://exemplo.com/fundo.jpg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3 pt-4 border-t border-border/50">
            <FormField
              control={form.control}
              name="bg_opacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between">
                    <span>Opacidade do Fundo (%)</span>
                    <span className="text-muted-foreground">{field.value || 100}%</span>
                  </FormLabel>
                  <FormControl>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      className="w-full accent-primary"
                      value={field.value || 100}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
