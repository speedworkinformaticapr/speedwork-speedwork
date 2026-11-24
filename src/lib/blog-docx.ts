// Conteúdo do documento "Módulo Blog (Postagens)" do Speedwork
// (usado por src/lib/blog-docx-build.ts).
// Referência real do levantamento: src/services/blog.ts, src/lib/blog-content.tsx,
// src/lib/blog-*.ts, src/pages/admin/blog/*, src/pages/blog/*, src/hooks/use-blog-autosave.ts,
// src/hooks/use-seo.ts, edge function generate-ai-text e RPC increment_blog_view.

export interface BlogDocxTable {
  caption: string
  headers: string[]
  rows: string[][]
  widths?: number[]
}

export interface BlogDocxSection {
  title: string
  paragraphs?: string[]
  paragraphs2?: string[]
  bullets?: string[]
  code?: string[]
  table?: BlogDocxTable
}

// ============================================================================
// 1. VISÃO GERAL
// ============================================================================
const VISAO_GERAL: BlogDocxSection = {
  title: '1. VISÃO GERAL',
  paragraphs: [
    'O módulo Blog (Postagens) do Speedwork é um CMS de artigos completo, dividido em 4 camadas que trabalham de forma independente:',
  ],
  bullets: [
    'Camada pública (leitura): páginas /blog (grade de cards publicados) e /blog/:id (post completo com SEO, engajamento e comentários). Nenhum visitante escreve diretamente no conteúdo — apenas em comentários, avaliações e reações.',
    'Camada admin (gestão): tela AdminBlogList (listagem com edição inline de categoria e status) e AdminBlogForm (formulário em 4 cartões com autosave, contadores de limite e botão de IA em cada campo de texto).',
    'Camada de persistência: 4 tabelas no Supabase (blog_posts, blog_comments, blog_ratings e blog_reactions) com RLS — leitura pública apenas do que está published/approved, escrita restrita a admin autenticado — e a RPC increment_blog_view para contagem de acessos do lado do servidor.',
    'Camada de IA integrada: todo campo de texto do formulário tem botão "IA" (componente AIGenerateButton) que chama a edge function generate-ai-text com o contexto do campo; a mesma function gera imagens de capa (type "image", ratio 16:9). A chave da OpenAI nunca vai ao navegador: vive apenas como secret do backend.',
  ],
  code: [
    'Conteúdo bilíngue: os campos title e content guardam o texto no idioma principal do sistema; as traduções ficam em title_i18n e content_i18n (JSON por idioma). A exibição sempre passa pelo hook useTranslation (função tf), que devolve o texto no idioma ativo do visitante e cai para o idioma principal quando a tradução não existe.',
  ],
}

