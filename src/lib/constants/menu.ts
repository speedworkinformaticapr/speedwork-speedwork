import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  ShoppingCart,
  Settings,
  FileText,
  Image,
  ListOrdered,
  Calendar,
  MessageSquare,
} from 'lucide-react'

export type MenuItem = {
  id: string
  label: string
  path: string
}

export type MenuGroup = {
  id: string
  label: string
  icon?: string
  items: MenuItem[]
}

export const DEFAULT_MENU: MenuGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    items: [
      { id: 'admin-dash', label: 'Administrativo', path: '/admin/dashboard' },
      { id: 'com-dash', label: 'Comercial', path: '/admin/commercial/dashboard' },
      { id: 'fin-dash', label: 'Financeiro', path: '/admin/financial/dashboard' },
    ],
  },
  {
    id: 'support',
    label: 'Suporte & Tickets',
    icon: 'MessageSquare',
    items: [
      { id: 'tickets', label: 'Tickets', path: '/admin/support/tickets' },
      { id: 'sla', label: 'Configuração de SLA', path: '/admin/support/sla' },
    ],
  },
  {
    id: 'commercial',
    label: 'Comercial',
    icon: 'Briefcase',
    items: [
      { id: 'pedidos', label: 'Pedidos', path: '/admin/commercial/pedidos' },
      { id: 'contratos', label: 'Contratos', path: '/admin/commercial/contratos' },
      { id: 'quotes', label: 'Orçamentos', path: '/admin/quotes' },
    ],
  },
  {
    id: 'financial',
    label: 'Financeiro',
    icon: 'DollarSign',
    items: [
      { id: 'payments', label: 'Pagamentos', path: '/admin/financial/payments' },
      { id: 'partners', label: 'Parceiros', path: '/admin/financial/partners' },
      { id: 'chart', label: 'Plano de Contas', path: '/admin/financial/chart-of-accounts' },
    ],
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: 'Settings',
    items: [
      { id: 'system', label: 'Dados do Sistema', path: '/admin/settings/system-data' },
      { id: 'media', label: 'Mídia', path: '/admin/settings/media' },
    ],
  },
]

export const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  ShoppingCart,
  Settings,
  FileText,
  Image,
  ListOrdered,
  Calendar,
  MessageSquare,
}
