export type FieldType =
  | 'text'
  | 'textarea'
  | 'color'
  | 'url'
  | 'number'
  | 'select'
  | 'boolean'
  | 'string_list'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  options?: { label: string; value: string }[]
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
  hero: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { name: 'backgroundColor', label: 'Cor de Fundo', type: 'color' },
          { name: 'backgroundImage', label: 'Imagem de Fundo (URL)', type: 'url' },
        ],
      },
      {
        title: 'Ação',
        fields: [
          { name: 'buttonText', label: 'Texto do Botão', type: 'text' },
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
        fields: [{ name: 'title', label: 'Título da Seção', type: 'text' }],
      },
    ],
    lists: [
      {
        name: 'items',
        label: 'Depoimentos',
        fields: [
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
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
        ],
      },
      {
        title: 'Estilo',
        fields: [{ name: 'backgroundColor', label: 'Cor de Fundo', type: 'color' }],
      },
      {
        title: 'Ação',
        fields: [
          { name: 'buttonText', label: 'Texto do Botão', type: 'text' },
          { name: 'link', label: 'Link do Botão', type: 'url' },
        ],
      },
    ],
  },
  pricing_table: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [{ name: 'title', label: 'Título da Seção', type: 'text' }],
      },
    ],
    lists: [
      {
        name: 'plans',
        label: 'Planos',
        fields: [
          { name: 'name', label: 'Nome do Plano', type: 'text' },
          { name: 'price', label: 'Preço', type: 'text' },
          { name: 'description', label: 'Descrição', type: 'text' },
          { name: 'buttonText', label: 'Texto do Botão', type: 'text' },
          { name: 'highlight', label: 'Destacar Plano', type: 'boolean' },
          { name: 'features', label: 'Recursos', type: 'string_list' },
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
          { name: 'title', label: 'Título', type: 'text' },
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
    ],
  },
  stats_counter: {
    sections: [],
    lists: [
      {
        name: 'stats',
        label: 'Estatísticas',
        fields: [
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
}
