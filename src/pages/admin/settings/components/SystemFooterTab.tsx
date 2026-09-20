import { UseFormReturn } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Info } from 'lucide-react'
import { SystemDataFormValues } from '../schema'

export function SystemFooterTab({ form }: { form: UseFormReturn<SystemDataFormValues> }) {
  const footerLinks = form.watch('footer_links') || { columns: 3 }
  const columnsCount = footerLinks.columns || 3
  const shortDescription = form.watch('short_description') || ''

  const handleColumnsChange = (val: string) => {
    form.setValue(
      'footer_links',
      { ...footerLinks, columns: parseInt(val, 10) },
      { shouldDirty: true },
    )
  }

  return (
    <div className="space-y-6">
      {/* Textos Institucionais do Rodapé */}
      <Card>
        <CardHeader>
          <CardTitle>Textos do Rodapé</CardTitle>
          <CardDescription>
            Personalize as mensagens curtas e avisos legais exibidos no rodapé do site e orçamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="short_description"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Texto Curto / Apresentação do Rodapé</FormLabel>
                  <span className="text-xs text-muted-foreground">
                    {shortDescription.length}/80 caracteres
                  </span>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Resumo institucional exibido logo abaixo da logo no rodapé..."
                    maxLength={80}
                    className="resize-none h-20"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>Texto breve com limite de até 80 caracteres.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quote_footer_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texto Padrão de Rodapé para Orçamentos e Documentos</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ex: Orçamento válido por 7 dias, sujeito a alterações de valores."
                    className="min-h-[100px] resize-y"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Este texto é impresso automaticamente no rodapé das propostas comerciais e
                  orçamentos compartilhados.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Redes Sociais exibidas no Rodapé e Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle>Redes Sociais</CardTitle>
          <CardDescription>
            Links para perfis sociais que aparecem nos ícones do rodapé e na barra de contato.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://instagram.com/..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://facebook.com/..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="youtube"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://youtube.com/@..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Estrutura de Colunas de Links */}
      <Card>
        <CardHeader>
          <CardTitle>Organização dos Links Rápidos</CardTitle>
          <CardDescription>Distribuição dos links das páginas ativas no rodapé.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/10 text-primary border border-primary/20 p-4 rounded-lg flex gap-3">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Organização Automática</p>
              <p>
                Os links exibidos no rodapé são automaticamente extraídos das{' '}
                <strong>Páginas Ativas</strong> configuradas no sistema. Se você desativar uma
                página, o atalho sumirá automaticamente. Defina abaixo em quantas colunas esses
                links devem ser distribuídos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <FormItem>
              <FormLabel>Número de Colunas de Links</FormLabel>
              <Select value={columnsCount.toString()} onValueChange={handleColumnsChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 Coluna</SelectItem>
                  <SelectItem value="2">2 Colunas</SelectItem>
                  <SelectItem value="3">3 Colunas</SelectItem>
                  <SelectItem value="4">4 Colunas</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Ajuste como os links serão distribuídos visualmente no rodapé das páginas públicas.
              </FormDescription>
            </FormItem>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
