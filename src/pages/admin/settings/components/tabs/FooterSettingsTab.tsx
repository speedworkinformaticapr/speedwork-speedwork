import { useEffect, useState } from 'react'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'

export function FooterSettingsTab({ form }: { form: any }) {
  const [pages, setPages] = useState<{ id: string; title: string; slug: string }[]>([])

  useEffect(() => {
    supabase
      .from('pages')
      .select('id, title, slug')
      .eq('is_published', true)
      .order('display_order')
      .then(({ data }) => {
        if (data) setPages(data)
      })
  }, [])

  const footerLinks = form.watch('footer_links') || { columns: 3, links: [] }
  const columnsCount = footerLinks.columns || 3
  const links = footerLinks.links || []

  const STATIC_LINKS = [
    { id: 'static_courses', title: 'Campos', path: '/courses' },
    { id: 'static_tournaments', title: 'Torneios', path: '/tournaments' },
    { id: 'static_rules', title: 'Regras', path: '/rules' },
    { id: 'static_blog', title: 'Blog', path: '/blog' },
  ]

  const availableLinks = [
    ...STATIC_LINKS,
    ...pages.map((p) => ({ id: p.id, title: p.title, path: `/${p.slug}` })),
  ]

  const handleColumnsChange = (val: string) => {
    form.setValue('footer_links', { ...footerLinks, columns: parseInt(val) }, { shouldDirty: true })
  }

  const handleLinkColChange = (linkId: string, title: string, path: string, col: number | null) => {
    const newLinks = links.filter((l: any) => l.id !== linkId)
    if (col !== null) {
      newLinks.push({ id: linkId, title, path, col })
    }
    form.setValue('footer_links', { ...footerLinks, links: newLinks }, { shouldDirty: true })
  }

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

      <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
        <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Defina quantas colunas a seção de links rápidos terá e escolha em qual coluna cada link
          será exibido.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FormItem>
            <FormLabel>Número de Colunas</FormLabel>
            <Select value={columnsCount.toString()} onValueChange={handleColumnsChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Coluna</SelectItem>
                <SelectItem value="2">2 Colunas</SelectItem>
                <SelectItem value="3">3 Colunas</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Ajuste como os links serão distribuídos visualmente no rodapé.
            </FormDescription>
          </FormItem>
        </div>

        <div className="border rounded-md divide-y overflow-hidden">
          {availableLinks.map((al) => {
            const currentLink = links.find((l: any) => l.id === al.id)
            const currentCol = currentLink?.col || '0'
            return (
              <div
                key={al.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10"
              >
                <div>
                  <p className="font-medium">{al.title}</p>
                  <p className="text-xs text-muted-foreground">{al.path}</p>
                </div>
                <Select
                  value={currentCol.toString()}
                  onValueChange={(val) =>
                    handleLinkColChange(
                      al.id,
                      al.title,
                      al.path,
                      val === '0' ? null : parseInt(val),
                    )
                  }
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Não exibir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Não exibir</SelectItem>
                    <SelectItem value="1">Coluna 1</SelectItem>
                    {columnsCount >= 2 && <SelectItem value="2">Coluna 2</SelectItem>}
                    {columnsCount >= 3 && <SelectItem value="3">Coluna 3</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
