import { useState } from 'react'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UploadCloud, X, Wand2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UseFormReturn } from 'react-hook-form'
import { SystemDataFormData } from '../../SystemDataSchema'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function VisualIdentitySection({ form }: { form: UseFormReturn<SystemDataFormData> }) {
  const { toast } = useToast()
  const logoUrl = form.watch('logo_url')
  const bgImageUrl = form.watch('bg_image_url')
  const browserIconUrl = form.watch('browser_icon_url')
  const shortDescription = form.watch('short_description') || ''

  const [generatingField, setGeneratingField] = useState<string | null>(null)

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

  const handleAIGenerate = async (
    field: keyof SystemDataFormData,
    context: string,
    maxLength?: number,
  ) => {
    try {
      setGeneratingField(field)
      const currentText = form.getValues(field) as string

      const { data, error } = await supabase.functions.invoke('generate-ai-text', {
        body: {
          field_context: context,
          current_text: currentText,
          system_context: `Plataforma de Footgolf. Nome atual: ${form.getValues('platform_name')}`,
          max_length: maxLength,
        },
      })

      if (error) throw error

      if (data?.generated_text) {
        form.setValue(field, data.generated_text, { shouldValidate: true, shouldDirty: true })
        toast({
          title: 'Texto gerado',
          description: 'O texto foi gerado com sucesso usando IA.',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao gerar texto',
        description: err.message || 'Não foi possível gerar o texto no momento.',
        variant: 'destructive',
      })
    } finally {
      setGeneratingField(null)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        Logo, Título, Slogan e Texto
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="platform_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-between items-center">
                  <span>Título</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-primary"
                    onClick={() =>
                      handleAIGenerate(
                        'platform_name',
                        'Título curto e chamativo para uma plataforma de Footgolf',
                        40,
                      )
                    }
                    disabled={generatingField === 'platform_name'}
                  >
                    {generatingField === 'platform_name' ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Wand2 className="h-3 w-3 mr-1" />
                    )}
                    IA
                  </Button>
                </FormLabel>
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
                <FormLabel className="flex justify-between items-center">
                  <span>Slogan</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-primary"
                    onClick={() =>
                      handleAIGenerate(
                        'slogan',
                        'Slogan inspirador para uma plataforma de Footgolf',
                        60,
                      )
                    }
                    disabled={generatingField === 'slogan'}
                  >
                    {generatingField === 'slogan' ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Wand2 className="h-3 w-3 mr-1" />
                    )}
                    IA
                  </Button>
                </FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="short_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-between items-center">
                  <span>Texto Curto</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {shortDescription.length}/80
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-primary"
                      onClick={() =>
                        handleAIGenerate(
                          'short_description',
                          'Texto de apresentação de até 80 caracteres para rodapé de plataforma de Footgolf',
                          80,
                        )
                      }
                      disabled={generatingField === 'short_description'}
                    >
                      {generatingField === 'short_description' ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Wand2 className="h-3 w-3 mr-1" />
                      )}
                      IA
                    </Button>
                  </div>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    maxLength={80}
                    className="resize-none h-20"
                    placeholder="Descrição curta para o rodapé (máx 80 caracteres)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="menu_logo_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho Logo Menu (%)</FormLabel>
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

            <FormField
              control={form.control}
              name="footer_icon_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho Ícone Rodapé (%)</FormLabel>
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
        </div>
        <div className="flex flex-col space-y-6 p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-3">
            <Label>Logo da Plataforma</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-24 w-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-950 overflow-hidden relative group shrink-0">
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
              <div className="flex-1 w-full space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border/50">
            <Label>Ícone do Navegador / Rodapé (Favicon)</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-16 w-16 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-950 overflow-hidden relative group shrink-0">
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
              <div className="flex-1 w-full space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBrowserIconUpload}
                  className="cursor-pointer text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Usado na aba do navegador e em detalhes de marca.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border/50 hidden md:block">
            <div className="text-xs text-muted-foreground">
              <p>
                <strong>Dica:</strong> Em dispositivos móveis, este painel se ajusta para melhor
                visualização.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 mt-4 border-t border-border/50">
        <h4 className="text-md font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Imagem de Fundo (Opcional)
        </h4>
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-1/2">
            <div className="h-24 w-40 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-900 overflow-hidden relative group shrink-0">
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
            <div className="flex-1 w-full space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleBgImageUpload}
                className="cursor-pointer text-sm"
              />
              <p className="text-xs text-muted-foreground">Recomendado: 1920x1080px.</p>
            </div>
          </div>

          <div className="w-full md:w-1/2 space-y-4">
            <FormField
              control={form.control}
              name="bg_image_url"
              render={({ field }) => (
                <FormItem>
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

            <FormField
              control={form.control}
              name="bg_opacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between">
                    <span className="text-xs">Opacidade do Fundo (%)</span>
                    <span className="text-xs text-muted-foreground">{field.value || 100}%</span>
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
