import { Link } from 'react-router-dom'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Quote, ArrowRight, CheckCircle2 } from 'lucide-react'

export function SectionRenderer({ section }: { section: any }) {
  const { type, data } = section

  if (type === 'hero') {
    return (
      <section className="relative py-28 md:py-48 flex items-center justify-center overflow-hidden w-full">
        {data.backgroundImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={data.backgroundImage}
              className="w-full h-full object-cover"
              alt="Hero background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 backdrop-blur-[2px]" />
          </div>
        )}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">
            {data.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto drop-shadow">
            {data.subtitle}
          </p>
          {data.buttonText && (
            <Link
              to={data.buttonLink || '#'}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 hover:scale-105 transition-all shadow-xl"
            >
              {data.buttonText} <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>
    )
  }

  if (type === 'cards') {
    return (
      <section className="py-24 bg-muted/30 w-full">
        <div className="container mx-auto px-4">
          {data.title && (
            <h2 className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight">
              {data.title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(data.items || []).map((item: any, i: number) => (
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

  if (type === 'galeria') {
    return (
      <section className="py-24 w-full bg-background">
        <div className="container mx-auto px-4">
          {data.title && (
            <h2 className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight">
              {data.title}
            </h2>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {(data.images || []).map((url: string, i: number) => (
              <div
                key={i}
                className="aspect-square rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer group"
              >
                <img
                  src={url}
                  alt={`Gallery item ${i}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (type === 'cta') {
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
            {data.title}
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-light">
            {data.subtitle}
          </p>
          {data.buttonText && (
            <Link
              to={data.buttonLink || '#'}
              className="inline-block bg-white text-gray-900 px-10 py-5 rounded-full font-bold text-xl hover:bg-gray-100 hover:scale-105 transition-all shadow-2xl"
            >
              {data.buttonText}
            </Link>
          )}
        </div>
      </section>
    )
  }

  if (type === 'testimonials') {
    return (
      <section className="py-24 bg-muted/10 w-full border-y border-muted">
        <div className="container mx-auto px-4">
          {data.title && (
            <h2 className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight">
              {data.title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(data.items || []).map((item: any, i: number) => (
              <div
                key={i}
                className="bg-card p-10 rounded-3xl shadow-sm border border-muted/50 relative hover:shadow-lg transition-shadow"
              >
                <Quote className="absolute top-8 right-8 w-12 h-12 text-primary/10" />
                <p className="text-lg md:text-xl text-foreground/80 mb-8 italic leading-relaxed relative z-10">
                  "{item.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {item.author.charAt(0)}
                  </div>
                  <p className="font-bold text-primary text-lg">{item.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (type === 'faq') {
    return (
      <section className="py-24 w-full bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {data.title && (
            <h2 className="text-3xl md:text-5xl font-bold text-center text-primary mb-16 tracking-tight">
              {data.title}
            </h2>
          )}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {(data.items || []).map((item: any, i: number) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border rounded-2xl px-6 py-2 shadow-sm"
              >
                <AccordionTrigger className="text-left text-lg md:text-xl font-semibold hover:no-underline hover:text-primary transition-colors py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-base md:text-lg text-muted-foreground leading-relaxed pb-6">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    )
  }

  return null
}
