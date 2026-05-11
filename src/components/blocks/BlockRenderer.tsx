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
import { DynamicPricingTableBlock } from './DynamicPricingTableBlock'
import { MapBlock } from './MapBlock'
import { SectionRenderer } from '@/components/sections/SectionRenderer'

export function BlockRenderer({ block }: { block: any }) {
  if (!block || !block.type || !block.data) return null

  const blockType = String(block.type).trim().toLowerCase()

  switch (blockType) {
    case 'map':
    case 'map_element':
      return <MapBlock data={block.data} />
    case 'pricing_table':
    case 'dynamic_pricing':
    case 'dynamic_pricing_table':
      return <DynamicPricingTableBlock data={block.data} />
    case 'hero':
      return <SectionRenderer section={{ type: 'hero', data: block.data }} />
    case 'text_image':
      return <SectionRenderer section={{ type: 'text_image', data: block.data }} />
    case 'features':
    case 'feature_cards':
      return <SectionRenderer section={{ type: 'feature_cards', data: block.data }} />
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
      return <SectionRenderer section={{ type: 'video', data: block.data }} />
    case 'gallery':
    case 'galeria':
    case 'carrossel':
      return <SectionRenderer section={{ type: 'gallery', data: block.data }} />
    case 'cta':
      return <SectionRenderer section={{ type: 'cta', data: block.data }} />
    case 'blog_posts_grid':
    case 'blog_posts':
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
    case 'media_carousel':
      return <SectionRenderer section={{ type: 'media_carousel', data: block.data }} />
    default:
      console.warn(
        `[BlockRenderer] Unmapped block type received: "${block.type}" (normalized: "${blockType}"). Block data:`,
        block.data,
      )
      return (
        <div className="container mx-auto px-4 my-12">
          <div className="p-12 text-center bg-muted/20 border-2 border-dashed border-muted-foreground/30 rounded-2xl text-muted-foreground shadow-sm">
            Bloco do tipo <strong className="text-foreground">{blockType}</strong> não configurado
            visualmente.
          </div>
        </div>
      )
  }
}
