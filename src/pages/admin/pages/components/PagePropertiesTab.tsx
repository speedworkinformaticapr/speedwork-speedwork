import usePageBuilderStore from '@/stores/use-page-builder-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { AIGenerateButton } from '@/components/AIGenerateButton'
import { FileText, Globe, Search, Layers } from 'lucide-react'

export function PagePropertiesTab() {
  const { state, setState } = usePageBuilderStore()

  const handleTitleChange = (val: string) => {
    const autoSlug =
      !state.pageId || !state.slug
        ? val
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
        : state.slug

    setState({
      title: val,
      slug: autoSlug,
    })
  }

  const handleSlugChange = (val: string) => {
    const clean = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^\/+/, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    setState({ slug: clean })
  }

  return (
    <div className="flex-1 bg-muted/10 overflow-y-auto p-4 md:p-8 flex flex-col transition-colors">
      <div className="max-w-3xl w-full mx-auto space-y-6 pb-12">
        {/* Basic Properties */}
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-5">
          <div className="border-b pb-3">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Informações Principais
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Defina o nome de exibição, a URL de acesso e o status de publicação da página.
            </p>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="page-title" className="text-xs font-semibold">
                  Título Interno da Página *
                </Label>
                <AIGenerateButton
                  fieldContext="Título curto, claro e atraente para uma página institucional."
                  currentText={state.title}
                  onGenerate={(text) => handleTitleChange(text)}
                />
              </div>
              <Input
                id="page-title"
                value={state.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: Sobre Nós, Serviços, Quem Somos"
                className="h-10 text-sm"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="page-slug" className="text-xs font-semibold">
                  Slug / Rota Pública *
                </Label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  /{state.slug || 'slug-da-pagina'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 bg-muted text-xs text-muted-foreground select-none font-mono">
                  /
                </span>
                <Input
                  id="page-slug"
                  value={state.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="ex: sobre-nos"
                  className="rounded-l-none h-10 text-sm font-mono"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Endereço de acesso público da página no site.
              </p>
            </div>

            {/* Display Order */}
            <div className="space-y-2 pt-2">
              <Label htmlFor="display-order" className="text-xs font-semibold">
                Ordem de Exibição
              </Label>
              <Input
                id="display-order"
                type="number"
                value={state.displayOrder ?? 0}
                onChange={(e) => setState({ displayOrder: parseInt(e.target.value, 10) || 0 })}
                className="h-10 text-sm w-32"
              />
              <p className="text-[11px] text-muted-foreground">
                Define a prioridade na listagem e no menu de navegação.
              </p>
            </div>

            {/* Publication Status Switch */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40 border mt-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <Label htmlFor="publish-switch" className="text-sm font-semibold cursor-pointer">
                    Página Publicada
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Quando ativo, a página estará visível publicamente para todos os visitantes do
                  site.
                </p>
              </div>
              <Switch
                id="publish-switch"
                checked={state.isPublished}
                onCheckedChange={(checked) => setState({ isPublished: checked })}
              />
            </div>
          </div>
        </div>

        {/* SEO Properties */}
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-5">
          <div className="border-b pb-3">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Otimização para Buscas (SEO)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure metatags para melhorar o ranqueamento no Google e redes sociais.
            </p>
          </div>

          <div className="space-y-4">
            {/* Meta Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="meta-title" className="text-xs font-semibold">
                  Meta Title (Título SEO)
                </Label>
                <AIGenerateButton
                  fieldContext={`Meta Title SEO atrativo com palavras-chave relevantes. Título base: ${state.title}`}
                  currentText={state.metaTitle}
                  onGenerate={(text) => setState({ metaTitle: text })}
                  maxLength={60}
                />
              </div>
              <div className="relative">
                <Input
                  id="meta-title"
                  value={state.metaTitle}
                  onChange={(e) => setState({ metaTitle: e.target.value })}
                  placeholder="Ex: Sobre Nós | Nossa História e Valores"
                  className="h-10 text-sm pr-16"
                  maxLength={70}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground">
                  {(state.metaTitle || '').length}/70
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Recomendado até 60 caracteres para visualização ideal no Google.
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="meta-description" className="text-xs font-semibold">
                  Meta Description (Descrição SEO)
                </Label>
                <AIGenerateButton
                  fieldContext={`Meta Description SEO persuasiva e descritiva para atrair cliques. Título base: ${state.title}`}
                  currentText={state.metaDescription}
                  onGenerate={(text) => setState({ metaDescription: text })}
                  maxLength={160}
                />
              </div>
              <div className="relative">
                <Textarea
                  id="meta-description"
                  value={state.metaDescription}
                  onChange={(e) => setState({ metaDescription: e.target.value })}
                  placeholder="Breve resumo da página exibido nos resultados de busca..."
                  rows={3}
                  className="text-sm pb-6"
                  maxLength={180}
                />
                <span className="absolute right-3 bottom-2 text-[10px] font-mono text-muted-foreground">
                  {(state.metaDescription || '').length}/180
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Recomendado entre 140 e 160 caracteres.
              </p>
            </div>

            {/* Meta Keywords */}
            <div className="space-y-2">
              <Label htmlFor="meta-keywords" className="text-xs font-semibold">
                Meta Keywords (Palavras-chave)
              </Label>
              <Input
                id="meta-keywords"
                value={state.metaKeywords}
                onChange={(e) => setState({ metaKeywords: e.target.value })}
                placeholder="Ex: sobre nós, velocidade, automobilismo, oficina"
                className="h-10 text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Separe as palavras-chave por vírgulas.
              </p>
            </div>
          </div>
        </div>

        {/* Blocks Count Summary Card */}
        <div className="bg-card p-5 rounded-xl border shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Estrutura Visual</h4>
              <p className="text-xs text-muted-foreground">
                Esta página possui{' '}
                <strong>
                  {state.blocks.length} {state.blocks.length === 1 ? 'dobra' : 'dobras'}
                </strong>{' '}
                configuradas no Page Builder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
