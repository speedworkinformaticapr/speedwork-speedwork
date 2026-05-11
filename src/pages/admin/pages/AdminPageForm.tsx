import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import usePageBuilderStore from '@/stores/use-page-builder-store'
import { BuilderSidebar } from './components/BuilderSidebar'
import { BuilderCanvas } from './components/BuilderCanvas'
import { BuilderProperties } from './components/BuilderProperties'
import { BuilderHeader } from './components/BuilderHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminPageForm() {
  const { id } = useParams()
  const { state, setState } = usePageBuilderStore()

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setState({ status: 'loading' })
      if (id) {
        try {
          const { data, error } = await supabase.from('pages').select('*').eq('id', id).single()
          if (error) throw error
          if (data && isMounted) {
            setState({
              pageId: data.id,
              title: data.title,
              slug: data.slug,
              isPublished: data.is_published || false,
              metaTitle: data.meta_title || '',
              metaDescription: data.meta_description || '',
              metaKeywords: data.meta_keywords || '',
              blocks: (data.blocks || [])
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
                  return { ...b, type: normalizedType }
                })
                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
              status: 'idle',
            })
          }
        } catch (err: any) {
          if (isMounted) setState({ status: 'error', errorMessage: err.message })
        }
      } else {
        if (isMounted) {
          setState({
            pageId: null,
            title: '',
            slug: '',
            isPublished: false,
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
            blocks: [],
            selectedBlockId: null,
            status: 'idle',
          })
        }
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [id])

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-65px)] bg-background">
        <h2 className="text-xl font-bold text-destructive mb-2">Erro ao carregar página</h2>
        <p className="text-muted-foreground mb-4">{state.errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-4 py-2 rounded-md"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-background">
      <BuilderHeader />

      {/* Mobile Layout */}
      <Tabs defaultValue="canvas" className="w-full flex-1 flex flex-col md:hidden overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b h-12">
          <TabsTrigger value="elements">Elementos</TabsTrigger>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="properties">Propriedades</TabsTrigger>
        </TabsList>
        <TabsContent
          value="elements"
          className="flex-1 overflow-hidden m-0 data-[state=active]:flex"
        >
          <BuilderSidebar />
        </TabsContent>
        <TabsContent
          value="canvas"
          className="flex-1 overflow-hidden m-0 data-[state=active]:flex flex-col"
        >
          <BuilderCanvas />
        </TabsContent>
        <TabsContent
          value="properties"
          className="flex-1 overflow-hidden m-0 data-[state=active]:flex flex-col"
        >
          <BuilderProperties />
        </TabsContent>
      </Tabs>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <BuilderSidebar />
        <BuilderCanvas />
        <BuilderProperties />
      </div>
    </div>
  )
}
