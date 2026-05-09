import {
  LayoutTemplate,
  LayoutGrid,
  MessageSquare,
  Megaphone,
  DollarSign,
  Image as ImageIcon,
  Video,
  AlignLeft,
  BarChart,
  Mail,
  List,
  Send,
  Users,
  ThumbsUp,
  Type,
  GripVertical,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

export const ELEMENT_TYPES = [
  {
    type: 'hero',
    name: 'Hero',
    icon: LayoutTemplate,
    defaultData: {
      title: 'Novo Hero',
      subtitle: 'Subtítulo incrível aqui',
      buttonText: 'Saiba Mais',
    },
  },
  {
    type: 'feature_cards',
    name: 'Feature Cards',
    icon: LayoutGrid,
    defaultData: {
      title: 'Nossos Recursos',
      items: [
        { title: 'Recurso 1', description: 'Desc 1' },
        { title: 'Recurso 2', description: 'Desc 2' },
      ],
    },
  },
  {
    type: 'testimonials',
    name: 'Testimonials',
    icon: MessageSquare,
    defaultData: {
      title: 'O que dizem',
      items: [{ text: 'Excelente plataforma!', author: 'João Silva' }],
    },
  },
  {
    type: 'cta',
    name: 'CTA',
    icon: Megaphone,
    defaultData: {
      title: 'Comece Agora',
      subtitle: 'Junte-se a nós hoje mesmo.',
      buttonText: 'Clique Aqui',
    },
  },
  {
    type: 'pricing_table',
    name: 'Pricing Table',
    icon: DollarSign,
    defaultData: {
      title: 'Planos',
      plans: [
        {
          name: 'Básico',
          price: 'R$ 99',
          description: 'Plano inicial',
          features: ['Feature 1'],
          highlight: false,
        },
      ],
    },
  },
  {
    type: 'gallery',
    name: 'Image Gallery',
    icon: ImageIcon,
    defaultData: {
      title: 'Nossa Galeria',
      items: ['https://img.usecurling.com/p/400/400?q=sports'],
    },
  },
  {
    type: 'video',
    name: 'Video Embed',
    icon: Video,
    defaultData: { title: 'Assista ao Vídeo', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  },
  {
    type: 'text_image',
    name: 'Text + Image',
    icon: AlignLeft,
    defaultData: {
      title: 'Nossa História',
      content: '<p>Texto da história...</p>',
      imageUrl: 'https://img.usecurling.com/p/600/400?q=history',
      imagePosition: 'right',
    },
  },
  {
    type: 'stats_counter',
    name: 'Stats Counter',
    icon: BarChart,
    defaultData: {
      stats: [
        { value: '100+', label: 'Clientes' },
        { value: '50', label: 'Projetos' },
      ],
    },
  },
  {
    type: 'newsletter',
    name: 'Newsletter',
    icon: Mail,
    defaultData: { title: 'Assine nossa Newsletter', subtitle: 'Fique por dentro das novidades.' },
  },
  {
    type: 'accordion',
    name: 'Accordion',
    icon: List,
    defaultData: {
      title: 'Dúvidas Frequentes',
      items: [{ question: 'Como funciona?', answer: 'É simples.' }],
    },
  },
  {
    type: 'contact_form',
    name: 'Contact Form',
    icon: Send,
    defaultData: {
      title: 'Fale Conosco',
      subtitle: 'Envie sua mensagem.',
      email: 'contato@empresa.com',
    },
  },
  {
    type: 'team_members',
    name: 'Team Members',
    icon: Users,
    defaultData: {
      title: 'Nossa Equipe',
      members: [
        {
          name: 'Maria Souza',
          role: 'CEO',
          bio: 'Fundadora',
          image: 'https://img.usecurling.com/ppl/medium?seed=1',
        },
      ],
    },
  },
  {
    type: 'social_proof',
    name: 'Social Proof',
    icon: ThumbsUp,
    defaultData: {
      title: 'Apoiado por',
      logos: ['https://img.usecurling.com/i?q=google&color=gray&shape=fill'],
    },
  },
  {
    type: 'rich_text_divider',
    name: 'Rich Text',
    icon: Type,
    defaultData: { title: 'Sobre', content: '<p>Conteúdo rico aqui...</p>' },
  },
]

export function BuilderSidebar() {
  const handleDragStart = (e: React.DragEvent, element: any) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        action: 'add',
        type: element.type,
        name: element.name,
        defaultData: element.defaultData,
      }),
    )
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="w-full md:w-[250px] bg-muted/20 border-r flex flex-col h-full">
      <div className="p-4 border-b bg-muted/40 font-semibold text-sm uppercase tracking-wider">
        Elementos
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 pb-8">
          {ELEMENT_TYPES.map((el) => (
            <Card
              key={el.type}
              draggable
              onDragStart={(e) => handleDragStart(e, el)}
              className="p-3 flex flex-col md:flex-row items-center gap-2 md:gap-3 cursor-grab hover:border-primary hover:shadow-sm transition-all active:cursor-grabbing bg-card text-center md:text-left"
            >
              <GripVertical className="hidden md:block w-4 h-4 text-muted-foreground/50" />
              <el.icon className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium">{el.name}</span>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
