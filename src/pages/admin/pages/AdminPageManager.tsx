import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import usePageBuilderStore from '@/stores/use-page-builder-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SetAdminHeader } from '@/components/admin/AdminHeaderContext'
import { PageListbox, type PageOption } from './components/PageListbox'
import { PagePropertiesTab } from './components/PagePropertiesTab'
import { BuilderCanvas } from './components/BuilderCanvas'
import { BuilderProperties } from './components/BuilderProperties'
import {
  Plus,
  Save,
  Eye,
  FileText,
  SlidersHorizontal,
  Layers,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

export default function AdminPageManager() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { state, setState } = usePageBuilderStore()

  const [allPages, setAllPages] = useState<PageOption[]>([])
  const [loadingPages, setLoadingPages] = useState(true)

  // Header filters state
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')

  const isNewPage = location.pathname.endsWith('/new') || (!id && !state.pageId)

  // 1) Fetch all pages for the Listbox
  const fetchPagesList = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id, title, slug, is_published, display_order')
        .order('display_order', { ascending: true })

      if (error) throw error
      if (data) {
        setAllPages(data)
      }
    } catch (err: any) {
      console.error('Erro ao buscar lista de páginas:', err)
    } finally {
      setLoadingPages(false)
    }
  }, [])

  useEffect(() => {
    fetchPagesList()
  }, [fetchPagesList])

  // 2) Load selected page data or initialize empty state
  useEffect(() => {
    let isMounted = true

    async function loadPageData() {
      if (id && id !== 'new') {
        setState({ status: 'loading' })
        try {
          const { data, error } = await supabase.from('pages').select('*').eq('id', id).single()
          if (error) throw error

          if (data && isMounted) {
            setState({
              pageId: data.id,
              title: data.title || '',
              slug: data.slug || '',
              isPublished: !!data.is_published,
              metaTitle: data.meta_title || '',
              metaDescription: data.meta_description || '',
              metaKeywords: data.meta_keywords || '',
              displayOrder: data.display_order ?? 0,
              blocks: ((Array.isArray(data.blocks) ? data.blocks : []) as any[])
                .map((b: any) => {
                  let normalizedType = String(b.type || '')
                    .trim()
                    .toLowerCase()

                  if (normalizedType === 'map_element') {
                    normalizedType = 'map'
                  }

                  if (
                    normalizedType === 'pricing_table' ||
                    normalizedType === 'dynamic_pricing_table' ||
                    normalizedType === 'dynamic_pricing'
                  ) {
                    return {
                      ...b,
                      type: 'dynamic_pricing_table',
                      data: {
                        ...b.data,
                        title: b.data?.title || 'Nossos Planos',
                        subtitle: b.data?.subtitle || '',
                        plans: (b.data?.plans || []).map((p: any) => ({
                          name: p.name || '',
                          description: p.description || '',
                          buttonText: p.buttonText || '',
                          highlight: p.highlight || false,
                          sla_id: p.sla_id || '',
                          services: p.services || [],
                        })),
                      },
                    }
                  }
                  return { ...b, type: normalizedType, isHidden: !!b.isHidden }
                })
                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
              selectedBlockId: null,
              status: 'idle',
            })
          }
        } catch (err: any) {
          if (isMounted) {
            setState({ status: 'error', errorMessage: err.message })
            toast({
              title: 'Erro ao carregar página',
              description: err.message,
              variant: 'destructive',
            })
          }
        }
      } else {
        // Mode: New page or no page selected yet
        if (isMounted) {
          setState({
            pageId: null,
            title: '',
            slug: '',
            isPublished: false,
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
            displayOrder: 0,
            blocks: [],
            selectedBlockId: null,
            status: 'idle',
          })
        }
      }
    }

    loadPageData()
    return () => {
      isMounted = false
    }
  }, [id, setState])

  // 3) Handler for saving the current page
  const handleSavePage = async () => {
    if (!state.title || !state.title.trim()) {
      toast({
        title: 'Título obrigatório',
        description: 'Por favor, informe o título da página na guia Propriedade.',
        variant: 'destructive',
      })
      setState({ activeTab: 'properties' })
      return
    }

    if (!state.slug || !state.slug.trim()) {
      toast({
        title: 'Slug obrigatório',
        description: 'Por favor, informe a rota/slug da página na guia Propriedade.',
        variant: 'destructive',
      })
      setState({ activeTab: 'properties' })
      return
    }

    setState({ status: 'saving' })

    const cleanSlug = state.slug.toLowerCase().trim().replace(/^\/+/, '').replace(/\s+/g, '-')

    const payload: any = {
      title: state.title.trim(),
      slug: cleanSlug,
      is_published: state.isPublished,
      meta_title: state.metaTitle || null,
      meta_description: state.metaDescription || null,
      meta_keywords: state.metaKeywords || null,
      display_order: state.displayOrder ?? 0,
      blocks: state.blocks.map((b, i) => ({
        ...b,
        order: i,
      })),
      updated_at: new Date().toISOString(),
    }

    try {
      if (state.pageId) {
        const { error } = await (supabase.from('pages') as any)
          .update(payload)
          .eq('id', state.pageId)
        if (error) throw error
        toast({
          title: 'Página atualizada com sucesso!',
          description: `"${state.title}" foi salva com todas as alterações.`,
        })
      } else {
        const { data, error } = await (supabase.from('pages') as any)
          .insert(payload)
          .select()
          .single()
        if (error) throw error
        toast({
          title: 'Página criada com sucesso!',
          description: `"${state.title}" foi adicionada.`,
        })
        if (data) {
          setState({ pageId: data.id })
          navigate(`/admin/pages/${data.id}/edit`, { replace: true })
        }
      }

      await fetchPagesList()
      setState({ status: 'idle' })
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar página',
        description: err.message || 'Verifique se o slug já está em uso por outra página.',
        variant: 'destructive',
      })
      setState({ status: 'error', errorMessage: err.message })
    }
  }

  // 4) Handlers for page navigation
  const handleSelectPage = (selectedId: string) => {
    navigate(`/admin/pages/${selectedId}/edit`)
  }

  const handleNewPage = () => {
    navigate('/admin/pages/new')
  }

  const handleOpenPreview = () => {
    const cleanSlug = (state.slug || '').replace(/^\/+/, '')
    if (cleanSlug) {
      window.open(`/${cleanSlug}`, '_blank')
    }
  }

  // Filtered pages for the listbox based on header filters
  const filteredPages = allPages.filter((page) => {
    const matchesSearch =
      !searchFilter ||
      page.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchFilter.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && page.is_published) ||
      (statusFilter === 'draft' && !page.is_published)

    return matchesSearch && matchesStatus
  })

  // Global Header Title
  const headerTitle = (
    <div className="flex items-center gap-3">
      <div className="flex flex-col min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">
          {state.pageId
            ? state.title || 'Editando Página'
            : isNewPage
              ? 'Nova Página Institucional'
              : 'Páginas Institucionais'}
        </h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {state.pageId ? (
            <>
              <span className="font-mono truncate">/{state.slug || 'rota'}</span>
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground" />
              {state.isPublished ? (
                <span className="text-emerald-600 font-medium">Publicado</span>
              ) : (
                <span className="text-amber-600 font-medium">Rascunho</span>
              )}
            </>
          ) : (
            <span>Gestão de páginas e construtor visual</span>
          )}
        </div>
      </div>
    </div>
  )

  // Global Header Controls
  const headerControls = (
    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
      {/* Search filter in global header */}
      <div className="relative w-36 sm:w-44 hidden md:block">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filtrar páginas..."
          className="h-8 pl-8 text-xs bg-background"
        />
      </div>

      {/* Status filter in global header */}
      <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
        <SelectTrigger className="h-8 w-28 text-xs bg-background hidden lg:flex">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            Todos
          </SelectItem>
          <SelectItem value="published" className="text-xs">
            Publicados
          </SelectItem>
          <SelectItem value="draft" className="text-xs">
            Rascunhos
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Control buttons */}
      <Button variant="outline" size="sm" onClick={handleNewPage} className="h-8 text-xs gap-1.5">
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Nova Página</span>
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleOpenPreview}
        disabled={!state.slug}
        className="h-8 text-xs gap-1.5"
        title="Visualizar página em nova aba"
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Preview</span>
      </Button>

      <Button
        size="sm"
        onClick={handleSavePage}
        disabled={state.status === 'saving' || state.status === 'loading'}
        className="h-8 text-xs gap-1.5 font-semibold shadow-sm"
      >
        <Save className="w-3.5 h-3.5" />
        {state.status === 'saving' ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 -m-4 md:-m-6 bg-background">
      {/* Register content into Global Admin Header */}
      <SetAdminHeader title={headerTitle} controls={headerControls} />

      {/* Top Bar with Page Selector Listbox */}
      <div className="border-b bg-card px-4 md:px-6 py-3 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
            Página em Edição:
          </span>
          <PageListbox
            pages={filteredPages}
            selectedPageId={isNewPage ? 'new' : state.pageId}
            onSelectPage={handleSelectPage}
            onNewPage={handleNewPage}
            isLoading={loadingPages}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs py-0.5 font-normal">
            {allPages.length} {allPages.length === 1 ? 'página' : 'páginas'} cadastradas
          </Badge>
          {state.pageId && (
            <Badge
              variant="secondary"
              className={
                state.isPublished
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {state.isPublished ? 'Status: Publicado' : 'Status: Rascunho'}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Tabs Container */}
      <Tabs
        value={state.activeTab}
        onValueChange={(val: any) => setState({ activeTab: val })}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        {/* Navigation Tabs Header */}
        <div className="border-b bg-card px-4 md:px-6 shrink-0">
          <TabsList className="h-12 bg-transparent p-0 gap-2 sm:gap-6 border-b-0">
            <TabsTrigger
              value="properties"
              className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-3 sm:px-4 font-semibold text-xs sm:text-sm gap-2 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Propriedade</span>
            </TabsTrigger>

            <TabsTrigger
              value="builder"
              className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-3 sm:px-4 font-semibold text-xs sm:text-sm gap-2 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Page Builder</span>
              {state.blocks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
                  {state.blocks.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="block_properties"
              className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-3 sm:px-4 font-semibold text-xs sm:text-sm gap-2 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Propriedades do Elemento</span>
              {state.selectedBlockId && (
                <span className="inline-block w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Page Properties */}
        <TabsContent
          value="properties"
          className="flex-1 overflow-hidden m-0 data-[state=active]:flex flex-col"
        >
          <PagePropertiesTab />
        </TabsContent>

        {/* Tab 2: Page Builder (Canvas) */}
        <TabsContent
          value="builder"
          className="flex-1 overflow-hidden m-0 data-[state=active]:flex flex-col"
        >
          <BuilderCanvas />
        </TabsContent>

        {/* Tab 3: Selected Block Properties */}
        <TabsContent
          value="block_properties"
          className="flex-1 overflow-hidden m-0 data-[state=active]:flex flex-col"
        >
          <BuilderProperties />
        </TabsContent>
      </Tabs>
    </div>
  )
}
