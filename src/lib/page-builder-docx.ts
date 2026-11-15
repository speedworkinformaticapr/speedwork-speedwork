// Conteúdo do documento "Page Builder — documentação" do Speedwork
// (usado por src/lib/page-builder-docx-build.ts).
//
// PARTE 1: descrição breve do módulo (parágrafos prontos para o documento).
// PARTE 2: o prompt completo do módulo Páginas/Page Builder, seção por seção,
// reproduzido INTEIRO (sem cortes) e formatado no .docx como blocos de citação.

export interface DocPromptSection {
  title: string
  prompt: string
}

export const PAGE_BUILDER_DESCRIPTION: string[] = [
  'O Page Builder é o módulo de Páginas Institucionais do Speedwork, disponível em /admin/pages. Ele é um editor visual de blocos: cada seção da página — chamada de "dobra" — é montada, reordenada, ocultada e configurada diretamente na tela, sem escrever código. A página criada é publicada em uma rota pública no formato /{slug}.',
  'A tela trabalha em 3 abas: "Propriedade" (dados da página e SEO), "Page Builder" (canvas de montagem com as dobras) e "Propriedades do Elemento" (formulário dinâmico do bloco selecionado). A biblioteca traz 20 tipos de elementos prontos — Hero, Feature Cards, Testimonials, CTA, Pricing Table Dinâmica, Galeria, Vídeo, Texto & Imagem, Contadores, Newsletter, FAQ/Accordion, Formulário de Contato, Equipe, Social Proof, Rich Text, Imagem, Blog Posts Grid, Media Carousel, Mapa e Linha do Tempo.',
  'As dobras são reordenadas por drag-and-drop ou pelas setas de cada card, e podem ser ocultadas (some da página pública sem ser excluída) com um clique. Cada elemento recebe automaticamente um ID de âncora e uma animação de entrada (fade, slide, zoom).',
  'Complementos: geração de textos por IA nos campos de título e descrição (inclusive para SEO), preview público em /{slug} pelo botão "Preview", controle Publicado/Rascunho com badge e filtro de status, e persistência na tabela pages (título, slug, publicação, metadados de SEO, ordem de exibição e blocos em JSONB).',
]

export const PAGE_BUILDER_PROMPT_INTRO: string =
  'Implemente o módulo de gestão de páginas institucionais com Page Builder visual, em /admin/pages (lista/edição unificada), /admin/pages/new e /admin/pages/:id/edit, persistindo na tabela `pages` (colunas: title, slug, is_published, meta_title, meta_description, meta_keywords, display_order, blocks [JSONB], updated_at).'

