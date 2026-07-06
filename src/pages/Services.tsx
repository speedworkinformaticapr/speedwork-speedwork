import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ClipboardCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useSeo } from '@/hooks/use-seo'

interface ServiceItem {
  id: string
  title: string
  description: string | null
  evaluation_slug: string | null
  sale_value: number | null
}

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  useSeo({
    title: 'Serviços',
    description: 'Conheça nossos serviços e faça uma avaliação gratuita.',
  })

  useEffect(() => {
    supabase
      .from('services')
      .select('id, title, description, evaluation_slug, sale_value')
      .order('title', { ascending: true })
      .then(({ data }) => {
        setServices(data || [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Nossos Serviços</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Selecione um serviço para iniciar uma avaliação gratuita e receber um diagnóstico
          personalizado.
        </p>
      </div>
      {services.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Nenhum serviço disponível no momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className="flex flex-col hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <CardTitle className="text-lg">{service.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {service.description || ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end gap-3">
                {service.evaluation_slug && (
                  <Badge variant="secondary" className="w-fit text-xs">
                    Avaliação disponível
                  </Badge>
                )}
                {service.evaluation_slug ? (
                  <Button asChild className="w-full">
                    <Link to={`/avaliar/${service.evaluation_slug}`}>
                      <ClipboardCheck className="w-4 h-4 mr-2" /> Fazer Diagnóstico
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    Avaliação indisponível
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
