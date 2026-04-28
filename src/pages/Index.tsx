import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { useSeo } from '@/hooks/use-seo'
import { HeroCarousel } from '@/components/sections/HeroCarousel'

export default function Index() {
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useSeo({
    title: 'Footgolf PR - Página Inicial',
    description: 'Acompanhe campeonatos, rankings e notícias do esporte que mais cresce no Paraná.',
    keywords: 'footgolf, esporte, paraná, torneio, campeonato, ranking',
  })

  useEffect(() => {
    supabase
      .from('sections' as any)
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        setSections(data || [])
        setLoading(false)
      })
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
          Bem-vindo ao Footgolf PR
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
      <HeroCarousel />
      {sections.map((s) => (
        <SectionRenderer key={s.id} section={s} />
      ))}
    </main>
  )
}
