import { Link } from 'react-router-dom'
import { useCallback, useMemo } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Quote,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Play,
  Users,
  Mail,
  DollarSign,
  ThumbsUp,
} from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

function MediaCarouselSection({ data }: { data: any }) {
  const delay = Math.max(1000, Number(data.delay) || 5000)
  const autoplayEnabled = data.autoplay === undefined ? true : !!data.autoplay

  const plugins = useMemo(() => {
    return autoplayEnabled ? [Autoplay({ delay, stopOnInteraction: true })] : []
  }, [autoplayEnabled, delay])

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, plugins)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const items =
    data.items && data.items.length > 0
      ? data.items
      : [
          {
            type: 'image',
            url: 'https://img.usecurling.com/p/1200/600?seed=1',
            title: 'Imagem de Exemplo 1',
          },
          {
            type: 'image',
            url: 'https://img.usecurling.com/p/1200/600?seed=2',
            title: 'Imagem de Exemplo 2',
          },
        ]

  return (
    <section
      key={`carousel-${autoplayEnabled}-${delay}`}
      className="relative w-full overflow-hidden bg-background group"
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((item: any, idx: number) => (
            <div className="relative flex-[0_0_100%] min-w-0" key={idx}>
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full min-h-[400px] md:h-[600px] object-cover bg-muted"
                />
              ) : (
                <img
                  src={item.url || `https://img.usecurling.com/p/1200/600?seed=${idx}`}
                  alt={item.title || 'Carousel media'}
                  className="w-full min-h-[400px] md:h-[600px] object-cover bg-muted"
                />
              )}
              {item.title && (
                <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-2xl md:text-4xl font-bold text-white drop-shadow-md">
                    {item.title}
                  </h3>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {items.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 text-white p-3 rounded-full z-10 hover:bg-black/60 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 text-white p-3 rounded-full z-10 hover:bg-black/60 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </>
      )}
    </section>
  )
}

