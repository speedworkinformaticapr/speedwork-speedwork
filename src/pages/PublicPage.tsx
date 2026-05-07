import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { useSeo } from '@/hooks/use-seo'
import { PageHero } from '@/components/PageHero'
import { FileText } from 'lucide-react'

// Import system core pages so they can be managed via the CMS slug
import Courses from '@/pages/Courses'
import Tournaments from '@/pages/Tournaments'
import Ranking from '@/pages/Ranking'
import Rules from '@/pages/Rules'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Store from '@/pages/store/Store'
import Gallery from '@/pages/Gallery'
import BlogList from '@/pages/blog/BlogList'

// Map predefined slugs to their specific React components
const STATIC_PAGES: Record<string, React.FC> = {
  courses: Courses,
  tournaments: Tournaments,
  ranking: Ranking,
  rules: Rules,
  about: About,
  sobre: About,
  contact: Contact,
  contato: Contact,
  store: Store,
  gallery: Gallery,
  blog: BlogList,
}

export default function PublicPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState<any>(null)
  const [globalSections, setGlobalSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPage = async () => {
      const { data, error } = await supabase
        .from('pages' as any)
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        navigate('/not-found', { replace: true })
        return
      }

      if (!data.is_published) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          navigate('/not-found', { replace: true })
          return
        }
      }

      // Load all global sections so we can render them properly
      const { data: sections } = await supabase.from('sections').select('*')
      if (sections) setGlobalSections(sections)

      setPage(data)
      setLoading(false)
    }

    loadPage()
  }, [slug, navigate])

  useSeo({
    title: page ? `${page.meta_title || page.title} - Footgolf PR` : 'Carregando...',
    description: page?.meta_description || 'Página oficial Footgolf PR',
    keywords: page?.meta_keywords || undefined,
    canonical: page ? `${window.location.origin}/${page.slug}` : undefined,
    schema: page
      ? {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: page.title,
          description: page.meta_description,
          url: `${window.location.origin}/${page.slug}`,
        }
      : undefined,
  })

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full shadow-lg"></div>
      </div>
    )

  if (!page) return null

  // If the page exists in the CMS and maps to a native static application component,
  // we render the application component directly.
  const StaticComponent = STATIC_PAGES[slug as string]
  if (StaticComponent) {
    return <StaticComponent />
  }

  const visibleBlocks = page.blocks?.filter((b: any) => !b.isHidden) || []
  const hasNewSections = visibleBlocks.some((b: any) => !!b.section_id)

  // If the page contains any new modular global sections, we render it full-width by default
  // allowing each Dobra to fully manage its own layout.
  if (hasNewSections) {
    return (
      <main className="min-h-screen font-sans bg-background">
        <div className="flex flex-col">
          {visibleBlocks.map((block: any, i: number) => {
            if (block.section_id) {
              const globalSection = globalSections.find((s) => s.id === block.section_id)
              if (!globalSection || !globalSection.is_published) return null
              return <SectionRenderer key={block.id || i} section={globalSection} />
            }
            // Fallback for legacy blocks mixed in
            return (
              <div key={block.id || i} className="container mx-auto px-4 max-w-4xl my-12">
                <BlockRenderer block={block} />
              </div>
            )
          })}
          {visibleBlocks.length === 0 && (
            <div className="container mx-auto px-4 py-32 text-center text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/5 mt-12">
              Conteúdo em construção. Volte em breve!
            </div>
          )}
        </div>
      </main>
    )
  }

  // Legacy rendering for pages fully built with old blocks format (keeps the PageHero layout)
  return (
    <main className="min-h-screen bg-gray-50 pb-20 font-sans">
      <PageHero
        title={page.title}
        description={page.meta_description || ''}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: page.title }]}
        icon={<FileText className="w-[400px] h-[400px]" />}
      />

      <article
        className="container mx-auto px-4 md:px-8 max-w-4xl animate-fade-in -mt-8 relative z-20 bg-white p-8 rounded-2xl shadow-xl"
        style={{ animationDelay: '200ms' }}
      >
        <div className="flex flex-col gap-6">
          {visibleBlocks.map((block: any, i: number) => (
            <BlockRenderer key={block.id || i} block={block} />
          ))}
          {visibleBlocks.length === 0 && (
            <div className="text-center py-32 border-2 border-dashed rounded-3xl text-muted-foreground bg-muted/5">
              Conteúdo em construção. Volte em breve!
            </div>
          )}
        </div>
      </article>
    </main>
  )
}
