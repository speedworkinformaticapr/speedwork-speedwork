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
import { TestimonialsBlock } from './TestimonialsBlock'

export function BlockRenderer({ block }: { block: any }) {
  if (!block || !block.type || !block.data) return null

  const blockType = String(block.type).trim().toLowerCase()
  const blockId = (block.data?.anchorId || block.name || '').trim() || undefined

  switch (blockType) {
    case 'map':
    case 'map_element':
      return (
        <div id={blockId}>
          <MapBlock data={block.data} />
        </div>
      )
    case 'pricing_table':
    case 'dynamic_pricing':
    case 'dynamic_pricing_table':
      return (
        <div id={blockId}>
          <DynamicPricingTableBlock data={block.data} />
        </div>
      )
    case 'hero':
      return <SectionRenderer section={{ type: 'hero', data: block.data, id: blockId }} />
    case 'text_image':
      return <SectionRenderer section={{ type: 'text_image', data: block.data, id: blockId }} />
    case 'features':
    case 'feature_cards':
      return <SectionRenderer section={{ type: 'feature_cards', data: block.data, id: blockId }} />
    case 'text':
      return (
        <div id={blockId} className="container mx-auto px-4">
          <div
            className="prose prose-lg max-w-none text-foreground my-8"
            dangerouslySetInnerHTML={{ __html: block.data.content || '' }}
          />
        </div>
      )
    case 'image':
      return (
        <div id={blockId} className="container mx-auto px-4 my-8 flex flex-col items-center">
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
      return <SectionRenderer section={{ type: 'video', data: block.data, id: blockId }} />
    case 'gallery':
    case 'galeria':
    case 'carrossel':
      return <SectionRenderer section={{ type: 'gallery', data: block.data, id: blockId }} />
    case 'cta':
      return <SectionRenderer section={{ type: 'cta', data: block.data, id: blockId }} />
    case 'testimonials':
      return <TestimonialsBlock data={block.data} id={blockId} />
    case 'blog_posts_grid':
    case 'blog_posts':
      return (
        <div id={blockId}>
          <BlogPostsGrid block={block} />
        </div>
      )
    case 'timeline':
      return <SectionRenderer section={{ type: 'timeline', data: block.data, id: blockId }} />
    case 'media_carousel':
      return <SectionRenderer section={{ type: 'media_carousel', data: block.data, id: blockId }} />
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
