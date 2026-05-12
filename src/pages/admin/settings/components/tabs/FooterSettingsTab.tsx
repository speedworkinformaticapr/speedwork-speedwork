import { useEffect, useState } from 'react'
import { FormItem, FormLabel, FormDescription } from '@/components/ui/form'
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
      <div className="bg-muted/30 p-4 sm:p-6 rounded-xl border border-border/50">
        <h3 className="text-lg font-semibold mb-4">Links Rápidos e Menus Ativos</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Defina quantas colunas a seção de links rápidos terá e escolha em qual coluna cada link
          será exibido no rodapé do site.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FormItem>
            <FormLabel>Número de Colunas para Links</FormLabel>
            <Select value={columnsCount.toString()} onValueChange={handleColumnsChange}>
              <SelectTrigger className="w-full">
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

        <div className="border rounded-md divide-y overflow-hidden bg-background">
          <div className="p-3 bg-muted/50 hidden md:grid grid-cols-2 font-medium text-sm">
            <div>Página / Link</div>
            <div>Coluna de Exibição</div>
          </div>
          {availableLinks.map((al) => {
            const currentLink = links.find((l: any) => l.id === al.id)
            const currentCol = currentLink?.col || '0'
            return (
              <div
                key={al.id}
                className="p-4 flex flex-col md:grid md:grid-cols-2 gap-4 hover:bg-muted/20 items-start md:items-center transition-colors"
              >
                <div>
                  <p className="font-medium text-sm md:text-base">{al.title}</p>
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
                  <SelectTrigger className="w-full md:max-w-[250px]">
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
