export type MenuSubmenu = {
  id: string
  label: string
  url: string
  icon?: string
}

export type MenuConfig = {
  id: string
  label: string
  url?: string
  icon?: string
  submenus?: MenuSubmenu[]
}

export const DEFAULT_MENU_CONFIG: MenuConfig[] = [
  { id: 'dashboard', label: 'Dashboard', url: '/admin/dashboard', icon: 'LayoutDashboard' },
  {
    id: 'gestao',
    label: 'Gestão',
    icon: 'Users',
    submenus: [
      { id: 'users', label: 'Usuários', url: '/admin/users' },
      { id: 'feedback', label: 'Satisfação do Cliente', url: '/admin/feedback/dashboard' },
    ],
  },
  {
    id: 'comercial',
    label: 'Comercial',
    icon: 'Briefcase',
    submenus: [
      {
        id: 'comercial-dashboard',
        label: 'Dashboard Comercial',
        url: '/admin/commercial/dashboard',
      },
      { id: 'quotes', label: 'Orçamentos', url: '/admin/commercial/quotes' },
      { id: 'pedidos', label: 'Pedidos', url: '/admin/commercial/orders' },
      { id: 'appointments', label: 'Agendamentos', url: '/admin/commercial/appointments' },
    ],
  },
  {
    id: 'contratos',
    label: 'Contratos',
    icon: 'FileText',
    submenus: [
      { id: 'contracts-dashboard', label: 'Dashboard', url: '/admin/contracts/dashboard' },
      { id: 'contracts-list', label: 'Contratos', url: '/admin/commercial/contracts' },
      { id: 'contracts-wizard', label: 'Novo Contrato', url: '/admin/contracts/wizard' },
      { id: 'contracts-templates', label: 'Modelos', url: '/admin/contracts/templates' },
      {
        id: 'contracts-clauses',
        label: 'Biblioteca de Cláusulas',
        url: '/admin/contracts/clauses',
      },
      { id: 'contracts-addendums', label: 'Aditivos', url: '/admin/contracts/addendums' },
      { id: 'contracts-entities', label: 'Entidades', url: '/admin/contracts/entities' },
      { id: 'contracts-reports', label: 'Relatórios', url: '/admin/contracts/reports' },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: 'DollarSign',
    submenus: [
      {
        id: 'financial-dashboard',
        label: 'Dashboard Financeiro',
        url: '/admin/financial/dashboard',
      },
      { id: 'chart-of-accounts', label: 'Plano de Contas', url: '/admin/financial/accounts' },
      { id: 'categories', label: 'Categorias', url: '/admin/financial/categories' },
      { id: 'payments', label: 'Pagamentos', url: '/admin/financial/payments' },
      { id: 'partners', label: 'Parceiros', url: '/admin/financial/partners' },
      { id: 'billing-logs', label: 'Logs de Faturamento', url: '/admin/financial/billing-logs' },
      {
        id: 'stripe-config',
        label: 'Configurações de Pagamento',
        url: '/admin/financial/settings',
      },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    icon: 'ShoppingCart',
    submenus: [
      { id: 'ecommerce-groups', label: 'Grupos', url: '/admin/ecommerce/groups' },
      { id: 'ecommerce-products', label: 'Produtos', url: '/admin/ecommerce/products' },
      { id: 'ecommerce-store-editor', label: 'Editor da Loja', url: '/admin/ecommerce/store' },
      {
        id: 'ecommerce-abandoned-carts',
        label: 'Carrinhos Abandonados',
        url: '/admin/ecommerce/abandoned-carts',
      },
      { id: 'ecommerce-logistics', label: 'Logística', url: '/admin/ecommerce/logistics' },
      { id: 'ecommerce-orders', label: 'Pedidos', url: '/admin/ecommerce/orders' },
    ],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: 'Settings',
    submenus: [
      { id: 'system-data', label: 'Dados do Sistema', url: '/admin/settings/system' },
      { id: 'maintenance', label: 'Manutenção', url: '/admin/settings/maintenance' },
      { id: 'plan-services', label: 'Planos/Serviços', url: '/admin/settings/plan-services' },
      { id: 'sla-types', label: 'Tipos de SLA', url: '/admin/settings/sla-types' },
      { id: 'media', label: 'Mídia', url: '/admin/settings/media' },
      { id: 'analytics', label: 'Analytics', url: '/admin/settings/analytics' },
    ],
  },
  {
    id: 'suporte',
    label: 'Suporte',
    icon: 'LifeBuoy',
    submenus: [
      {
        id: 'sup-tickets',
        label: 'Gestão de Chamados',
        url: '/admin/support/tickets',
        icon: 'Ticket',
      },
      { id: 'sup-sla', label: 'Configurações de SLA', url: '/admin/support/sla', icon: 'Clock' },
    ],
  },
]