// ============================================================================
// 2. BANCO DE DADOS (SUPABASE)
// ============================================================================
const BANCO_DE_DADOS: BlogDocxSection[] = [
  {
    title: '2. BANCO DE DADOS (SUPABASE)',
    paragraphs: [
      'Quatro tabelas sustentam o módulo. Todas têm chave primária uuid, timestamps created_at e políticas de RLS: anônimo lê somente posts published e comentários approved; escrita exige sessão autenticada de admin.',
    ],
    table: {
      caption: 'Tabela blog_posts — cada post do blog',
      headers: ['Coluna', 'Tipo', 'Função'],
      widths: [24, 16, 60],
      rows: [
        ['id', 'uuid (PK)', 'Identificador do post.'],
        ['title', 'text', 'Título (máx. 100 caracteres no formulário); tradução em title_i18n.'],
        [
          'content',
          'text',
          'Conteúdo principal em markdown/WYSIWYG (máx. 2000 palavras); tradução em content_i18n.',
        ],
        ['category', 'text', 'Categoria (máx. 50 caracteres), editável inline na listagem.'],
        ['author_id', 'uuid (FK auth.users)', 'Autor do post.'],
        [
          'published_at',
          'timestamptz',
          'Gravado automaticamente quando o status vira "Publicado".',
        ],
        ['created_at', 'timestamptz', 'Data de criação.'],
        ['image_url', 'text', 'URL da imagem de capa (bucket storage/media ou gerada por IA).'],
        ['summary', 'text', 'Resumo/Lead exibido nos cards (máx. 160 caracteres).'],
        [
          'tags',
          'jsonb (array)',
          'Lista de tags do post; alimenta as sugestões automáticas do TagInput.',
        ],
        [
          'status',
          'text',
          'Rascunho (draft) | Revisão (review) | Publicado (published) | Arquivado (archived).',
        ],
        ['is_active', 'boolean', 'Liga/desliga o post sem mudar o status.'],
        ['introduction', 'text', 'Introdução (máx. 800 caracteres), exibida em estilo citação.'],
        ['conclusion', 'text', 'Conclusão (máx. 300 palavras).'],
        [
          'takeaways',
          'text',
          'Pontos principais em bullets (máx. 500 caracteres), caixa destacada.',
        ],
        ['cta_final', 'text', 'Chamada para ação final (máx. 150 caracteres).'],
        [
          'cover_alt_text',
          'text',
          'Texto alternativo da capa (máx. 125 caracteres, acessibilidade/SEO).',
        ],
        ['author_source', 'text', 'Autor/fonte exibida no post (máx. 100 caracteres).'],
        ['seo_description', 'text', 'Meta description (máx. 160 caracteres).'],
        ['view_count', 'integer', 'Contador de visualizações, incrementado só pela RPC.'],
        [
          'step_images',
          'jsonb',
          'Array de objetos [{url, description}] — imagens intercaladas no texto.',
        ],
      ],
    },
  },
  {
    title: '2.1 blog_comments — comentários com moderação',
    table: {
      caption: 'Tabela blog_comments — comentários moderados',
      headers: ['Coluna', 'Tipo', 'Função'],
      widths: [24, 16, 60],
      rows: [
        ['id', 'uuid (PK)', 'Identificador do comentário.'],
        ['post_id', 'uuid (FK blog_posts)', 'Post comentado.'],
        ['author_name', 'text', 'Nome de quem comentou.'],
        ['email', 'text', 'E-mail opcional do autor.'],
        ['content', 'text', 'Texto do comentário.'],
        [
          'status',
          'text',
          'pending → approved. Só "approved" aparece no post; moderação pela admin.',
        ],
        ['created_at', 'timestamptz', 'Data de envio.'],
      ],
    },
  },
  {
    title: '2.2 blog_ratings — avaliações por estrelas',
    table: {
      caption: 'Tabela blog_ratings — notas de 1 a 5',
      headers: ['Coluna', 'Tipo', 'Função'],
      widths: [24, 16, 60],
      rows: [
        ['id', 'uuid (PK)', 'Identificador da avaliação.'],
        ['post_id', 'uuid (FK blog_posts)', 'Post avaliado.'],
        ['score', 'integer', 'Nota de 1 a 5; a média é calculada no cliente (ratingService).'],
        ['created_at', 'timestamptz', 'Data da avaliação.'],
      ],
    },
  },
  {
    title: '2.3 blog_reactions — reações por emoji',
    table: {
      caption: 'Tabela blog_reactions — reações (emoji)',
      headers: ['Coluna', 'Tipo', 'Função'],
      widths: [24, 16, 60],
      rows: [
        ['id', 'uuid (PK)', 'Identificador da reação.'],
        ['post_id', 'uuid (FK blog_posts)', 'Post reagido.'],
        [
          'type',
          'text',
          'Tipo da reação (emoji); contagem agregada por tipo no cliente (reactionService).',
        ],
        ['created_at', 'timestamptz', 'Data da reação.'],
      ],
    },
  },
  {
    title: '2.4 RPC increment_blog_view(post_id)',
    paragraphs: [
      'A contagem de visualizações nunca é escrita direto pelo visitante na tabela. A função increment_blog_view(post_id) roda no servidor com security definer: o post público /blog/:id chama a RPC uma vez por visita e ela soma 1 em blog_posts.view_count. Isso impede manipulação do contador e mantém a RLS da tabela restritiva (anon sem UPDATE).',
    ],
  },
]

