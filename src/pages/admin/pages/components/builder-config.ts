export type FieldType =
  | 'text'
  | 'textarea'
  | 'color'
  | 'url'
  | 'number'
  | 'range'
  | 'select'
  | 'boolean'
  | 'string_list'
  | 'date'
  | 'sla_select'
  | 'services_multiselect'
  | 'anchor_id'
  | 'service_select'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  options?: { label: string; value: string }[]
  maxLength?: number
}

export interface ListDef {
  name: string
  label: string
  fields?: FieldDef[]
}

export interface ElementConfig {
  sections: {
    title: string
    fields: FieldDef[]
  }[]
  lists?: ListDef[]
}

export const ELEMENT_CONFIGS: Record<string, ElementConfig> = {
  map: {
    sections: [
      {
        title: 'Configurações',
        fields: [
          {
            name: 'size',
            label: 'Tamanho do Mapa',
            type: 'select',
            options: [
              { label: 'Pequeno', value: 'small' },
              { label: 'Médio', value: 'medium' },
              { label: 'Grande', value: 'large' },
            ],
          },
        ],
      },
    ],
  },
  map_element: {
    sections: [
      {
        title: 'Configurações',
        fields: [
          {
            name: 'size',
            label: 'Tamanho do Mapa',
            type: 'select',
            options: [
              { label: 'Pequeno', value: 'small' },
              { label: 'Médio', value: 'medium' },
              { label: 'Grande', value: 'large' },
            ],
          },
        ],
      },
    ],
  },
  pricing_table: {
    sections: [
      {
        title: 'Conteúdo Principal',
        fields: [
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
        ],
      },
    ],
    lists: [
      {
        name: 'plans',
        label: 'Planos',
        fields: [
          { name: 'name', label: 'Nome do Plano', type: 'text' },
          { name: 'description', label: 'Descrição', type: 'textarea' },
          { name: 'sla_id', label: 'Tipo de SLA', type: 'sla_select' },
          { name: 'buttonText', label: 'Texto do Botão', type: 'text' },
          { name: 'highlight', label: 'Destacar Plano', type: 'boolean' },
          { name: 'services', label: 'Serviços Inclusos', type: 'services_multiselect' },
        ],
      },
    ],
  },
  dynamic_pricing_table: {
    sections: [
      {
        title: 'Conteúdo Principal',
        fields: [
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
        ],
      },
    ],
    lists: [
      {
        name: 'plans',
        label: 'Planos',
        fields: [
          { name: 'name', label: 'Nome do Plano', type: 'text' },
          { name: 'description', label: 'Descrição', type: 'textarea' },
          { name: 'sla_id', label: 'Tipo de SLA', type: 'sla_select' },
          { name: 'buttonText', label: 'Texto do Botão', type: 'text' },
          { name: 'highlight', label: 'Destacar Plano', type: 'boolean' },
          { name: 'services', label: 'Serviços Inclusos', type: 'services_multiselect' },
        ],
      },
    ],
  },
  hero: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { name: 'title', label: 'Título', type: 'text', maxLength: 80 },
          { name: 'subtitle', label: 'Subtítulo', type: 'textarea', maxLength: 160 },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { name: 'backgroundColor', label: 'Cor de Fundo', type: 'color' },
          { name: 'backgroundImage', label: 'Imagem de Fundo (URL)', type: 'url' },
          { name: 'overlayOpacity', label: 'Escurecimento da Imagem (%)', type: 'range' },
        ],
      },
      {
        title: 'Ação',
        fields: [
          { name: 'buttonText', label: 'Texto do Botão', type: 'text', maxLength: 40 },
          { name: 'link', label: 'Link do Botão', type: 'url' },
        ],
      },
    ],
  },
  feature_cards: {
    sections: [
      {
        title: 'Conteúdo Principal',
        fields: [{ name: 'title', label: 'Título da Seção', type: 'text' }],
      },
    ],
    lists: [
      {
        name: 'items',
        label: 'Cards',
        fields: [
          { name: 'icon', label: 'URL do Ícone/Imagem', type: 'url' },
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'description', label: 'Descrição', type: 'textarea' },
          { name: 'link', label: 'Link', type: 'url' },
        ],
      },
    ],
  },
  testimonials: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { name: 'title', label: 'Título da Seção', type: 'text' },
          { name: 'useGoogleReviews', label: 'Exibir Avaliações do Google', type: 'boolean' },
          { name: 'googleReviewsLimit', label: 'Limite de Avaliações do Google', type: 'number' },
          {
            name: 'googleReviewsOrder',
            label: 'Ordenar Avaliações do Google',
            type: 'select',
            options: [
              { label: 'Mais Recentes', value: 'time_desc' },
              { label: 'Maior Nota', value: 'rating_desc' },
            ],
          },
        ],
      },
    ],
    lists: [
      {
        name: 'items',
        label: 'Depoimentos (Manuais)',
        fields: [
          { name: 'image', label: 'URL da Foto do Autor', type: 'url' },
          { name: 'author', label: 'Autor', type: 'text' },
          { name: 'text', label: 'Depoimento', type: 'textarea' },
        ],
      },
    ],
  },
  cta: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { name: 'title', label: 'Título', type: 'text', maxLength: 80 },
          { name: 'subtitle', label: 'Subtítulo', type: 'textarea', maxLength: 160 },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { name: 'backgroundColor', label: 'Cor de Fundo', type: 'color' },
          { name: 'backgroundImage', label: 'Imagem de Fundo (URL)', type: 'url' },
          { name: 'overlayOpacity', label: 'Escurecimento da Imagem (%)', type: 'range' },
        ],
      },
      {
        title: 'Ação',
        fields: [
          { name: 'buttonText', label: 'Texto do Botão', type: 'text', maxLength: 40 },
          { name: 'link', label: 'Link do Botão', type: 'url' },
        ],
      },
    ],
  },
  gallery: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [{ name: 'title', label: 'Título da Seção', type: 'text' }],
      },
    ],
    lists: [
      {
        name: 'items',
        label: 'Imagens (URLs)',
      },
    ],
  },
  video: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'url', label: 'URL do Vídeo (Embed)', type: 'url' },
        ],
      },
    ],
  },
  text_image: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { name: 'title', label: 'Título', type: 'text', maxLength: 80 },
          { name: 'content', label: 'Texto HTML', type: 'textarea' },
          { name: 'imageUrl', label: 'URL da Imagem', type: 'url' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          {
            name: 'imagePosition',
            label: 'Posição da Imagem',
            type: 'select',
            options: [
              { label: 'Esquerda', value: 'left' },
              { label: 'Direita', value: 'right' },
            ],
          },
        ],
      },
      {
        title: 'Ação',
        fields: [
          { name: 'buttonText', label: 'Título do Botão', type: 'text', maxLength: 40 },
          { name: 'service_slug', label: 'Serviço de Avaliação', type: 'service_select' },
          { name: 'link', label: 'Link Interno (Manual)', type: 'text' },
        ],
      },
    ],
  },
  stats_counter: {
    sections: [],
    lists: [
      {
        name: 'stats',
        label: 'Estatísticas',
        fields: [
          { name: 'icon', label: 'URL do Ícone', type: 'url' },
          { name: 'value', label: 'Valor (ex: 100+)', type: 'text' },
          { name: 'label', label: 'Rótulo', type: 'text' },
        ],
      },
    ],
  },
  newsletter: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
        ],
      },
    ],
  },
  accordion: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [{ name: 'title', label: 'Título da Seção', type: 'text' }],
      },
    ],
    lists: [
      {
        name: 'items',
        label: 'Perguntas e Respostas',
        fields: [
          { name: 'question', label: 'Pergunta', type: 'text' },
          { name: 'answer', label: 'Resposta', type: 'textarea' },
        ],
      },
    ],
  },
  contact_form: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
          { name: 'email', label: 'E-mail de Contato', type: 'text' },
        ],
      },
    ],
  },
  team_members: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [{ name: 'title', label: 'Título da Seção', type: 'text' }],
      },
    ],
    lists: [
      {
        name: 'members',
        label: 'Membros da Equipe',
        fields: [
          { name: 'name', label: 'Nome', type: 'text' },
          { name: 'role', label: 'Cargo', type: 'text' },
          { name: 'bio', label: 'Biografia', type: 'textarea' },
          { name: 'image', label: 'URL da Foto', type: 'url' },
        ],
      },
    ],
  },
  social_proof: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [{ name: 'title', label: 'Título da Seção', type: 'text' }],
      },
    ],
    lists: [
      {
        name: 'logos',
        label: 'Logos (URLs)',
      },
    ],
  },
  rich_text_divider: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'content', label: 'Conteúdo HTML', type: 'textarea' },
        ],
      },
    ],
  },
  image: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { name: 'url', label: 'URL da Imagem', type: 'url' },
          { name: 'alt', label: 'Texto Alternativo', type: 'text' },
          { name: 'caption', label: 'Legenda', type: 'text' },
        ],
      },
    ],
  },
  blog_posts_grid: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
          { name: 'limit', label: 'Limite de Posts', type: 'number' },
        ],
      },
    ],
  },
  timeline: {
    sections: [
      {
        title: 'Conteúdo Principal',
        fields: [{ name: 'title', label: 'Título da Linha do Tempo', type: 'text' }],
      },
    ],
    lists: [
      {
        name: 'events',
        label: 'Eventos',
        fields: [
          { name: 'date', label: 'Data', type: 'date' },
          { name: 'description', label: 'Texto', type: 'textarea' },
          {
            name: 'position',
            label: 'Lado da Linha',
            type: 'select',
            options: [
              { label: 'Esquerda', value: 'left' },
              { label: 'Direita', value: 'right' },
            ],
          },
        ],
      },
    ],
  },
  media_carousel: {
    sections: [
      {
        title: 'Configurações',
        fields: [
          { name: 'autoplay', label: 'Reprodução Automática', type: 'boolean' },
          { name: 'delay', label: 'Tempo (ms)', type: 'number' },
          {
            name: 'transition',
            label: 'Efeito de Transição',
            type: 'select',
            options: [
              { label: 'Deslizar (Slide)', value: 'slide' },
              { label: 'Esmaecer (Fade)', value: 'fade' },
              { label: 'Aumentar (Scale)', value: 'scale' },
              { label: 'Cubo (Cube)', value: 'cube' },
              { label: 'Girar (Flip)', value: 'flip' },
            ],
          },
        ],
      },
      {
        title: 'Posicionamento do Texto',
        fields: [
          {
            name: 'alignHorizontal',
            label: 'Alinhamento Horizontal',
            type: 'select',
            options: [
              { label: 'Esquerda', value: 'left' },
              { label: 'Centro', value: 'center' },
              { label: 'Direita', value: 'right' },
            ],
          },
          {
            name: 'alignVertical',
            label: 'Alinhamento Vertical',
            type: 'select',
            options: [
              { label: 'Topo', value: 'top' },
              { label: 'Centro', value: 'center' },
              { label: 'Base', value: 'bottom' },
            ],
          },
        ],
      },
    ],
    lists: [
      {
        name: 'items',
        label: 'Mídias',
        fields: [
          { name: 'url', label: 'URL da Mídia', type: 'url' },
          {
            name: 'type',
            label: 'Tipo',
            type: 'select',
            options: [
              { label: 'Imagem', value: 'image' },
              { label: 'Vídeo', value: 'video' },
            ],
          },
          { name: 'title', label: 'Título', type: 'text', maxLength: 80 },
          { name: 'subtitle', label: 'Subtítulo', type: 'textarea', maxLength: 160 },
          { name: 'buttonText', label: 'Texto do Botão', type: 'text', maxLength: 40 },
          { name: 'buttonLink', label: 'Link do Botão', type: 'url' },
          { name: 'overlayOpacity', label: 'Escurecimento da Imagem (%)', type: 'range' },
        ],
      },
    ],
  },
}

