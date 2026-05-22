import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { useSeo } from '@/hooks/use-seo'
import { HeroCarousel } from '@/components/sections/HeroCarousel'

export default function Index() {
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useSeo({
    title: 'Speedwork - Página Inicial',
    description: 'Sua plataforma inteligente de gestão.',
    keywords: 'gestão, plataforma, speedwork',
  })

  useEffect(() => {
    async function loadHome() {
      setLoading(true)

      let { data: pageData } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', 'inicio')
        .maybeSingle()

      if (!pageData) {
        const { data: homeData } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', 'home')
          .maybeSingle()
        pageData = homeData
      }

      if (!pageData) {
        const { data: firstPage } = await supabase
          .from('pages')
          .select('*')
          .order('display_order', { ascending: true })
          .limit(1)
          .maybeSingle()
        pageData = firstPage
      }

      if (pageData && pageData.blocks) {
        const { data: sectionsData } = await supabase.from('sections').select('*')

        const renderableBlocks = (pageData.blocks as any[])
          .filter((b: any) => !b.isHidden)
          .map((block: any) => {
            if (block.section_id) {
              const section = (sectionsData || []).find((s) => s.id === block.section_id)
              if (section) {
                return {
                  id: block.id || section.id,
                  type: section.type,
                  data: section.data,
                  order: block.order || 0,
                }
              }
            }
            return block
          })
          .filter((b: any) => b && b.type)
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

        setSections(renderableBlocks)
      } else {
        const { data: sectionsFallback } = await supabase
          .from('sections' as any)
          .select('*')
          .order('display_order', { ascending: true })
        setSections(sectionsFallback || [])
      }

      setLoading(false)
    }

    loadHome()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full shadow-lg"></div>
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-4">
        <h1 className="text-4xl font-extrabold text-primary mb-4 animate-fade-in-up">
          Bem-vindo à Speedwork
        </h1>
        <p
          className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          O conteúdo da nossa página principal está sendo configurado. Acesse o painel
          administrativo para adicionar novas dobras dinâmicas.
        </p>
      </div>
    )
  }

  return (
    <main className="w-full min-h-screen bg-background flex flex-col animate-fade-in">
      {sections.map((s, idx) => (
        <SectionRenderer key={s.id || idx} section={{ type: s.type, data: s.data }} />
      ))}
    </main>
  )
}
