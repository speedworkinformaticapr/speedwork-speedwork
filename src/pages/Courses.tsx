import { useState, useEffect } from 'react'
import { Map, MapPin, Flag, Navigation, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/PageHero'
import { useTranslation } from '@/hooks/use-translation'
import { useSeo } from '@/hooks/use-seo'

export default function Courses() {
  const { t } = useTranslation()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useSeo({
    title: 'Campos Oficiais - Footgolf PR',
    description: 'Conheça os campos oficiais de Footgolf no Paraná.',
  })

  useEffect(() => {
    supabase
      .from('courses')
      .select('*, clubs(name, city, state)')
      .eq('status', 'active')
      .then(({ data }) => {
        setCourses(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <PageHero
        title={t('courses.title') || 'Campos Oficiais'}
        description={
          t('courses.desc') || 'Conheça os campos onde a magia do Footgolf acontece no Paraná.'
        }
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Campos' }]}
        icon={<Map className="w-[400px] h-[400px]" />}
      />

      <main className="container mx-auto px-4 -mt-8 relative z-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B7D3A]"></div>
          </div>
        ) : courses.length === 0 ? (
          <Card className="p-12 text-center border-none shadow-md">
            <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">Nenhum campo cadastrado no momento.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, i) => (
              <Card
                key={course.id}
                className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="h-48 overflow-hidden relative bg-gray-200">
                  <img
                    src={
                      course.image_url ||
                      `https://img.usecurling.com/p/400/300?q=golf%20course&seed=${course.id}`
                    }
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    {course.holes && (
                      <Badge className="bg-white/90 text-[#1B7D3A] backdrop-blur font-bold">
                        {course.holes} Buracos
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 group-hover:text-[#1B7D3A] transition-colors">
                    {course.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-4 gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[#0052CC]" />
                    <span>
                      {course.clubs?.city}
                      {course.clubs?.state ? ` - ${course.clubs.state}` : ''}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-3 mb-6 text-sm">
                    {course.description ||
                      'Um excelente campo para a prática do Footgolf com desafios para todos os níveis.'}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center justify-center">
                      <span className="text-xs text-gray-500 font-bold uppercase">Par</span>
                      <span className="text-lg font-black text-[#1B7D3A]">{course.par || '-'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center justify-center">
                      <span className="text-xs text-gray-500 font-bold uppercase">Dificuldade</span>
                      <span className="text-sm font-bold text-gray-700 capitalize mt-1">
                        {course.difficulty_rating || 'Média'}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full bg-[#0052CC] hover:bg-[#0041a3] text-white gap-2">
                    <Info className="w-4 h-4" />
                    Mais Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