export function SectionRenderer({ section }: { section: any }) {
  const { type, data: rawData } = section
  const data = rawData || {}

  if (type === 'media_carousel') {
    return <MediaCarouselSection data={data} />
  }

  if (type === 'hero') {
    const bgImage = data.image || data.backgroundImage
    const title = data.title || 'Título Principal de Destaque'
    const subtitle =
      data.subtitle ||
      'Subtítulo atrativo que descreve seu produto ou serviço. Configure os detalhes nas propriedades.'
    return (
      <section className="relative py-28 md:py-48 flex items-center justify-center overflow-hidden w-full">
        {bgImage ? (
          <div className="absolute inset-0 z-0">
            <img src={bgImage} className="w-full h-full object-cover" alt="Hero background" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 backdrop-blur-[2px]" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-primary" />
        )}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto drop-shadow">
            {subtitle}
          </p>
          {(data.buttonText || data.link || data.buttonLink || !data.title) && (
            <Link
              to={data.link || data.buttonLink || '#'}
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all shadow-xl"
            >
              {data.buttonText || 'Saiba mais'} <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>
    )
  }

  if (type === 'feature_cards' || type === 'cards') {
    const items =
      data.items && data.items.length > 0
        ? data.items
        : [
            { title: 'Recurso Principal 1', description: 'Descrição detalhada do recurso.' },
            { title: 'Benefício Exclusivo 2', description: 'Como este benefício ajuda o usuário.' },
            { title: 'Funcionalidade Extra 3', description: 'Detalhes adicionais importantes.' },
          ]
    return (
      <section className="py-24 bg-muted/30 w-full">
        <div className="container mx-auto px-4">
          {(data.title || !data.items) && (
            <h2 className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight">
              {data.title || 'Nossos Recursos'}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item: any, i: number) => (
              <Card
                key={i}
                className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-primary/10"
              >
                <CardHeader className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{item.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                {item.link && (
                  <div className="px-8 pb-8 pt-0 mt-auto">
                    <Link
                      to={item.link}
                      className="text-primary font-bold hover:text-primary/80 flex items-center gap-2 group"
                    >
                      Saiba mais{' '}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (type === 'gallery' || type === 'galeria' || type === 'carrossel') {
    const items =
      data.items && data.items.length > 0
        ? data.items
        : data.images && data.images.length > 0
          ? data.images
          : [
              'https://img.usecurling.com/p/400/400?seed=1',
              'https://img.usecurling.com/p/400/400?seed=2',
              'https://img.usecurling.com/p/400/400?seed=3',
              'https://img.usecurling.com/p/400/400?seed=4',
            ]
    return (
      <section className="py-24 w-full bg-background">
        <div className="container mx-auto px-4">
          {(data.title || !data.items) && (
            <h2 className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight">
              {data.title || 'Nossa Galeria'}
            </h2>
          )}
          {items.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {items.map((item: any, i: number) => (
                <div
                  key={i}
                  className="aspect-square rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer group bg-muted"
                >
                  <img
                    src={item.image || item.url || item}
                    alt={`Gallery item ${i}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  if (type === 'cta') {
    const title = data.title || 'Chamada para Ação'
    const subtitle = data.subtitle || 'Este é um espaço ideal para converter seus visitantes.'
    return (
      <section
        className="py-28 relative overflow-hidden w-full"
        style={{ backgroundColor: data.backgroundColor || '#1B7D3A' }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%)',
          }}
        ></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-md tracking-tight">
            {title}
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-light">
            {subtitle}
          </p>
          {(data.buttonText || data.link || !data.title) && (
            <Link
              to={data.link || '#'}
              className="inline-block bg-white text-gray-900 px-10 py-5 rounded-full font-bold text-xl hover:bg-gray-100 hover:scale-105 transition-all shadow-2xl"
            >
              {data.buttonText || 'Acessar Agora'}
            </Link>
          )}
        </div>
      </section>
    )
  }

  if (type === 'testimonials') {
    const items =
      data.items && data.items.length > 0
        ? data.items
        : [
            {
              author: 'João Silva',
              text: 'Produto fantástico! Atendimento rápido e direto ao ponto.',
            },
            { author: 'Maria Santos', text: 'Mudou a forma como trabalhamos. Recomendo muito.' },
            {
              author: 'Carlos Almeida',
              text: 'Excelente custo-benefício. Suporte sempre presente.',
            },
          ]
    return (
      <section className="py-24 bg-muted/10 w-full border-y border-muted">
        <div className="container mx-auto px-4">
          {(data.title || !data.items) && (
            <h2 className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight">
              {data.title || 'O que dizem sobre nós'}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item: any, i: number) => (
              <div
                key={i}
                className="bg-card p-10 rounded-3xl shadow-sm border border-muted/50 relative hover:shadow-lg transition-shadow"
              >
                <Quote className="absolute top-8 right-8 w-12 h-12 text-primary/10" />
                <p className="text-lg md:text-xl text-foreground/80 mb-8 italic leading-relaxed relative z-10">
                  "{item.text || item.description}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg uppercase">
                    {(item.author || item.title || 'A').charAt(0)}
                  </div>
                  <p className="font-bold text-primary text-lg">{item.author || item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (type === 'accordion' || type === 'faq') {
    const items =
      data.items && data.items.length > 0
        ? data.items
        : [
            {
              question: 'Como funciona o serviço?',
              answer: 'Aqui vai a resposta com detalhes sobre o funcionamento.',
            },
            {
              question: 'Quais são as formas de pagamento?',
              answer: 'Aceitamos cartões de crédito, Pix e boleto.',
            },
            { question: 'Posso cancelar a qualquer momento?', answer: 'Sim, não há fidelidade.' },
          ]
    return (
      <section className="py-24 w-full bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {(data.title || !data.items) && (
            <h2 className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight">
              {data.title || 'Perguntas Frequentes'}
            </h2>
          )}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {items.map((item: any, i: number) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border rounded-2xl px-6 py-2 shadow-sm"
              >
                <AccordionTrigger className="text-left text-lg md:text-xl font-semibold hover:no-underline hover:text-primary transition-colors py-4">
                  {item.question || item.title}
                </AccordionTrigger>
                <AccordionContent className="text-base md:text-lg text-muted-foreground leading-relaxed pb-6">
                  {item.answer || item.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    )
  }

  if (type === 'rich_text_divider' || type === 'texto') {
    const title = data.title || (data.content ? '' : 'Título do Bloco de Texto')
    const content =
      data.content ||
      data.subtitle ||
      (data.title
        ? ''
        : '<p>Escreva o conteúdo textual do seu bloco aqui. Utilize tags HTML para formatação.</p>')
    return (
      <section className="py-24 w-full bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {title && (
            <h2 className="text-3xl md:text-5xl font-bold text-primary mb-8 tracking-tight">
              {title}
            </h2>
          )}
          <div
            className="prose prose-lg max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </section>
    )
  }

  if (type === 'text_image') {
    const title = data.title || 'Destaque com Imagem'
    const content =
      data.content ||
      '<p>Adicione um texto explicativo acompanhado de uma imagem representativa para ilustrar melhor a ideia.</p>'
    const imageUrl = data.imageUrl || 'https://img.usecurling.com/p/800/600?seed=text-image'
    return (
      <section className="py-24 w-full bg-background">
        <div className="container mx-auto px-4">
          <div
            className={`flex flex-col gap-12 items-center ${data.imagePosition === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'}`}
          >
            <div className="flex-1 space-y-6">
              {title && (
                <h2 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">
                  {title}
                </h2>
              )}
              <div
                className="prose prose-lg text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
            <div className="flex-1 w-full">
              <img
                src={imageUrl}
                alt={title || 'Image'}
                className="rounded-3xl shadow-2xl w-full object-cover aspect-video bg-muted"
              />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (type === 'pricing_table') {
    const plans =
      data.plans && data.plans.length > 0
        ? data.plans
        : [
            {
              name: 'Iniciante',
              price: 'R$ 29/mês',
              description: 'Para quem está começando.',
              features: ['Até 100 usuários', 'Suporte por e-mail'],
            },
            {
              name: 'Profissional',
              price: 'R$ 89/mês',
              description: 'Para profissionais em ascensão.',
              features: ['Até 1000 usuários', 'Suporte prioritário', 'Integrações'],
              highlight: true,
            },
            {
              name: 'Empresarial',
              price: 'R$ 199/mês',
              description: 'Para grandes demandas.',
              features: ['Usuários ilimitados', 'Suporte 24/7', 'Gestor de conta'],
            },
          ]
    return (
      <section className="py-24 bg-muted/10 w-full">
        <div className="container mx-auto px-4">
          {(data.title || !data.plans) && (
            <h2 className="text-3xl md:text-5xl font-bold text-center text-primary mb-16">
              {data.title || 'Planos e Preços'}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan: any, i: number) => (
              <Card
                key={i}
                className={`relative ${plan.highlight ? 'border-primary shadow-xl scale-105 z-10' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm whitespace-nowrap">
                    Mais Popular
                  </div>
                )}
                <CardHeader className="text-center p-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-extrabold mt-4">{plan.price}</div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <ul className="space-y-4 mb-8">
                    {(plan.features || []).map((feat: string, j: number) => (
                      <li key={j} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />{' '}
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.highlight ? 'default' : 'outline'}>
                    {plan.buttonText || 'Assinar'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (type === 'video') {
    return (
      <section className="py-24 w-full bg-black">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          {(data.title || !data.url) && (
            <h2 className="text-3xl font-bold text-white mb-8">
              {data.title || 'Assista ao Vídeo'}
            </h2>
          )}
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl relative bg-muted/20">
            {data.url ? (
              <iframe src={data.url} className="w-full h-full border-0" allowFullScreen />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-4">
                <Play className="w-16 h-16" />
                <p>Configure a URL do vídeo</p>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (type === 'stats_counter') {
    const stats =
      data.stats && data.stats.length > 0
        ? data.stats
        : [
            { value: '500+', label: 'Projetos Concluídos' },
            { value: '98%', label: 'Taxa de Retenção' },
            { value: '10k', label: 'Usuários Ativos' },
            { value: '24h', label: 'Suporte Dedicado' },
          ]
    return (
      <section className="py-20 bg-primary text-white w-full">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="text-4xl md:text-6xl font-extrabold">{stat.value}</div>
                <div className="text-white/80 font-medium uppercase tracking-wider text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (type === 'newsletter') {
    return (
      <section className="py-24 w-full bg-muted/5 border-y">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Mail className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {data.title || 'Assine nossa Newsletter'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {data.subtitle || 'Receba novidades e atualizações diretamente no seu e-mail.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input placeholder="Seu melhor e-mail" className="flex-1" />
            <Button>Inscrever-se</Button>
          </div>
        </div>
      </section>
    )
  }

  if (type === 'team_members') {
    const members =
      data.members && data.members.length > 0
        ? data.members
        : [
            { name: 'Ana Silva', role: 'CEO', bio: 'Especialista em gestão estratégica.' },
            { name: 'Marcos Paulo', role: 'CTO', bio: 'Arquiteto de software com 10 anos de XP.' },
            { name: 'Carla Dias', role: 'Designer', bio: 'Criativa e focada em UX.' },
            { name: 'Roberto Lima', role: 'Marketing', bio: 'Estrategista de crescimento.' },
          ]
    return (
      <section className="py-24 bg-muted/10 w-full">
        <div className="container mx-auto px-4">
          {(data.title || !data.members) && (
            <h2 className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight">
              {data.title || 'Nossa Equipe'}
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {members.map((member: any, i: number) => (
              <div key={i} className="text-center group">
                <div className="w-40 h-40 mx-auto rounded-full overflow-hidden mb-6 shadow-lg border-4 border-background group-hover:border-primary transition-colors">
                  <img
                    src={member.image || `https://img.usecurling.com/ppl/medium?seed=${i + 10}`}
                    alt={member.name}
                    className="w-full h-full object-cover bg-muted"
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (type === 'social_proof') {
    const logos =
      data.logos && data.logos.length > 0
        ? data.logos
        : [
            'https://img.usecurling.com/i?q=google&color=gray',
            'https://img.usecurling.com/i?q=amazon&color=gray',
            'https://img.usecurling.com/i?q=microsoft&color=gray',
            'https://img.usecurling.com/i?q=apple&color=gray',
            'https://img.usecurling.com/i?q=meta&color=gray',
          ]
    return (
      <section className="py-12 border-y bg-background w-full overflow-hidden">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8">
            {data.title || 'Empresas que confiam em nós'}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {logos.map((logo: string, i: number) => (
              <img key={i} src={logo} alt="Parceiro" className="h-8 md:h-12 object-contain" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (type === 'contact_form') {
    return (
      <section className="py-24 bg-background w-full">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {data.title || 'Fale Conosco'}
              </h2>
              <p className="text-muted-foreground mb-8">
                {data.subtitle ||
                  'Preencha o formulário abaixo e nossa equipe entrará em contato o mais breve possível.'}
              </p>
              {(data.email || !data.title) && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5 text-primary" /> {data.email || 'contato@empresa.com'}
                </div>
              )}
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-lg border">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Input placeholder="Seu Nome" />
                </div>
                <div className="space-y-2">
                  <Input type="email" placeholder="Seu E-mail" />
                </div>
                <div className="space-y-2">
                  <Input placeholder="Assunto" />
                </div>
                <div className="space-y-2">
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Sua Mensagem"
                  ></textarea>
                </div>
                <Button className="w-full">Enviar Mensagem</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
      <p>
        Bloco <strong>{type}</strong> não configurado visualmente.
      </p>
    </div>
  )
}