export const PAGE_BUILDER_SECTIONS: DocPromptSection[] = [
  {
    title: '1. LAYOUT GERAL DA TELA',
    prompt:
      'Cabeçalho global do admin registrado via contexto (SetAdminHeader): título dinâmico (nome da página em edição | "Nova Página Institucional" | "Páginas Institucionais"), abaixo o slug mono ("/{slug}") e status colorido (Publicado=verde / Rascunho=âmbar). Controles no cabeçalho: busca "Filtrar páginas..." (por título ou slug), filtro de status (Todos/Publicados/Rascunhos), botões "Nova Página", "Preview" (abre /{slug} em nova aba, desabilitado sem slug) e "Salvar" (estado "Salvando...").\n\nBarra superior própria: rótulo "Página em Edição:" + PageListbox (combobox 380px com busca case-insensitive "Buscar por título ou slug...", separador "Ações Rápidas" com "+ Nova Página", grupo "Páginas Existentes (N)" ordenado por display_order com indicador de seleção) + Badge "{N} páginas cadastradas" + Badge de status (Publicado/Rascunho).\n\nCorpo em 3 abas (sublinhado ativo, ícone + rótulo): 1. "Propriedade" (FileText) → PagePropertiesTab; 2. "Page Builder" (Layers) com contador de blocos em badge → BuilderCanvas; 3. "Propriedades do Elemento" (SlidersHorizontal) com ponto indicador quando há bloco selecionado → BuilderProperties.\n\nEstado central: zustand (usePageBuilderStore) com pageId, title, slug, isPublished, metaTitle, metaDescription, metaKeywords, displayOrder, blocks[], selectedBlockId, activeTab, status (idle/loading/saving/error).',
  },
  {
    title: '2. ABA "PROPRIEDADE" (dados da página)',
    prompt:
      'Card "Informações Principais": Título Interno da Página * (com botão de geração por IA ao lado do label); Slug / Rota Pública * (prefixo "/" fixo visual, mono, auto-sugerido a partir do título quando novo: lowercase, sem acentos, espaços→hífens; sanitização idêntica a cada digitação; preview "/{slug}" ao lado do label); Ordem de Exibição (number); Switch "Página Publicada" (ícone Globo, caixa destacada, explicativo).\n\nCard "Otimização para Buscas (SEO)": Meta Title (máx. 70, contador, recomendação 60, botão IA); Meta Description (textarea máx. 180, contador, recomendação 140–160, botão IA); Meta Keywords (separadas por vírgula).\n\nCard-resumo "Estrutura Visual": quantidade de dobras configuradas.\n\nValidação no Salvar: título e slug obrigatórios (toast de erro + troca automática para a aba Propriedade). Slug limpo no save (lowercase, trim, sem "/" inicial, espaços→hífens). Blocos persistidos com order = índice. Se slug duplicado, toast sugere verificar. Ao criar, navega para /admin/pages/{id}/edit.',
  },
  {
    title: '3. ABA "PAGE BUILDER" (Canvas de Montagem)',
    prompt:
      'Título "Canvas de Montagem" + botão "+ Elementos" (abre o seletor). Vazio: área tracejada "Nenhuma dobra adicionada" + botão "Adicionar Primeiro Elemento". Cada dobra é um card arrastável com: alça de arrasto à esquerda (reordenação por drag-and-drop com indicador visual de drop); badge do tipo (uppercase), nome interno, badge "Oculto" (âmbar) e badge "Em Edição" (quando selecionado); pré-visualização real do bloco (BlockRenderer renderiza o componente público de verdade, sem interação de mouse, altura máx. 450px com scroll); ações no canto superior direito: Ocultar/Mostrar (olho; toast "Dobra ocultada/visível" — oculta não aparece na página pública), Mover para cima, Mover para baixo, Editar propriedades (leva à aba 3 com o bloco selecionado) e Excluir (remoção imediata + reordenar). Clicar no card seleciona o bloco e abre a aba "Propriedades do Elemento".\n\nSeletor de elementos (modal): grade dos 20 elementos com ícone, nome e descrição; ao escolher, insere o bloco com dados padrão e id único.',
  },
  {
    title: '4. OS 20 ELEMENTOS (biblioteca)',
    prompt:
      'hero (Hero), feature_cards (Feature Cards), testimonials (Testimonials), cta (CTA), dynamic_pricing_table (Pricing Table Dinâmica), gallery (Image Gallery), video (Video Embed), text_image (Text & Image), stats_counter (Stats Counter), newsletter (Newsletter), accordion (FAQ/Accordion), contact_form (Contact Form), team_members (Team), social_proof (Social Proof), rich_text_divider (Rich Text Divider), image (Single Image), blog_posts_grid (Blog Posts Grid), media_carousel (Media Carousel), map (Mapa), timeline (Linha do Tempo).',
  },
  {
    title: '5. ABA "PROPRIEDADES DO ELEMENTO"',
    prompt:
      'Header: badge "Editando: {tipo}" (+ "Oculto" se aplicável), botões "Ver no Canvas" e "Salvar Propriedades". Sem seleção: estado vazio orientando ir ao Page Builder.\n\nSeção fixa "Identificação do Bloco": Nome/Rótulo interno.\n\nFormulário dinâmico por tipo (ELEMENT_CONFIGS), com seções em cards. Tipos de campo suportados pelo renderizador: text (contador maxLength opcional), textarea (RichTextEditor ou textarea simples quando tem maxLength), color (paleta + input hex validado por regex), url (input + botão de buscar na Galeria de Mídia via MediaPicker), number, range (0–100 com % ao lado), date, boolean (switch), select (opções), anchor_id (auto-slug: lowercase, espaços→hífens, só a-z0-9-), sla_select (busca em sla_types), service_select (busca em services por título), services_multiselect (checkboxes agrupados por categoria). Validação em tempo real com zod (url, cor hex, número) e mensagem de erro sob o campo; alterações aplicadas no canvas com debounce de 500ms. Campos text/textarea ganham botão de geração por IA (AIGenerateButton) ao lado do label.\n\nListas de itens (ListRenderer): accordion por item com alça de drag-and-drop, rótulo contextual (mídia→"Mídia N", galeria→"Imagem N", FAQ→pergunta, equipe→nome, planos→nome, depoimentos→autor, timeline→data, cards→título; fallback "Item N"), input numérico de posição persistente (_order, commit em Enter/blur, Esc cancela, ordenação estável — nunca renumera os outros itens), lixeira e botão "Adicionar" (próximo número livre). Listas de URLs simples incluem MediaPicker.\n\nTODOS os elementos recebem automaticamente as seções: "Identificação" (ID da Âncora — anchor_id) e "Animação" (Animação de Entrada: Nenhum, Fade In, Slide Up/Down/Left/Right, Zoom In).',
  },
  {
    title: '6. CONFIGURAÇÃO DE CAMPOS POR ELEMENTO',
    prompt:
      '- map: Configurações (Tamanho: Pequeno/Médio/Grande).\n\n- pricing_table e dynamic_pricing_table: Conteúdo Principal (Título, Subtítulo) + lista "Planos" (Nome, Descrição, Tipo de SLA [sla_select], Texto do Botão, Destacar Plano [boolean], Serviços Inclusos [services_multiselect]).\n\n- hero: Conteúdo (Título 80, Subtítulo 160); Estilo (Cor de Fundo, Imagem de Fundo URL, Escurecimento da Imagem % range); Ação (Texto do Botão 40, Link).\n\n- feature_cards: Título da Seção + lista "Cards" (URL do Ícone, Título, Descrição, Link).\n\n- testimonials: Título, Exibir Avaliações do Google (boolean), Limite, Ordenação (Mais Recentes/Maior Nota) + lista "Depoimentos (Manuais)" (Foto, Autor, Depoimento). Quando tipo=testimonials, seção extra "Moderação Google Meu Negócio": lista das avaliações (autor, nota ★, texto) com switch aprovar/rejeitar gravando status em google_reviews.\n\n- cta: idêntico ao hero (Conteúdo, Estilo, Ação).\n\n- gallery: Título da Seção + lista de URLs de imagens (com MediaPicker).\n\n- video: Título + URL do Vídeo (Embed).\n\n- text_image: Conteúdo (Título 80, Texto HTML rico, URL da Imagem); Estilo (Posição da Imagem: Esquerda/Direita); Ação (Título do Botão 40, Serviço de Avaliação [service_select], Link Interno Manual).\n\n- stats_counter: lista "Estatísticas" (URL do Ícone, Valor ex: 100+, Rótulo).\n\n- newsletter: Título + Subtítulo.\n\n- accordion: Título da Seção + lista "Perguntas e Respostas" (Pergunta, Resposta).\n\n- contact_form: Título, Subtítulo, E-mail de Contato.\n\n- team_members: Título da Seção + lista "Membros da Equipe" (Nome, Cargo, Biografia, Foto).\n\n- social_proof: Título da Seção + lista de URLs de logos.\n\n- rich_text_divider: Título + Conteúdo HTML (editor rico).\n\n- image: URL da Imagem, Texto Alternativo, Legenda.\n\n- blog_posts_grid: Título, Subtítulo, Limite de Posts (number).\n\n- timeline: Título + lista "Eventos" (Data, Texto, Lado da Linha: Esquerda/Direita).\n\n- media_carousel: Configurações (Reprodução Automática boolean, Tempo ms number, Efeito de Transição: Slide/Fade/Scale/Cube/Flip); Posicionamento do Texto (Alinhamento Horizontal: Esquerda/Centro/Direita; Vertical: Topo/Centro/Base); lista "Mídias" (Título do Item 80, URL da Mídia, Tipo Imagem/Vídeo, Título 80, Subtítulo 160, Texto do Botão 40, Link do Botão, Escurecimento %). Novos itens nascem como type=image.\n\nElemento sem config visual: alerta "Elemento não suportado pelo form visual" + editor JSON formatado como fallback.',
  },
  {
    title: '7. CRITÉRIOS DE ACEITE',
    prompt:
      '1. Criar página nova, definir título (slug sugerido automaticamente), adicionar Hero + Pricing Table dinâmica, salvar e ver a página renderizada em /{slug} via Preview.\n\n2. Reordenar dobras por drag-and-drop e por setas; ocultar uma dobra e confirmar que ela some da página pública sem ser excluída.\n\n3. Editar propriedades de um plano (SLA, serviços inclusos, destaque) e ver refletido no canvas e na página pública.\n\n4. Reordenar itens de lista pelo número de posição sem que os outros números mudem.\n\n5. Buscar página no Listbox e no filtro do cabeçalho; alternar Publicado/Rascunho reflete badge, filtro e visibilidade pública.',
  },
]
