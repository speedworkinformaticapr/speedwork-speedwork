import React from 'react'
import { Users, Target, Shield, Trophy } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { BlogPostsGrid } from '@/components/blocks/BlogPostsGrid'
import { supabase } from '@/lib/supabase/client'
import { useSystemData } from '@/hooks/use-system-data'
import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'

function MapBlock({ block }: { block: any }) {
  const { data } = useSystemData()
  const size = block.data?.size || 'medium'
  const heightClass = size === 'small' ? 'h-64' : size === 'large' ? 'h-[500px]' : 'h-96'

  const address = data
    ? [data.address_street, data.address_number, data.address_city, data.address_state]
        .filter(Boolean)
        .join(', ')
    : ''

  if (!address)
    return (
      <div
        className={`w-full ${heightClass} bg-muted flex items-center justify-center rounded-2xl shadow-sm container mx-auto my-12`}
      >
        Endereço não configurado no sistema.
      </div>
    )

  const encodedAddress = encodeURIComponent(address)

  return (
    <div className="container mx-auto px-4 my-12">
      <iframe
        width="100%"
        height="100%"
        className={`rounded-2xl shadow-lg border-none w-full ${heightClass}`}
        src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
      />
    </div>
  )
}

function DynamicPricingTableBlock({ block }: { block: any }) {
  const [categories, setCategories] = useState<any[]>([])
  const [period, setPeriod] = useState<'monthly' | 'semiannual' | 'annual'>('monthly')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase.from('plan_categories').select(`
          id, title,
          plan_services (
            id, title, description,
            monthly_value, semiannual_value, annual_value,
            monthly_discount, semiannual_discount, annual_discount
          )
        `)
      if (!error && data) {
        setCategories(data)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading)
    return <div className="text-center my-12 text-muted-foreground">Carregando planos...</div>

  const title = block.data?.title || 'Nossos Planos'
  const subtitle = block.data?.subtitle || 'Escolha a melhor opção para sua necessidade'

  return (
    <div className="container mx-auto px-4 my-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex justify-center mb-12">
        <Tabs value={period} onValueChange={(v: any) => setPeriod(v)} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
            <TabsTrigger value="semiannual">Semestral</TabsTrigger>
            <TabsTrigger value="annual">Anual</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-16">
        {categories.map((cat) => (
          <div key={cat.id}>
            <h3 className="text-2xl font-bold text-center mb-8 border-b pb-4">{cat.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(cat.plan_services || []).map((service: any) => {
                let price = 0
                let discount = 0
                if (period === 'monthly') {
                  price = service.monthly_value || 0
                  discount = service.monthly_discount || 0
                } else if (period === 'semiannual') {
                  price = service.semiannual_value || 0
                  discount = service.semiannual_discount || 0
                } else if (period === 'annual') {
                  price = service.annual_value || 0
                  discount = service.annual_discount || 0
                }

                const finalPrice = Math.max(0, price - discount)

                return (
                  <Card
                    key={service.id}
                    className="p-8 border shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full bg-card rounded-2xl relative overflow-hidden group"
                  >
                    <div className="flex-1">
                      <h4 className="text-xl font-bold mb-2">{service.title}</h4>
                      <p className="text-muted-foreground text-sm mb-6 min-h-[40px]">
                        {service.description}
                      </p>

                      <div className="mb-8">
                        {discount > 0 && (
                          <span className="text-sm text-muted-foreground line-through block">
                            R$ {price.toFixed(2)}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-primary">R$</span>
                          <span className="text-4xl font-black text-primary">
                            {finalPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground font-medium">
                            /
                            {period === 'monthly'
                              ? 'mês'
                              : period === 'semiannual'
                                ? 'semestre'
                                : 'ano'}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                          <span>Acesso completo à plataforma</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                          <span>Suporte especializado</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                          <span>Contrato digital gerado</span>
                        </li>
                      </ul>
                    </div>

                    <a
                      href={`/checkout?plan_id=${service.id}&period=${period}`}
                      className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-xl text-center font-bold hover:bg-primary/90 transition-colors shadow-md mt-auto block"
                    >
                      Contratar Plano
                    </a>
                  </Card>
                )
              })}
            </div>
            {(!cat.plan_services || cat.plan_services.length === 0) && (
              <p className="text-center text-muted-foreground italic">
                Nenhum serviço cadastrado nesta categoria.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function BlockRenderer({ block }: { block: any }) {
  if (!block || !block.type || !block.data) return null

  switch (block.type) {
    case 'map':
      return <MapBlock block={block} />
    case 'dynamic_pricing_table':
      return <DynamicPricingTableBlock block={block} />
    case 'hero': {
      const IconComp =
        block.data.icon === 'Target'
          ? Target
          : block.data.icon === 'Shield'
            ? Shield
            : block.data.icon === 'Trophy'
              ? Trophy
              : Users
      return (
        <PageHero
          title={block.data.title || ''}
          description={block.data.description || ''}
          breadcrumbs={
            block.data.breadcrumbs || [
              { label: 'Home', href: '/' },
              { label: block.data.title || 'Página' },
            ]
          }
          icon={<IconComp className="w-[400px] h-[400px]" />}
        />
      )
    }
    case 'text_image': {
      const isLeft = block.data.imagePosition === 'left'
      return (
        <div className="container mx-auto px-4 relative z-20 my-12">
          <Card className="border-none shadow-xl overflow-hidden bg-white rounded-2xl">
            <div className={cn('flex flex-col lg:flex-row', isLeft ? 'lg:flex-row-reverse' : '')}>
              <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                {block.data.title && (
                  <h2 className="text-3xl font-black font-montserrat text-[#0052CC] uppercase mb-6">
                    {block.data.title}
                  </h2>
                )}
                <div
                  className="space-y-4 text-gray-600 leading-relaxed text-lg prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: block.data.content || '' }}
                />
              </div>
              <div className="lg:w-1/2 h-64 lg:h-auto relative">
                <img
                  src={
                    block.data.imageUrl || 'https://img.usecurling.com/p/800/600?q=image&color=blue'
                  }
                  alt={block.data.title || 'Imagem'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Card>
        </div>
      )
    }
    case 'features': {
      return (
        <div className="container mx-auto px-4 my-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(block.data.items || []).map((item: any, i: number) => {
              const IconComp =
                item.icon === 'Target'
                  ? Target
                  : item.icon === 'Shield'
                    ? Shield
                    : item.icon === 'Trophy'
                      ? Trophy
                      : Users
              const colorClass =
                item.icon === 'Target'
                  ? 'text-[#1B7D3A] bg-[#1B7D3A]/10'
                  : item.icon === 'Shield'
                    ? 'text-[#0052CC] bg-[#0052CC]/10'
                    : item.icon === 'Trophy'
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'text-slate-600 bg-slate-600/10'
              return (
                <Card
                  key={i}
                  className="border-none shadow-md hover:shadow-lg transition-shadow bg-white text-center p-8 group"
                >
                  <div
                    className={cn(
                      'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform',
                      colorClass,
                    )}
                  >
                    <IconComp className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      )
    }
    case 'text':
      return (
        <div className="container mx-auto px-4">
          <div
            className="prose prose-lg max-w-none text-foreground my-8"
            dangerouslySetInnerHTML={{ __html: block.data.content || '' }}
          />
        </div>
      )
    case 'image':
      return (
        <div className="container mx-auto px-4 my-8 flex flex-col items-center">
          <img
            src={block.data.url}
            alt={block.data.alt || 'Imagem'}
            className="w-full h-auto rounded-2xl shadow-lg max-h-[700px] object-cover"
          />
          {block.data.caption && (
            <p className="text-center text-sm text-muted-foreground mt-4 italic">
              {block.data.caption}
            </p>
          )}
        </div>
      )
    case 'video':
      return (
        <div className="container mx-auto px-4 my-10 aspect-video rounded-2xl overflow-hidden shadow-xl border border-muted bg-black/5">
          <iframe
            src={block.data.url}
            className="w-full h-full"
            allowFullScreen
            title="Vídeo"
            style={{ border: 'none' }}
          />
        </div>
      )
    case 'gallery': {
      const images = Array.isArray(block.data.items)
        ? block.data.items
        : Array.isArray(block.data.images)
          ? block.data.images
          : []

      return (
        <div className="container mx-auto px-4 my-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {images.map((img: any, i: number) => {
            const url = typeof img === 'string' ? img : img.url
            const alt =
              typeof img === 'string'
                ? `Galeria imagem ${i + 1}`
                : img.alt || `Galeria imagem ${i + 1}`

            return (
              <div
                key={i}
                className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={url}
                  alt={alt}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
            )
          })}
        </div>
      )
    }
    case 'cta':
      return (
        <div className="container mx-auto px-4 my-12 text-center bg-gradient-to-br from-primary/10 to-primary/5 p-10 md:p-14 rounded-3xl border border-primary/20 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl md:text-4xl font-extrabold text-primary mb-6">
              {block.data.text || 'Chamada para Ação'}
            </h3>
            <a
              href={block.data.link || '#'}
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-primary/30"
            >
              {block.data.buttonText || 'Clique Aqui'}
            </a>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -ml-10 -mb-10"></div>
        </div>
      )
    case 'blog_posts_grid':
      return <BlogPostsGrid block={block} />
    case 'timeline': {
      const title = block.data.title
      const events = Array.isArray(block.data.events) ? [...block.data.events] : []

      // Ordenação automática por data
      events.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime()
        const dateB = new Date(b.date || 0).getTime()
        return dateA - dateB
      })

      return (
        <div className="container mx-auto px-4 my-16 max-w-5xl">
          {title && (
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16 text-primary tracking-tight">
              {title}
            </h2>
          )}
          <div className="relative border-l-2 border-primary/20 md:border-l-0 md:flex md:flex-col md:items-center">
            {/* Linha central para desktop */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-0.5 bg-primary/20 transform -translate-x-1/2"></div>

            {events.map((ev: any, i: number) => {
              const isLeft = ev.position === 'left'

              return (
                <div
                  key={i}
                  className={`relative flex flex-col md:flex-row items-start md:items-center w-full mb-12 group ${isLeft ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Ponto da linha do tempo */}
                  <div className="absolute left-[-9px] md:left-1/2 w-4 h-4 rounded-full bg-primary transform md:-translate-x-1/2 mt-1.5 md:mt-0 z-10 shadow-md ring-4 ring-background transition-transform group-hover:scale-125"></div>

                  {/* Espaço em branco para o lado oposto no desktop */}
                  <div className="hidden md:block w-1/2"></div>

                  {/* Card de conteúdo */}
                  <div
                    className={`w-full md:w-1/2 pl-6 md:pl-0 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}
                  >
                    <Card className="p-6 border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card relative overflow-hidden group-hover:-translate-y-1">
                      {ev.date && (
                        <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold mb-4 shadow-sm">
                          {new Date(ev.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </div>
                      )}
                      <div
                        className="prose prose-sm md:prose-base text-muted-foreground prose-p:leading-relaxed max-w-none"
                        dangerouslySetInnerHTML={{ __html: ev.description || '' }}
                      />
                    </Card>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    case 'media_carousel': {
      const items = block.data.items || []
      const autoplay = !!block.data.autoplay
      const delay = Number(block.data.delay) || 5000

      if (items.length === 0) {
        return (
          <div className="container mx-auto px-4 my-12 text-center text-muted-foreground p-12 bg-muted/20 rounded-2xl border border-dashed">
            Adicione mídias nas propriedades do carrossel para visualizar.
          </div>
        )
      }

      return (
        <div className="container mx-auto px-4 my-12">
          <Carousel
            opts={{
              align: 'start',
              loop: items.length > 1,
            }}
            plugins={
              autoplay
                ? [
                    Autoplay({
                      delay: delay,
                    }),
                  ]
                : []
            }
            className="w-full max-w-5xl mx-auto group relative"
          >
            <CarouselContent>
              {items.map((item: any, i: number) => (
                <CarouselItem key={i}>
                  <div className="p-1">
                    <Card className="overflow-hidden border-none shadow-lg rounded-2xl aspect-video relative bg-black flex items-center justify-center">
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          src={item.url || 'https://img.usecurling.com/p/1600/900?q=sports'}
                          alt={item.title || `Mídia ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {item.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12 text-white">
                          <h3 className="text-xl md:text-2xl font-bold">{item.title}</h3>
                        </div>
                      )}
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {items.length > 1 && (
              <>
                <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 hover:bg-white text-black border-none z-10" />
                <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 hover:bg-white text-black border-none z-10" />
              </>
            )}
          </Carousel>
        </div>
      )
    }
    default:
      return null
  }
}
