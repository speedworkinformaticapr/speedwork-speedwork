// Conteúdo de ajuda por rota admin. Usado pelo botão "?" do cabeçalho (ScreenHelpMenu).
// Rotas sem registro aqui recebem ajuda genérica (ver GENERIC_HELP no ScreenHelpMenu).

export interface TourStep {
  /** Seletor CSS do elemento alvo (data-tour="..." quando marcado na tela). Passos com elemento ausente são pulados. */
  element: string
  title: string
  text: string
}

export interface ScreenHelp {
  title: string
  description: string
  /** "O que se faz nesta tela" */
  actions: string[]
  /** Dicas rápidas */
  tips: string[]
  tour?: TourStep[]
}

export const SCREEN_HELP: Record<string, ScreenHelp> = {
  '/admin/dashboard': {
    title: 'Painel Administrativo',
    description:
      'Visão geral do sistema: indicadores de negócio, resumos financeiros e atalhos para as principais áreas do painel.',
    actions: [
      'Acompanhar métricas e resumos consolidados de vendas, finanças e clientes.',
      'Abrir atalhos rápidos para cadastros e telas mais usadas.',
      'Ver atualizações e pendências do sistema.',
    ],
    tips: [
      'Use o menu lateral à esquerda para navegar entre todas as áreas.',
      'Os cartões de resumo são clicáveis e levam à tela correspondente.',
    ],
  },
  '/admin/users': {
    title: 'Pessoas e Usuários',
    description:
      'Gestão unificada de clientes, fornecedores e usuários internos do sistema. Um cadastro pode acumular mais de um papel (ex.: cliente e usuário).',
    actions: [
      'Buscar e filtrar registros por nome, e-mail, documento, status e tipo de perfil.',
      'Criar um novo registro com o botão "Novo Registro".',
      'Editar dados e papéis (Cliente, Autor, Fornecedor, Função) pelo botão de lápis em cada linha.',
      'Desativar registros (soft delete): o registro fica acessível pelo filtro de status "Inativo".',
    ],
    tips: [
      'Os checkboxes Cliente/Autor na tela Editar Registro ajustam os papéis — a Função do select é o papel operacional principal.',
      'Administradores e master não podem desativar a si mesmos.',
      'Registros desativados não aparecem no filtro "Todos", mas continuam no histórico.',
    ],
    tour: [
      {
        element: '[data-tour="users-title"]',
        title: 'Pessoas e Usuários',
        text: 'Lista unificada de clientes, fornecedores e usuários internos.',
      },
      {
        element: '[data-tour="users-new-button"]',
        title: 'Novo Registro',
        text: 'Cria um novo cadastro completo de pessoa/usuário.',
      },
      {
        element: '[data-tour="users-filters"]',
        title: 'Filtros',
        text: 'Busque por nome, e-mail ou documento, filtre por status, período e tipo de perfil.',
      },
      {
        element: '[data-tour="users-table"]',
        title: 'Tabela de Registros',
        text: 'Cada linha mostra o tipo de perfil, o status e as ações: editar (lápis) e desativar (lixeira).',
      },
    ],
  },
  '/admin/financial': {
    title: 'Fluxo de Caixa',
    description:
      'Dashboard financeiro com entradas, saídas e saldo por período, além do lançamento de pagamentos e parcelas.',
    actions: [
      'Filtrar o fluxo por intervalo de datas e status de pagamento.',
      'Ver resumo consolidado de receitas, despesas e saldo.',
      'Lançar novos pagamentos e conferir parcelas pendentes.',
      'Exportar e compartilhar registros financeiros.',
    ],
    tips: [
      'Clique em uma linha do grid para expandir as parcelas do lançamento.',
      'O filtro de período alimenta os cartões de resumo e o grid juntos.',
    ],
    tour: [
      {
        element: 'main h1',
        title: 'Fluxo de Caixa',
        text: 'Resumo financeiro do período selecionado.',
      },
      {
        element: 'main table',
        title: 'Grid de Lançamentos',
        text: 'Cada linha é um lançamento; expanda para ver as parcelas e registre pagamentos aqui.',
      },
    ],
  },
  '/admin/financial/bank-accounts': {
    title: 'Contas Bancárias',
    description:
      'Cadastro das contas bancárias usadas pelos lançamentos e conciliações financeiras.',
    actions: [
      'Cadastrar, editar e ativar/desativar contas bancárias.',
      'Definir saldo inicial e dados da conta (banco, agência, número).',
      'Vincular a conta aos lançamentos do fluxo de caixa.',
    ],
    tips: ['Contas desativadas continuam no histórico de lançamentos antigos.'],
  },
  '/admin/financial/accounts': {
    title: 'Plano de Contas',
    description: 'Estrutura de categorias contábeis usadas para classificar receitas e despesas.',
    actions: [
      'Criar e editar contas do plano de contas.',
      'Organizar categorias por tipo (receita/despesa).',
      'Manter a classificação usada nos relatórios financeiros.',
    ],
    tips: [
      'Mantenha uma nomenclatura consistente — o plano de contas alimenta relatórios e dashboards.',
    ],
  },
  '/admin/financial/categories': {
    title: 'Categorias Financeiras',
    description:
      'Categorias dos lançamentos financeiros, para agrupar receitas e despesas nos relatórios.',
    actions: [
      'Criar e editar categorias.',
      'Classificar lançamentos do fluxo de caixa por categoria.',
    ],
    tips: ['Categorias bem definidas deixam o fluxo de caixa e os relatórios mais claros.'],
  },
  '/admin/settings/system': {
    title: 'Dados do Sistema',
    description:
      'Configuração global da plataforma: identidade visual, dados da empresa, integrações, e-mail, WhatsApp, termos e preferências.',
    actions: [
      'Preencher os dados da empresa (CNPJ, endereço, responsável, contatos).',
      'Configurar identidade visual: logo, favicon, cores e nome da plataforma.',
      'Ajustar integrações (e-mail, WhatsApp, pagamentos) em cada aba.',
      'Salvar as alterações com o botão Salvar — as mudanças valem para todo o site e painel.',
    ],
    tips: [
      'O logo deve ser enviado ao bucket de mídia (URL do storage) — imagens base64 coladas não são aceitas.',
      'Cada aba é validada por schema; corrija os erros apontados antes de salvar.',
      'As alterações geram histórico de revisão (aba de histórico).',
    ],
    tour: [
      {
        element: 'main h1',
        title: 'Dados do Sistema',
        text: 'Configurações globais da plataforma, organizadas em abas.',
      },
      {
        element: 'main form, main [role="form"], main .space-y-6',
        title: 'Formulário',
        text: 'Preencha os campos da aba atual e clique em Salvar ao final.',
      },
    ],
  },
  '/admin/settings/blog': {
    title: 'Posts do Blog',
    description: 'Gestão dos artigos do blog: criação, edição e publicação de posts.',
    actions: [
      'Ver todos os posts com status e destaques.',
      'Criar um novo post com o botão de novo registro.',
      'Editar o conteúdo de um post (editor rico, imagens, tags).',
      'Publicar ou despublicar posts.',
    ],
    tips: [
      'Posts marcados como destaque aparecem na página inicial.',
      'O editor salva rascunhos automaticamente enquanto você escreve.',
    ],
    tour: [
      {
        element: 'main h1',
        title: 'Posts do Blog',
        text: 'Lista completa dos artigos do blog.',
      },
      {
        element: 'main table',
        title: 'Lista de Posts',
        text: 'Cada linha traz o post, o status de publicação e as ações de edição.',
      },
    ],
  },
  '/admin/commercial/quotes': {
    title: 'Orçamentos',
    description:
      'Emissão e acompanhamento de orçamentos comerciais, do rascunho até a aprovação do cliente.',
    actions: [
      'Criar um novo orçamento e montar itens, serviços e valores.',
      'Enviar o orçamento ao cliente (gera link de aprovação).',
      'Acompanhar status: rascunho, enviado, aprovado, recusado.',
      'Converter orçamentos aprovados em pedidos.',
    ],
    tips: [
      'O link de aprovação é acessado pelo cliente sem login.',
      'Orçamentos recusados ficam no histórico para consulta.',
    ],
    tour: [
      {
        element: 'main h1',
        title: 'Orçamentos',
        text: 'Pipeline comercial de orçamentos.',
      },
      {
        element: 'main table',
        title: 'Lista de Orçamentos',
        text: 'Status, valores e ações de cada orçamento. Use os filtros para achar rápido.',
      },
    ],
  },
  '/admin/commercial/appointments': {
    title: 'Agendamentos',
    description: 'Agenda comercial de compromissos: reuniões, visitas e atendimentos da equipe.',
    actions: [
      'Ver os compromissos por dia/semana na grade ou lista.',
      'Criar, editar e remarcar compromissos.',
      'Confirmar presença e registrar o resultado do atendimento.',
    ],
    tips: ['Compromissos atrasados ganham destaque na agenda.'],
    tour: [
      {
        element: 'main h1',
        title: 'Agendamentos',
        text: 'Agenda da equipe comercial.',
      },
      {
        element: 'main table',
        title: 'Lista de Compromissos',
        text: 'Compromissos do período com ações rápidas de edição e status.',
      },
    ],
  },
  '/admin/services/questionnaires': {
    title: 'Questionários',
    description: 'Montagem dos questionários usados nas avaliações de clientes (diagnósticos).',
    actions: [
      'Criar questionários e adicionar perguntas dinâmicas.',
      'Definir tipos de resposta, obrigatoriedade e pontuação.',
      'Vincular questionários a serviços e campanhas.',
    ],
    tips: ['As respostas alimentam o score do lead e os relatórios de avaliação.'],
  },
  '/admin/commercial/leads': {
    title: 'Leads',
    description: 'Gestão de leads captados por formulários, avaliações e campanhas.',
    actions: [
      'Ver leads com score e origem.',
      'Abrir um lead para ver o histórico completo (diagnóstico, avaliações, interações).',
      'Converter leads em clientes.',
    ],
    tips: [
      'Leads provenientes de avaliação trazem as respostas do diagnóstico na tela de detalhe.',
      'O score é calculado automaticamente a partir das respostas.',
    ],
    tour: [
      {
        element: 'main h1',
        title: 'Leads',
        text: 'Potenciais clientes e seus scores.',
      },
      {
        element: 'main table',
        title: 'Lista de Leads',
        text: 'Cada linha traz o lead, a origem, o score e ações.',
      },
    ],
  },
  '/admin/commercial/orders': {
    title: 'Pedidos',
    description:
      'Pedidos de venda gerados a partir de orçamentos aprovados ou criados diretamente.',
    actions: [
      'Criar e editar pedidos com itens e valores.',
      'Acompanhar status de produção/entrega.',
      'Visualizar o pedido no formato do cliente.',
    ],
    tips: ['Pedidos podem vir de orçamentos aprovados — o histórico mantém a ligação.'],
  },
  '/admin/commercial/contracts': {
    title: 'Contratos',
    description: 'Central de contratos: modelos, cláusulas, aditivos e relatórios.',
    actions: [
      'Criar e editar contratos (inclusive aditivos) no formulário de contrato.',
      'Gerenciar modelos e cláusulas reutilizáveis.',
      'Emitir aditivos e gerar relatórios de contratos.',
    ],
    tips: ['Use modelos + cláusulas para montar contratos novos em poucos cliques.'],
  },
  '/admin/settings/media': {
    title: 'Mídia',
    description: 'Biblioteca de imagens e arquivos do sistema (bucket de storage).',
    actions: [
      'Enviar imagens e arquivos arrastando ou pelo botão de upload.',
      'Copiar URLs para usar no site, blog e e-mails.',
      'Organizar e excluir arquivos antigos.',
    ],
    tips: [
      'Prefira imagens já otimizadas (JPG/WebP) para manter o site rápido.',
      'URLs copiadas daqui são válidas para o logo do sistema e e-mails.',
    ],
    tour: [
      {
        element: 'main h1',
        title: 'Mídia',
        text: 'Biblioteca de arquivos do sistema.',
      },
      {
        element: 'main input[type="file"], main .grid',
        title: 'Arquivos',
        text: 'Envie novos arquivos ou copie a URL de um existente.',
      },
    ],
  },
  '/admin/settings/menu': {
    title: 'Configuração do Menu',
    description: 'Montagem do menu lateral do painel admin: grupos, submenus e ícones.',
    actions: [
      'Adicionar, reordenar e renomear grupos e itens do menu.',
      'Definir ícones e URLs de cada item.',
      'Salvar para aplicar o menu a todos os usuários do painel.',
    ],
    tips: ['O menu é configurável em runtime e fica salvo nos Dados do Sistema.'],
    tour: [
      {
        element: 'main h1',
        title: 'Configuração do Menu',
        text: 'Estrutura do menu lateral do painel.',
      },
      {
        element: 'main table',
        title: 'Itens do Menu',
        text: 'Reordene e edite os grupos e submenus daqui.',
      },
    ],
  },
  '/admin/services': {
    title: 'Serviços',
    description: 'Catálogo de serviços comercializados e fichas de planos (aba Planos).',
    actions: [
      'Cadastrar e editar serviços com valores avulso/mensal/semestral/anual.',
      'Gerenciar as fichas dos planos na aba Planos.',
      'Salvar para atualizar o site público.',
    ],
    tips: ['O preço de cada plano vem do serviço vinculado a ele (service_id).'],
    tour: [
      {
        element: 'main h1',
        title: 'Serviços',
        text: 'Catálogo de serviços comercializados.',
      },
      {
        element: 'main table',
        title: 'Tabela de Serviços',
        text: 'Edite valores e categoria de cada serviço.',
      },
    ],
  },
  '/admin/support/tickets': {
    title: 'Tickets de Suporte',
    description:
      'Central de atendimento: tickets abertos por clientes, fila, técnicos e histórico.',
    actions: [
      'Ver tickets por status, prioridade e módulo.',
      'Abrir um ticket para trocar mensagens e mudar status/técnico.',
      'Registrar atendimentos no histórico do ticket.',
    ],
    tips: [
      'Mudar o status para "Resolvido" encerra o fluxo do cliente.',
      'Todo atendimento gera entrada no histórico com autor e data.',
    ],
    tour: [
      {
        element: 'main h1',
        title: 'Tickets',
        text: 'Fila de atendimento de suporte.',
      },
      {
        element: 'main table',
        title: 'Lista de Tickets',
        text: 'Clique em um ticket para abrir o painel de detalhe à direita.',
      },
    ],
  },
  '/admin/whatsapp': {
    title: 'WhatsApp',
    description:
      'Integração com WhatsApp: credenciais da API, templates de mensagem e logs de envio.',
    actions: [
      'Configurar credenciais (Twilio/API) nos campos do formulário.',
      'Ativar o modo produção ou permanecer em sandbox.',
      'Testar a conexão enviando mensagem de teste.',
      'Acompanhar os logs de envio na aba de logs.',
    ],
    tips: [
      'Em sandbox (Twilio), use o número de teste cadastrado no painel.',
      'Use "Testar Conexão" antes de ativar o modo produção.',
    ],
    tour: [
      {
        element: 'main h1',
        title: 'WhatsApp',
        text: 'Configuração e monitoramento da integração.',
      },
      {
        element: 'main form, main .space-y-6',
        title: 'Credenciais',
        text: 'Preencha as credenciais, salve e teste a conexão.',
      },
    ],
  },
  '/admin/email': {
    title: 'E-mail',
    description:
      'Configuração de envio de e-mails: credenciais SMTP/API, modelos de mensagem e logs.',
    actions: [
      'Configurar as credenciais de envio na aba de configuração.',
      'Editar os modelos de e-mail (boas-vindas, 2FA, cobranças) na aba de templates.',
      'Enviar e-mail de teste e acompanhar os logs de entrega.',
    ],
    tips: [
      'O sistema insere cabeçalho e rodapé automaticamente — edite apenas o corpo.',
      'Variáveis como {{name}} e {{code}} são substituídas no envio.',
      'O logo do e-mail deve ser URL do bucket de mídia (não base64).',
    ],
    tour: [
      {
        element: 'main h1',
        title: 'E-mail',
        text: 'Configurações e modelos de e-mail do sistema.',
      },
      {
        element: 'main form, main .space-y-6',
        title: 'Conteúdo',
        text: 'Edite o template selecionado e salve; use a pré-visualização para conferir.',
      },
    ],
  },
  '/admin/gallery': {
    title: 'Galeria',
    description: 'Gestão das galerias de imagens exibidas no site público.',
    actions: [
      'Criar e organizar galerias.',
      'Selecionar imagens da biblioteca de mídia.',
      'Publicar galerias nas páginas do site.',
    ],
    tips: ['As imagens vêm da biblioteca de Mídia — envie primeiro por lá.'],
  },
  '/admin/sports/athletes': {
    title: 'Atletas',
    description: 'Cadastro central de atletas: dados, avaliações físicas, atributos e histórico.',
    actions: [
      'Cadastrar e editar atletas.',
      'Registrar avaliações e atributos (características esportivas).',
      'Acompanhar o histórico e o scouting de cada atleta.',
    ],
    tips: ['O perfil público do atleta é alimentado por este cadastro.'],
    tour: [
      {
        element: 'main h1',
        title: 'Atletas',
        text: 'Cadastro central de atletas da plataforma.',
      },
      {
        element: 'main table',
        title: 'Lista de Atletas',
        text: 'Cada linha traz o atleta e as ações de edição e avaliação.',
      },
    ],
  },
  '/admin/feedback/dashboard': {
    title: 'Feedback de Clientes',
    description: 'Dashboard de satisfação: avaliações, comentários e NPS dos clientes.',
    actions: [
      'Ver métricas consolidadas de satisfação.',
      'Ler comentários e avaliações individuais.',
      'Filtrar por período e serviço.',
    ],
    tips: ['Comentários negativos são prioridade de atendimento.'],
  },
  '/admin/settings/documentation': {
    title: 'Documentação do Sistema',
    description: 'Documentação técnica e funcional do sistema, com geração de arquivos DOCX.',
    actions: [
      'Consultar a documentação das telas e regras.',
      'Gerar a documentação completa em DOCX.',
    ],
    tips: ['A documentação é gerada a partir do código — gere após grandes mudanças.'],
  },
  '/admin/settings/maintenance': {
    title: 'Modo de Manutenção',
    description: 'Controle do modo manutenção do site público.',
    actions: ['Ativar/desativar o modo manutenção.', 'Editar a mensagem exibida aos visitantes.'],
    tips: [
      'Com o modo ativo, o site público fica indisponível; o painel admin continua funcionando.',
    ],
  },
  '/admin/settings/analytics': {
    title: 'Analytics',
    description: 'Configuração e leitura das métricas de acesso do site.',
    actions: [
      'Configurar ferramentas de análise.',
      'Ver métricas de acesso e páginas mais visitadas.',
    ],
    tips: ['Dados de acesso só começam a ser coletados após a configuração.'],
  },
  '/admin/settings/sla-types': {
    title: 'Tipos de SLA',
    description: 'Cadastro dos tipos de SLA (acordos de nível de serviço) usados no suporte.',
    actions: ['Criar e editar tipos de SLA.', 'Definir prazos de atendimento e resolução.'],
    tips: ['Os SLAs definidos aqui orientam as prioridades dos tickets.'],
  },
  '/admin/support/sla': {
    title: 'Configuração de SLA',
    description: 'Configuração dos acordos de nível de serviço aplicados aos tickets de suporte.',
    actions: ['Definir prazos por prioridade e módulo.', 'Ajustar regras de escalonamento.'],
    tips: ['Prazos mais curtos para prioridades altas evitam atrasos em tickets críticos.'],
  },
  '/admin/settings/publish-logs': {
    title: 'Logs de Publicação',
    description: 'Histórico de publicações do site (páginas, conteúdo e configurações).',
    actions: ['Ver quem publicou o quê e quando.', 'Auditar mudanças de conteúdo.'],
    tips: ['Use os logs para entender o que mudou no site e quando.'],
  },
  '/admin/ecommerce/orders': {
    title: 'Pedidos da Loja',
    description: 'Pedidos da loja virtual: pagamento, entrega e status.',
    actions: [
      'Ver e filtrar pedidos da loja.',
      'Atualizar status de pagamento e entrega.',
      'Detalhar itens do pedido.',
    ],
    tips: ['Carrinhos abandonados ficam na aba própria, com dados de contato.'],
  },
  '/admin/commercial/pipeline': {
    title: 'Pipeline Comercial',
    description: 'Quadro de oportunidades por etapa de negociação (kanban).',
    actions: [
      'Mover oportunidades entre etapas arrastando os cartões.',
      'Acompanhar valores por etapa.',
      'Abrir um card para ver o detalhe do lead/negócio.',
    ],
    tips: ['Arrastar um card atualiza a etapa do negócio automaticamente.'],
  },
  '/admin/commercial/activities': {
    title: 'Atividades Comerciais',
    description: 'Registro de atividades da equipe comercial (ligações, reuniões, follow-ups).',
    actions: ['Registrar novas atividades.', 'Ver o histórico por vendedor e período.'],
    tips: ['Vincule atividades a leads para manter o histórico completo.'],
  },
  '/admin/commercial/evaluations': {
    title: 'Avaliações',
    description: 'Avaliações diagnósticas respondidas pelos leads e seus relatórios.',
    actions: [
      'Ver avaliações recebidas e seus scores.',
      'Abrir uma avaliação para o relatório detalhado.',
      'Usar as respostas no atendimento comercial.',
    ],
    tips: ['O link de avaliação é enviado pelo lead via formulário público.'],
  },
}

/** Ajuda genérica para rotas sem cadastro específico. */
export const GENERIC_HELP: ScreenHelp = {
  title: 'Ajuda da tela',
  description:
    'Esta tela faz parte do painel administrativo. Use o menu lateral para navegar entre as áreas e, em caso de dúvida, fale com o administrador do sistema.',
  actions: [
    'Navegar entre as áreas do painel pelo menu lateral.',
    'Usar os filtros e a busca desta tela para localizar registros.',
  ],
  tips: [
    'As ações principais ficam nos botões do topo da tela.',
    'Este conteúdo é genérico — em breve haverá ajuda específica para esta tela.',
  ],
}

/**
 * Resolve o conteúdo de ajuda para o pathname atual:
 * 1. match exato; 2. rota pai (prefixo, o mais longo vence); 3. genérica.
 */
export function resolveScreenHelp(pathname: string): ScreenHelp {
  if (SCREEN_HELP[pathname]) return SCREEN_HELP[pathname]
  const match = Object.keys(SCREEN_HELP)
    .filter((route) => pathname.startsWith(`${route}/`) || pathname === route)
    .sort((a, b) => b.length - a.length)[0]
  return match ? SCREEN_HELP[match] : GENERIC_HELP
}
