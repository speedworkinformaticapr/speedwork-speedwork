import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { Skeleton } from '@/components/ui/skeleton'

export default function PublicPage() {
  const { slug } = useParams()
  const [page, setPage] = useState<any>(null)
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPage() {
      if (!slug) return
      setLoading(true)

      const [pageRes, sectionsRes] = await Promise.all([
        supabase.from('pages').select('*').eq('slug', slug).single(),
        supabase.from('sections').select('*'),
      ])

      if (!pageRes.error && pageRes.data) {
        setPage(pageRes.data)
      } else {
        setPage(null)
      }

      if (!sectionsRes.error && sectionsRes.data) {
        setSections(sectionsRes.data)
      }

      setLoading(false)
    }

    loadPage()
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8 animate-pulse">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Página não encontrada</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          A página que você está procurando não existe ou não está disponível no momento.
        </p>
      </div>
    )
  }

  const renderableBlocks = (page.blocks || [])
    .filter((b: any) => !b.isHidden)
    .map((block: any) => {
      if (block.section_id) {
        const section = sections.find((s) => s.id === block.section_id)
        if (section) {
          return {
            id: block.id || section.id,
            type: section.type,
            data: section.data,
            order: block.order || 0,
            name: block.name,
          }
        }
      }
      return block
    })
    .filter((b: any) => b && b.type)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

  return (
    <div className="min-h-screen bg-background animate-fade-in flex flex-col w-full overflow-hidden">
      {renderableBlocks.map((block: any, index: number) => (
        <SectionRenderer
          key={block.id || index}
          section={{ type: block.type, data: block.data, id: block.name }}
        />
      ))}
    </div>
  )
}
