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
  Map as MapIcon,
  GitCommit,
  type LucideIcon,
} from 'lucide-react'

export interface BuilderElementItem {
  type: string
  label: string
  description: string
  icon: LucideIcon
  defaultData?: any
}

export const BUILDER_ELEMENTS: BuilderElementItem[] = [
  {
    type: 'hero',
    label: 'Hero',
    description:
      'Destaque visual de topo com título, subtítulo, botão de ação e imagem ou cor de fundo.',
    icon: LayoutTemplate,
  },
  {
    type: 'feature_cards',
    label: 'Feature Cards',
    description: 'Grade de recursos e benefícios com ícones, títulos e textos descritivos.',
    icon: LayoutGrid,
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'Depoimentos de clientes com fotos e integração com avaliações do Google.',
    icon: MessageSquare,
  },
  {
    type: 'cta',
    label: 'CTA',
    description:
      'Chamada para ação destacada com botão de conversão e plano de fundo personalizado.',
    icon: Megaphone,
  },
  {
    type: 'dynamic_pricing_table',
    label: 'Pricing Table (Dinâmica)',
    description: 'Tabela de preços interativa com seleção de SLA, serviços inclusos e destaque.',
    icon: CircleDollarSign,
  },
  {
    type: 'gallery',
    label: 'Image Gallery',
    description: 'Galeria moderna de imagens em grade responsiva com visualização.',
    icon: ImageIcon,
  },
  {
    type: 'video',
    label: 'Video Embed',
    description: 'Incorporação de vídeo (YouTube, Vimeo ou link direto) em alta resolução.',
    icon: Video,
  },
  {
    type: 'text_image',
    label: 'Text & Image',
    description: 'Bloco dividido com texto formatado, botão de ação e imagem lateral.',
    icon: AlignLeft,
  },
  {
    type: 'stats_counter',
    label: 'Stats Counter',
    description: 'Contadores numéricos e métricas de impacto para destacar conquistas.',
    icon: BarChart,
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    description: 'Caixa de captura de e-mails para lista de novidades e boletins informativos.',
    icon: Mail,
  },
  {
    type: 'accordion',
    label: 'FAQ / Accordion',
    description: 'Perguntas frequentes e respostas expansíveis em formato sanfona.',
    icon: List,
  },
  {
    type: 'contact_form',
    label: 'Contact Form',
    description: 'Formulário completo para mensagens de contato direto de clientes.',
    icon: Contact,
  },
  {
    type: 'team_members',
    label: 'Team',
    description: 'Apresentação de membros da equipe com fotos, cargos e biografias.',
    icon: Users,
  },
  {
    type: 'social_proof',
    label: 'Social Proof',
    description: 'Logotipos de clientes parceiros e empresas atendidas para gerar autoridade.',
    icon: ShieldCheck,
  },
  {
    type: 'rich_text_divider',
    label: 'Rich Text Divider',
    description: 'Divisor de conteúdo com texto rico, títulos e formatação livre.',
    icon: SplitSquareHorizontal,
  },
  {
    type: 'image',
    label: 'Single Image',
    description: 'Imagem única em destaque com suporte a texto alternativo e legenda.',
    icon: FileImage,
  },
  {
    type: 'blog_posts_grid',
    label: 'Blog Posts Grid',
    description: 'Grade automática exibindo as postagens e artigos mais recentes do blog.',
    icon: Newspaper,
  },
  {
    type: 'media_carousel',
    label: 'Media Carousel',
    description: 'Carrossel interativo de fotos e vídeos com efeitos de transição modernos.',
    icon: PlaySquare,
  },
  {
    type: 'map',
    label: 'Mapa',
    description: 'Mapa interativo de localização e unidade de atendimento.',
    icon: MapIcon,
  },
  {
    type: 'timeline',
    label: 'Linha do Tempo (Timeline)',
    description: 'Linha do tempo cronológica para histórico da empresa ou etapas de processo.',
    icon: GitCommit,
  },
]
