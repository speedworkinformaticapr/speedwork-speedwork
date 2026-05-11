import React from 'react'
import {
  LayoutTemplate,
  LayoutGrid,
  MessageSquare,
  Megaphone,
  CircleDollarSign,
  Image as ImageIcon,
  Video,
  AlignLeft,
  BarChart,
  Mail,
  List,
  Contact,
  Users,
  ShieldCheck,
  SplitSquareHorizontal,
  FileImage,
  Newspaper,
  PlaySquare,
  GripVertical,
} from 'lucide-react'

export const BUILDER_ELEMENTS = [
  { type: 'hero', label: 'Hero', icon: LayoutTemplate },
  { type: 'feature_cards', label: 'Feature Cards', icon: LayoutGrid },
  { type: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { type: 'cta', label: 'CTA', icon: Megaphone },
  { type: 'dynamic_pricing_table', label: 'Pricing Table', icon: CircleDollarSign },
  { type: 'gallery', label: 'Image Gallery', icon: ImageIcon },
  { type: 'video', label: 'Video Embed', icon: Video },
  { type: 'text_image', label: 'Text & Image', icon: AlignLeft },
  { type: 'stats_counter', label: 'Stats Counter', icon: BarChart },
  { type: 'newsletter', label: 'Newsletter', icon: Mail },
  { type: 'accordion', label: 'FAQ / Accordion', icon: List },
  { type: 'contact_form', label: 'Contact Form', icon: Contact },
  { type: 'team_members', label: 'Team', icon: Users },
  { type: 'social_proof', label: 'Social Proof', icon: ShieldCheck },
  { type: 'rich_text_divider', label: 'Rich Text Divider', icon: SplitSquareHorizontal },
  { type: 'image', label: 'Single Image', icon: FileImage },
  { type: 'blog_posts_grid', label: 'Blog Posts', icon: Newspaper },
  { type: 'media_carousel', label: 'Media Carousel', icon: PlaySquare },
]

export function BuilderSidebar() {
  const handleDragStart = (e: React.DragEvent, el: any) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ action: 'add', type: el.type, name: el.label, defaultData: {} }),
    )
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="w-64 bg-card border-r flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-4 border-b bg-muted/40 font-semibold text-sm uppercase tracking-wider">
        Elementos
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {BUILDER_ELEMENTS.map((el) => (
          <div
            key={el.type}
            draggable
            onDragStart={(e) => handleDragStart(e, el)}
            className="flex items-center gap-3 p-3 bg-background border rounded-lg cursor-grab hover:border-primary hover:shadow-sm transition-all group"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <el.icon className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">{el.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
