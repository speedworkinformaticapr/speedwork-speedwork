import React from 'react'
import { Users, Target, Shield, Trophy } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { BlogPostsGrid } from '@/components/blocks/BlogPostsGrid'

export function BlockRenderer({ block }: { block: any }) {
  if (!block || !block.type || !block.data) return null

  switch (block.type) {
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
      const images = Array.isArray(block.data.images) ? block.data.images : []
      return (
        <div className="container mx-auto px-4 my-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {images.map((img: any, i: number) => (
            <div
              key={i}
              className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <img
                src={img.url}
                alt={img.alt || `Galeria imagem ${i + 1}`}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
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
    default:
      return null
  }
}
