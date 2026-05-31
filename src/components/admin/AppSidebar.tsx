import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { useSystemData } from '@/hooks/use-system-data'
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  FileSignature,
  Users,
  UserCircle,
  FolderTree,
  Trophy,
  GraduationCap,
  Medal,
  FileJson,
  Wallet,
  CreditCard,
  Building,
  Settings,
  Store,
  Package,
  Truck,
  AlertTriangle,
  Monitor,
  Image as ImageIcon,
  Newspaper,
  AppWindow,
} from 'lucide-react'

export function AppSidebar() {
  const { data: systemData } = useSystemData()
  const { state } = useSidebar()
  const location = useLocation()

  const navGroups = [
    {
      title: 'Comercial',
      items: [
        { title: 'Dashboard', url: '/admin/commercial/dashboard', icon: LayoutDashboard },
        { title: 'Orçamentos', url: '/admin/quotes', icon: FileText },
        { title: 'Pedidos', url: '/admin/commercial/pedidos', icon: ShoppingCart },
        { title: 'Contratos', url: '/admin/commercial/contratos', icon: FileSignature },
      ],
    },
    {
      title: 'Gestão Esportiva',
      items: [
        { title: 'Atletas / Usuários', url: '/admin/users', icon: Users },
        { title: 'Atributos', url: '/admin/athlete-attributes', icon: UserCircle },
        { title: 'Categorias', url: '/admin/athlete-categories', icon: FolderTree },
        { title: 'Torneios/Eventos', url: '/admin/tournaments', icon: Trophy },
        { title: 'Cursos', url: '/admin/courses', icon: GraduationCap },
        { title: 'Ranking', url: '/admin/ranking', icon: Medal },
        { title: 'Regras', url: '/admin/rules', icon: FileJson },
      ],
    },
    {
      title: 'Financeiro',
      items: [
        { title: 'Dashboard', url: '/admin/financial/dashboard', icon: LayoutDashboard },
        { title: 'Plano de Contas', url: '/admin/financial/chart-of-accounts', icon: Wallet },
        { title: 'Categorias', url: '/admin/financial/categories', icon: FolderTree },
        {
          title: 'Pgto. Inscrições',
          url: '/admin/financial/registration-payments',
          icon: CreditCard,
        },
        { title: 'Pgto. Stripe', url: '/admin/financial/stripe-payments', icon: CreditCard },
        { title: 'Parceiros', url: '/admin/financial/partners', icon: Building },
        { title: 'Configuração Stripe', url: '/admin/financial/stripe-config', icon: Settings },
      ],
    },
    {
      title: 'E-commerce',
      items: [
        { title: 'Loja/Produtos', url: '/admin/ecommerce/products', icon: Store },
        { title: 'Grupos de Prod.', url: '/admin/ecommerce/groups', icon: Package },
        { title: 'Pedidos E-comm', url: '/admin/ecommerce/orders', icon: ShoppingCart },
        { title: 'Carrinhos Aband.', url: '/admin/ecommerce/abandoned-carts', icon: AlertTriangle },
        { title: 'Logística', url: '/admin/ecommerce/logistics', icon: Truck },
      ],
    },
    {
      title: 'Configurações e Sistema',
      items: [
        { title: 'Dados do Sistema', url: '/admin/settings/system-data', icon: Monitor },
        { title: 'Manutenção', url: '/admin/settings/maintenance', icon: AlertTriangle },
        { title: 'Mídias', url: '/admin/settings/media', icon: ImageIcon },
        { title: 'Blog', url: '/admin/blog', icon: Newspaper },
        { title: 'Páginas', url: '/admin/pages', icon: AppWindow },
      ],
    },
  ]

  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-2">
        <Link
          to="/admin/dashboard"
          className="flex items-center justify-center w-full h-full overflow-hidden hover:opacity-80 transition-opacity"
        >
          {!isCollapsed ? (
            systemData?.logo_url ? (
              <img src={systemData.logo_url} alt="Logo" className="h-8 object-contain" />
            ) : (
              <span className="font-bold text-lg truncate uppercase">
                {systemData?.platform_name || 'SPEEDWORK'}
              </span>
            )
          ) : systemData?.browser_icon_url ? (
            <img src={systemData.browser_icon_url} alt="Icon" className="w-5 h-5 object-contain" />
          ) : (
            <span className="font-bold text-lg">S</span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        location.pathname === item.url ||
                        location.pathname.startsWith(item.url + '/')
                      }
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