// ============================================================================
// 3. TELAS
// ============================================================================
const TELAS_ADMIN_LISTA: BlogDocxSection = {
  title: '3. TELAS — ADMIN LISTAGEM (AdminBlogList, rota /admin/settings/blog)',
  paragraphs: [
    'A listagem admin mostra todas as postagens (qualquer status) em tabela com as colunas Título, Categoria, Status, Views, Data e Ações.',
  ],
  bullets: [
    'Edição inline: categoria e status são dropdowns na própria linha; a mudança salva na hora via updatePostField e confirma com toast.',
    'Filtros: busca por título/categoria com debounce, filtro por status, filtro por período de datas e ordenação clicando no cabeçalho das colunas.',
    'Exclusão definitiva: o ícone de excluir chama hardDeleteRecord (serviço hard-delete), que usa a edge function delete-user com requireAdmin — nunca um delete direto do cliente — e trata erros de FK com mensagem amigável, via ConfirmDialog.',
    'Botão "IA": abre o BlogAiModelSettings, onde se configura o modelo de IA usado por todos os botões de geração do módulo.',
    'Botão "Novo Post": leva ao formulário AdminBlogForm em modo de criação.',
  ],
}

const TELAS_ADMIN_FORM: BlogDocxSection = {
  title: '3.1 ADMIN FORMULÁRIO (AdminBlogForm, rotas /admin/settings/blog/new e /:id/edit)',
  paragraphs: [
    'O formulário é organizado em 4 cartões, todos os campos de texto com contador de caracteres/palavras e botão "IA" próprio:',
  ],
  bullets: [
    'Cartão 1 — Básico: Título (máx. 100, botão IA), Categoria (máx. 50), Status (Rascunho/Revisão/Publicado/Arquivado) e Autor/Fonte (máx. 100).',
    'Cartão 2 — Capa e imagens: preview da capa; seleção via Galeria (MediaPicker, bucket storage/media) ou "Gerar com IA" (edge function generate-ai-text, ratio 16:9); texto alternativo (máx. 125); e Step Images — repetidor de pares imagem + descrição, distribuídos pelo conteúdo ao renderizar o post.',
    'Cartão 3 — Conteúdo: Resumo/Lead (máx. 160), Descrição SEO (máx. 160), Introdução (máx. 800, editor WYSIWYG), Conteúdo principal (máx. 2000 palavras, editor WYSIWYG), Pontos principais/Takeaways (máx. 500, em bullets), Conclusão (máx. 300 palavras, editor WYSIWYG) e CTA final (máx. 150).',
    'Cartão 4 — Tags: input com chips (TagInput) e sugestões automáticas das tags já usadas em outros posts (getAllTags).',
  ],
  paragraphs2: [
    'Comportamentos do formulário: o autosave (useBlogAutosave) salva o rascunho enquanto o usuário digita, com indicador "Salvando…/Rascunho salvo ✓"; ao criar, o post ganha ID imediatamente e a URL muda de /new para /:id/edit; ao mudar o status para "Publicado", published_at é gravado automaticamente; a barra final traz Cancelar e Salvar Post.',
  ],
}

const TELAS_PUBLICO: BlogDocxSection[] = [
  {
    title: '3.2 PÚBLICO LISTA (BlogList, rota /blog)',
    paragraphs: [
      'Grade de cards (BlogPostsGrid) com apenas os posts status = "published", vindos de getPublishedPosts. Cada card mostra capa, categoria, título, resumo e data. A lista pode ser filtrada por categoria e por tags.',
    ],
  },
  {
    title: '3.3 PÚBLICO POST (BlogPost, rota /blog/:id)',
    paragraphs: [
      'Bloqueia posts não publicados com um 404 amigável. A página monta SEO completo via useSeo: title, meta description, Open Graph (com a imagem da capa) e JSON-LD schema.org Article (headline, autor, datas e keywords). A cada visita chama a RPC increment_blog_view.',
    ],
    bullets: [
      'Estrutura renderizada, na ordem: badge da categoria → título → data/tempo de leitura/views → botões de compartilhamento → imagem de capa → introdução (estilo citação, com a 1ª imagem intercalada) → conteúdo principal (markdown parseado, com as imagens intercaladas distribuídas por distributeImagesInContent) → takeaways (caixa destacada, recebe a 4ª imagem intercalada quando houver 4) → conclusão → caixa de CTA final → tags.',
      'Engajamento: reações por emoji (blog_reactions), avaliação por estrelas 1–5 (blog_ratings) e comentários — o envio grava com status pending e só os approved aparecem; a moderação é feita pela admin.',
      'Posts relacionados: 3 posts da mesma categoria, exibidos ao final.',
    ],
  },
]