const ANIMATION_SECTION = {
  title: 'Animação',
  fields: [
    {
      name: 'animation',
      label: 'Animação de Entrada',
      type: 'select' as FieldType,
      options: [
        { label: 'Nenhum', value: 'none' },
        { label: 'Fade In (Esmaecimento)', value: 'fade-in' },
        { label: 'Deslizar para Cima (Slide Up)', value: 'fade-in-up' },
        { label: 'Deslizar para Baixo (Slide Down)', value: 'fade-in-down' },
        { label: 'Deslizar para Esquerda (Slide Left)', value: 'fade-in-left' },
        { label: 'Deslizar para Direita (Slide Right)', value: 'fade-in-right' },
        { label: 'Aproximar (Zoom In)', value: 'zoom-in' },
      ],
    },
  ],
}

Object.values(ELEMENT_CONFIGS).forEach((config) => {
  if (!config.sections.some((s) => s.title === 'Animação')) {
    config.sections.push(ANIMATION_SECTION)
  }
})

const IDENTIFICATION_SECTION = {
  title: 'Identificação',
  fields: [
    {
      name: 'anchorId',
      label: 'ID da Âncora',
      type: 'anchor_id' as FieldType,
    },
  ],
}

Object.values(ELEMENT_CONFIGS).forEach((config) => {
  if (!config.sections.some((s) => s.title === 'Identificação')) {
    config.sections.unshift(IDENTIFICATION_SECTION)
  }
})
