export const DEFAULT_MENU_CONFIG = [
  {
    id: 'dashboards',
    label: 'Dashboards',
    icon: 'LayoutDashboard',
    items: [
      { id: 'dash-geral', label: 'Geral', path: '/admin/dashboard' },
      { id: 'dash-comercial', label: 'Comercial', path: '/admin/commercial/dashboard' },
      { id: 'dash-financeiro', label: 'Financeiro', path: '/admin/financial/dashboard' },
    ],
  },
  {
    id: 'comercial',
    label: 'Comercial',
    icon: 'Briefcase',
    items: [
      {
        id: 'com-agendamentos',
        label: 'Agendamentos',
        path: '/admin/commercial/appointments',
        icon: 'Calendar',
      },
      { id: 'com-pedidos', label: 'Pedidos', path: '/admin/commercial/orders' },
      { id: 'com-orcamentos', label: 'Orçamentos', path: '/admin/commercial/quotes' },
      { id: 'com-contratos', label: 'Contratos', path: '/admin/commercial/contracts' },
    ],
  },
  {
    id: 'gestao-esportiva',
    label: 'Gestão Esportiva',
    icon: 'Trophy',
    items: [
      { id: 'esp-atletas', label: 'Atletas', path: '/admin/sports/athletes' },
      { id: 'esp-atributos', label: 'Atributos', path: '/admin/sports/attributes' },
      { id: 'esp-avaliacoes', label: 'Avaliações', path: '/admin/sports/evaluations' },
      { id: 'esp-categorias', label: 'Categorias', path: '/admin/sports/categories' },
      { id: 'esp-torneios', label: 'Torneios', path: '/admin/sports/tournaments' },
      { id: 'esp-cursos', label: 'Cursos', path: '/admin/sports/courses' },
      { id: 'esp-ranking', label: 'Ranking', path: '/admin/sports/rankings' },
      { id: 'esp-regras', label: 'Regras', path: '/admin/sports/rules' },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: 'DollarSign',
    items: [
      { id: 'fin-plano-contas', label: 'Plano de Contas', path: '/admin/financial/accounts' },
      { id: 'fin-categorias', label: 'Categorias', path: '/admin/financial/categories' },
      { id: 'fin-pagamentos', label: 'Fluxo de Caixa', path: '/admin/financial/payments' },
      { id: 'fin-parceiros', label: 'Parceiros', path: '/admin/financial/partners' },
      { id: 'fin-stripe', label: 'Configurações Stripe', path: '/admin/financial/settings' },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    icon: 'ShoppingCart',
    items: [
      { id: 'eco-loja', label: 'Loja', path: '/admin/ecommerce/store' },
      { id: 'eco-produtos', label: 'Produtos', path: '/admin/ecommerce/products' },
      { id: 'eco-grupos', label: 'Grupos', path: '/admin/ecommerce/groups' },
      { id: 'eco-pedidos', label: 'Pedidos', path: '/admin/ecommerce/orders' },
      {
        id: 'eco-abandonados',
        label: 'Carrinhos Abandonados',
        path: '/admin/ecommerce/abandoned-carts',
      },
      { id: 'eco-logistica', label: 'Logística', path: '/admin/ecommerce/logistics' },
    ],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: 'Settings',
    items: [
      { id: 'cfg-sistema', label: 'Dados do Sistema', path: '/admin/settings/system' },
      { id: 'cfg-menu', label: 'Gestão de Menus', path: '/admin/settings/menu' },
      { id: 'cfg-manutencao', label: 'Manutenção', path: '/admin/settings/maintenance' },
      { id: 'cfg-midias', label: 'Mídias', path: '/admin/settings/media' },
      { id: 'cfg-blog', label: 'Blog', path: '/admin/settings/blog' },
      { id: 'cfg-paginas', label: 'Páginas', path: '/admin/settings/pages' },
    ],
  },
  {
    id: 'suporte',
    label: 'Suporte',
    icon: 'LifeBuoy',
    items: [
      {
        id: 'sup-tickets',
        label: 'Gestão de Chamados',
        path: '/admin/support/tickets',
        icon: 'Ticket',
      },
      { id: 'sup-sla', label: 'Configurações de SLA', path: '/admin/support/sla', icon: 'Clock' },
    ],
  },
]
