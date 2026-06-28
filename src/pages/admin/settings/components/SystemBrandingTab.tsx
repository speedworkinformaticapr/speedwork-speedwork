import { UseFormReturn } from 'react-hook-form'
import { SystemDataFormValues } from '../schema'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MediaPicker } from '@/components/MediaPicker'
import { Image as ImageIcon } from 'lucide-react'

export function SystemBrandingTab({ form }: { form: UseFormReturn<SystemDataFormValues> }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identidade e Branding</CardTitle>
          <CardDescription>Configure o nome e os recursos visuais da plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Logo</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="browser_icon_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Ícone do Navegador (Favicon)</FormLabel>
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
                  <FormLabel>Tamanho da Logo no Menu (px)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active_theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema Ativo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'system'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tema" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tela de Login</CardTitle>
          <CardDescription>
            Customize a aparência da tela de login com imagem de fundo, título, subtítulo e texto de
            impacto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="login_bg_image_url"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Imagem de Fundo do Login</FormLabel>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1 w-full">
                      {field.value ? (
                        <div className="relative w-full max-w-md rounded-lg overflow-hidden border">
                          <img
                            src={field.value}
                            alt="Preview"
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full max-w-md h-20 rounded-lg border border-dashed text-muted-foreground text-sm">
                          <ImageIcon className="w-4 h-4 mr-2" /> Nenhuma imagem selecionada
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <MediaPicker
                        onSelect={(url) => field.onChange(url)}
                        trigger={
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                          >
                            <ImageIcon className="w-4 h-4 mr-2" /> Selecionar da Galeria
                          </button>
                        }
                      />
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => field.onChange('')}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                  <FormControl>
                    <Input type="hidden" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="login_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Login</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="Speedwork" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="login_subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtítulo do Login</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="Soluções em TI" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="login_impact_text"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Texto de Impacto</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Digite um texto de impacto para a tela de login..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
