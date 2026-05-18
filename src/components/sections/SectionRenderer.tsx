import { Link } from 'react-router-dom'
import { useCallback, useMemo } from 'react'
import { MediaCarousel } from './MediaCarousel'
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
import { DynamicPricingTableBlock } from '@/components/blocks/DynamicPricingTableBlock'

export function SectionRenderer({ section }: { section: any }) {
  const { type, data: rawData, id: sectionId } = section
  const data = rawData || {}

  // Resolve links gracefully - se iniciar com # ou http usamos um <a/> comum, caso contrário <Link/>
  const renderLink = (url: string, children: React.ReactNode, className?: string) => {
    if (!url) return null
    if (url.startsWith('#') || url.startsWith('/#') || url.startsWith('http')) {
      return (
        <a
          href={url}
          className={className}
          target={url.startsWith('http') ? '_blank' : undefined}
          rel={url.startsWith('http') ? 'noreferrer' : undefined}
          onClick={(e) => {
            if (url.startsWith('#') || url.startsWith('/#')) {
              const hashIndex = url.indexOf('#')
              const id = url.substring(hashIndex + 1)
              if (id) {
                const element = document.getElementById(id)
                if (element) {
                  e.preventDefault()
                  element.scrollIntoView({ behavior: 'smooth' })
                  window.history.pushState(null, '', url.substring(hashIndex))
                }
              }
            }
          }}
        >
          {children}
        </a>
      )
    }
    return (
      <Link to={url} className={className}>
        {children}
      </Link>
    )
  }

  if (type === 'media_carousel') {
    return (
      <div id={sectionId}>
        <MediaCarousel data={data} />
      </div>
    )
  }

  if (type === 'hero') {
    const bgImage = data.image || data.backgroundImage
    const title = data.title || 'Título Principal de Destaque'
    const subtitle =
      data.subtitle ||
      'Subtítulo atrativo que descreve seu produto ou serviço. Configure os detalhes nas propriedades.'
    const overlayOpacity = data.overlayOpacity !== undefined ? data.overlayOpacity : 40

    return (
      <section
        id={sectionId}
        className="relative py-28 md:py-48 flex items-center justify-center overflow-hidden w-full"
      >
        {bgImage ? (
          <div className="absolute inset-0 z-0">
            <img src={bgImage} className="w-full h-full object-cover" alt="Hero background" />
            <div
              className="absolute inset-0 backdrop-blur-[2px]"
              style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-primary" />
        )}
        <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center justify-center">
          <h1
            className="text-4xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <div
            className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto drop-shadow [&_p]:mb-2 [&_p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />
          {(data.buttonText || data.link || data.buttonLink || !data.title) && (
            <Button
              asChild
              size="lg"
              className="px-8 py-6 text-lg rounded-full shadow-xl hover:scale-105 transition-all"
            >
              {renderLink(
                data.link || data.buttonLink || '#',
                <>
                  {data.buttonText || 'Saiba mais'} <ArrowRight className="w-5 h-5 ml-2" />
                </>,
              )}
            </Button>
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
      <section id={sectionId} className="py-24 bg-muted/30 w-full">
        <div className="container mx-auto px-4">
          {(data.title || !data.items) && (
            <h2
              className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight"
              dangerouslySetInnerHTML={{ __html: data.title || 'Nossos Recursos' }}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item: any, i: number) => (
              <Card
                key={i}
                className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-primary/10"
              >
                <CardHeader className="p-8">
                  {item.icon || item.image || item.url ? (
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner overflow-hidden">
                      <img
                        src={item.icon || item.image || item.url}
                        alt="Icon"
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                  )}
                  <CardTitle
                    className="text-2xl mb-2"
                    dangerouslySetInnerHTML={{ __html: item.title || '' }}
                  />
                  <div
                    className="text-base text-muted-foreground leading-relaxed w-full [&_p]:mb-2 [&_p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: item.description || '' }}
                  />
                </CardHeader>
                {item.link && (
                  <div className="px-8 pb-8 pt-0 mt-auto">
                    {renderLink(
                      item.link,
                      <>
                        Saiba mais{' '}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>,
                      'text-primary font-bold hover:text-primary/80 flex items-center gap-2 group',
                    )}
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
      <section id={sectionId} className="py-24 w-full bg-background">
        <div className="container mx-auto px-4">
          {(data.title || !data.items) && (
            <h2
              className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight"
              dangerouslySetInnerHTML={{ __html: data.title || 'Nossa Galeria' }}
            />
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
    const bgImage = data.backgroundImage
    const overlayOpacity = data.overlayOpacity !== undefined ? data.overlayOpacity : 40

    return (
      <section
        id={sectionId}
        className="py-28 relative overflow-hidden w-full"
        style={{ backgroundColor: data.backgroundColor || '#1B7D3A' }}
      >
        {bgImage && (
          <div className="absolute inset-0 z-0">
            <img src={bgImage} className="w-full h-full object-cover" alt="CTA background" />
            <div
              className="absolute inset-0 backdrop-blur-[2px]"
              style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
            />
          </div>
        )}
        {!bgImage && (
          <div
            className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%)',
            }}
          ></div>
        )}
        <div className="container mx-auto px-4 text-center relative z-10 flex flex-col items-center justify-center">
          <h2
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-md tracking-tight"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <div
            className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-light [&_p]:mb-2 [&_p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />
          {(data.buttonText || data.link || !data.title) && (
            <Button
              asChild
              size="lg"
              variant={bgImage ? 'default' : 'secondary'}
              className="px-10 py-6 text-xl rounded-full shadow-2xl hover:scale-105 transition-all"
            >
              {renderLink(data.link || '#', <>{data.buttonText || 'Acessar Agora'}</>)}
            </Button>
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
      <section id={sectionId} className="py-24 bg-muted/10 w-full border-y border-muted">
        <div className="container mx-auto px-4">
          {(data.title || !data.items) && (
            <h2
              className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight"
              dangerouslySetInnerHTML={{ __html: data.title || 'O que dizem sobre nós' }}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item: any, i: number) => (
              <div
                key={i}
                className="bg-card p-10 rounded-3xl shadow-sm border border-muted/50 relative hover:shadow-lg transition-shadow"
              >
                <Quote className="absolute top-8 right-8 w-12 h-12 text-primary/10" />
                <div
                  className="text-lg md:text-xl text-foreground/80 mb-8 italic leading-relaxed relative z-10 w-full [&_p]:mb-2 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: item.text || item.description || '' }}
                />
                <div className="flex items-center gap-4">
                  {item.image || item.icon || item.url ? (
                    <img
                      src={item.image || item.icon || item.url}
                      alt="Author"
                      className="w-12 h-12 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg uppercase">
                      {(item.author || item.title || 'A').charAt(0)}
                    </div>
                  )}
                  <div
                    className="font-bold text-primary text-lg [&_p]:mb-0"
                    dangerouslySetInnerHTML={{ __html: item.author || item.title || '' }}
                  />
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
      <section id={sectionId} className="py-24 w-full bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {(data.title || !data.items) && (
            <h2
              className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight"
              dangerouslySetInnerHTML={{ __html: data.title || 'Perguntas Frequentes' }}
            />
          )}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {items.map((item: any, i: number) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border rounded-2xl px-6 py-2 shadow-sm"
              >
                <AccordionTrigger className="text-left text-lg md:text-xl font-semibold hover:no-underline hover:text-primary transition-colors py-4">
                  <span dangerouslySetInnerHTML={{ __html: item.question || item.title || '' }} />
                </AccordionTrigger>
                <AccordionContent className="text-base md:text-lg text-muted-foreground leading-relaxed pb-6">
                  <div
                    className="w-full [&_p]:mb-2 [&_p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: item.answer || item.description || '' }}
                  />
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
      <section id={sectionId} className="py-24 w-full bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {title && (
            <h2
              className="text-3xl md:text-5xl font-bold text-primary mb-8 tracking-tight"
              dangerouslySetInnerHTML={{ __html: title }}
            />
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
      <section id={sectionId} className="py-24 w-full bg-background">
        <div className="container mx-auto px-4">
          <div
            className={`flex flex-col gap-12 items-center ${data.imagePosition === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'}`}
          >
            <div className="flex-1 space-y-6">
              {title && (
                <h2
                  className="text-3xl md:text-5xl font-bold text-primary tracking-tight"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
              )}
              <div
                className="prose prose-lg text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
            <div className="flex-1 w-full">
              <img
                src={imageUrl}
                alt="Image"
                className="rounded-3xl shadow-2xl w-full object-cover aspect-video bg-muted"
              />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (type === 'pricing_table' || type === 'dynamic_pricing_table' || type === 'dynamic_pricing') {
    return (
      <div id={sectionId} className="w-full">
        <DynamicPricingTableBlock data={data} />
      </div>
    )
  }

  if (type === 'video') {
    return (
      <section id={sectionId} className="py-24 w-full bg-black">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          {(data.title || !data.url) && (
            <h2
              className="text-3xl font-bold text-white mb-8"
              dangerouslySetInnerHTML={{ __html: data.title || 'Assista ao Vídeo' }}
            />
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
      <section id={sectionId} className="py-20 bg-primary text-white w-full">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="text-4xl md:text-6xl font-extrabold">{stat.value}</div>
                <div
                  className="text-white/80 font-medium uppercase tracking-wider text-sm md:text-base"
                  dangerouslySetInnerHTML={{ __html: stat.label || '' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (type === 'newsletter') {
    return (
      <section id={sectionId} className="py-24 w-full bg-muted/5 border-y">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Mail className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            dangerouslySetInnerHTML={{ __html: data.title || 'Assine nossa Newsletter' }}
          />
          <div
            className="text-muted-foreground mb-8 [&_p]:mb-2 [&_p:last-child]:mb-0"
            dangerouslySetInnerHTML={{
              __html: data.subtitle || 'Receba novidades e atualizações diretamente no seu e-mail.',
            }}
          />
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
      <section id={sectionId} className="py-24 bg-muted/10 w-full">
        <div className="container mx-auto px-4">
          {(data.title || !data.members) && (
            <h2
              className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight"
              dangerouslySetInnerHTML={{ __html: data.title || 'Nossa Equipe' }}
            />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {members.map((member: any, i: number) => (
              <div key={i} className="text-center group">
                <div className="w-40 h-40 mx-auto rounded-full overflow-hidden mb-6 shadow-lg border-4 border-background group-hover:border-primary transition-colors">
                  <img
                    src={
                      member.image ||
                      member.icon ||
                      member.url ||
                      `https://img.usecurling.com/ppl/medium?seed=${i + 10}`
                    }
                    alt="Team Member"
                    className="w-full h-full object-cover bg-muted"
                  />
                </div>
                <h3
                  className="text-xl font-bold mb-1"
                  dangerouslySetInnerHTML={{ __html: member.name || '' }}
                />
                <div
                  className="text-primary font-medium mb-3 [&_p]:mb-0"
                  dangerouslySetInnerHTML={{ __html: member.role || '' }}
                />
                <div
                  className="text-sm text-muted-foreground w-full [&_p]:mb-2 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: member.bio || '' }}
                />
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
      <section id={sectionId} className="py-12 border-y bg-background w-full overflow-hidden">
        <div className="container mx-auto px-4">
          <div
            className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8 [&_p]:mb-0"
            dangerouslySetInnerHTML={{ __html: data.title || 'Empresas que confiam em nós' }}
          />
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
      <section id={sectionId} className="py-24 bg-background w-full">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2
                className="text-3xl md:text-4xl font-bold mb-6"
                dangerouslySetInnerHTML={{ __html: data.title || 'Fale Conosco' }}
              />
              <div
                className="text-muted-foreground mb-8 [&_p]:mb-2 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{
                  __html:
                    data.subtitle ||
                    'Preencha o formulário abaixo e nossa equipe entrará em contato o mais breve possível.',
                }}
              />
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
    <div
      id={sectionId}
      className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10"
    >
      <p>
        Bloco <strong>{type}</strong> não configurado visualmente.
      </p>
    </div>
  )
}