// ============================================================================
// 4. FLUXO DAS INFORMAÇÕES
// ============================================================================
const FLUXO: BlogDocxSection = {
  title: '4. FLUXO DAS INFORMAÇÕES',
  paragraphs: ['Caminho completo de uma postagem, do rascunho à leitura:'],
  code: [
    'Admin cria/edita (autosave enquanto digita)',
    '        │',
    '        ▼',
    'blog_posts (status draft/review)  ──►  status = published  ──►  published_at gravado',
    '        │                                       │',
    '        ▼                                       ▼',
    '/blog (BlogList — getPublishedPosts)   /blog/:id (BlogPost)',
    '        │                                       │',
    '        │                              visitante lê o post',
    '        │                                       │',
    '        │                              increment_blog_view (RPC)',
    '        │                                       │',
    '        ▼                                       ▼',
    'comentário do visitante ──► blog_comments (pending)',
    '        │',
    '        ▼',
    'admin modera ──► status = approved ──► comentário aparece no post',
    '',
    'reações (blog_reactions) e avaliações (blog_ratings) somam por post, contadas no cliente',
  ],
  paragraphs2: [
    'IA: todos os campos de texto do formulário têm AIGenerateButton que envia à edge function generate-ai-text o contexto do campo e o título do post; a chave da OpenAI existe apenas como secret do backend. A mesma function, com type "image", gera as imagens de capa (ratio 16:9) — o modelo de IA usado é configurado no BlogAiModelSettings.',
  ],
}

// ============================================================================
// 5. CHECKLIST DE REPLICAÇÃO
// ============================================================================
const CHECKLIST: BlogDocxSection = {
  title: '5. CHECKLIST DE REPLICAÇÃO EM OUTRA APLICAÇÃO',
  paragraphs: [
    'Para reproduzir este módulo em outra aplicação, siga os itens abaixo na ordem. Marque cada um ao concluir.',
  ],
  bullets: [
    '☐ Criar as 4 tabelas com chave primária uuid: blog_posts, blog_comments, blog_ratings e blog_reactions (colunas conforme a seção 2).',
    '☐ Aplicar RLS: leitura pública somente de posts published e comentários approved; escrita apenas com usuário autenticado (admin).',
    '☐ Criar a RPC increment_blog_view(post_id) com security definer — o visitante nunca escreve direto em blog_posts.',
    '☐ Componentes-chave: editor WYSIWYG para os campos longos; MediaPicker ligado ao bucket storage; repetidor de step-images (par imagem + descrição); TagInput com sugestões das tags já usadas; contadores com limite em todos os campos textuais.',
    '☐ Hook de SEO com JSON-LD schema.org Article (headline, autor, datas, keywords) + Open Graph com a imagem da capa.',
    '☐ Serviços: CRUD de posts; comentários com moderação (pending → approved); ratings com média; reactions com agregação de contagem por tipo; contagem de views via RPC.',
    '☐ Autosave do rascunho com usoBlogAutosave-like: ID imediato na criação, indicador "Salvando…/Rascunho salvo ✓" e published_at automático ao publicar.',
    '☐ IA: botão de geração em cada campo de texto, edge function backend com a chave guardada como secret (nunca no front).',
  ],
}

export const BLOG_DOCX_SECTIONS: BlogDocxSection[] = [
  VISAO_GERAL,
  ...BANCO_DE_DADOS,
  TELAS_ADMIN_LISTA,
  TELAS_ADMIN_FORM,
  ...TELAS_PUBLICO,
  FLUXO,
  CHECKLIST,
]

export const BLOG_DOCX_INTRO =
  'Este documento descreve o módulo Blog (Postagens) do Speedwork em detalhe — arquitetura, banco de dados, telas, fluxo das informações e checklist de replicação — para permitir a reprodução do módulo em outra aplicação. Todo o conteúdo foi levantado por análise real do código-fonte.'
