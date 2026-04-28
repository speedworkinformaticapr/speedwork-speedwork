import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { useSeo } from '@/hooks/use-seo'
import { PageHero } from '@/components/PageHero'
import { FileText } from 'lucide-react'

export default function PublicPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPage = async () => {
      const { data, error } = await supabase
        .from('pages' as any)
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        navigate('/not-found')
        return
      }

      if (!data.is_published) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          navigate('/not-found')
          return
        }
      }

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
          {page.blocks
            ?.filter((b: any) => !b.isHidden)
            .map((block: any, i: number) => (
              <BlockRenderer key={block.id || i} block={block} />
            ))}
          {(!page.blocks || page.blocks.filter((b: any) => !b.isHidden).length === 0) && (
            <div className="text-center py-32 border-2 border-dashed rounded-3xl text-muted-foreground bg-muted/5">
              Conteúdo em construção. Volte em breve!
            </div>
          )}
        </div>
      </article>
    </main>
  )
}
