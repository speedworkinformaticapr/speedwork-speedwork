import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useSystemData } from '@/hooks/use-system-data'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  Briefcase,
  DollarSign,
  ClipboardList,
  Trophy,
  Store,
  FileText,
  MessageSquare,
  Settings,
  ChevronRight,
  LogOut,
} from 'lucide-react'

export function AppSidebar() {
  const { systemData } = useSystemData()
  const { signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Comercial',
      icon: Briefcase,
      items: [
        { title: 'Dashboard', url: '/admin/commercial/dashboard' },
        { title: 'Pedidos', url: '/admin/commercial/pedidos' },
        { title: 'Contratos', url: '/admin/commercial/contratos' },
      ],
    },
    {
      title: 'Financeiro',
      icon: DollarSign,
      items: [
        { title: 'Dashboard', url: '/admin/financial/dashboard' },
        { title: 'Pagamentos', url: '/admin/financial/payments' },
        { title: 'Cobranças', url: '/admin/financial/billing-logs' },
        { title: 'Inscrições', url: '/admin/financial/registration-payments' },
        { title: 'Stripe Config', url: '/admin/financial/stripe-config' },
        { title: 'Stripe Pagamentos', url: '/admin/financial/stripe-payments' },
        { title: 'Parceiros', url: '/admin/financial/partners' },
        { title: 'Plano de Contas', url: '/admin/financial/chart-of-accounts' },
        { title: 'Categorias', url: '/admin/financial/categories' },
        { title: 'Configurações', url: '/admin/financial/settings' },
      ],
    },
    {
      title: 'Operacional',
      icon: ClipboardList,
      items: [
        { title: 'Orçamentos', url: '/admin/quotes' },
        { title: 'Serviços', url: '/admin/services' },
        { title: 'Agendamentos', url: '/admin/appointments' },
      ],
    },
    {
      title: 'Esportes',
      icon: Trophy,
      items: [
        { title: 'Ranking', url: '/admin/ranking' },
        { title: 'Torneios', url: '/admin/tournaments' },
        { title: 'Categorias', url: '/admin/athlete-categories' },
        { title: 'Campos', url: '/admin/courses' },
        { title: 'Atributos', url: '/admin/athlete-attributes' },
        { title: 'Avaliações', url: '/admin/athlete-evaluations' },
        { title: 'Scouting', url: '/admin/athlete-scouting' },
        { title: 'Regras', url: '/admin/rules' },
      ],
    },
    {
      title: 'E-commerce',
      icon: Store,
      items: [
        { title: 'Pedidos', url: '/admin/ecommerce/orders' },
        { title: 'Produtos', url: '/admin/ecommerce/products' },
        { title: 'Grupos', url: '/admin/ecommerce/groups' },
        { title: 'Carrinhos Abandonados', url: '/admin/ecommerce/abandoned-carts' },
        { title: 'Config. Checkout', url: '/admin/ecommerce/checkout-config' },
        { title: 'Logística', url: '/admin/ecommerce/logistics' },
        { title: 'Editor da Loja', url: '/admin/ecommerce/store-editor' },
      ],
    },
    {
      title: 'Conteúdo',
      icon: FileText,
      items: [
        { title: 'Páginas', url: '/admin/pages' },
        { title: 'Blog', url: '/admin/blog' },
        { title: 'Galeria', url: '/admin/gallery' },
      ],
    },
    {
      title: 'Comunicação',
      icon: MessageSquare,
      items: [
        { title: 'WhatsApp', url: '/admin/whatsapp' },
        { title: 'E-mail', url: '/admin/email' },
      ],
    },
    {
      title: 'Configurações',
      icon: Settings,
      items: [
        { title: 'Dados do Sistema', url: '/admin/settings/system-data' },
        { title: 'Usuários', url: '/admin/users' },
        { title: 'Planos de Serviço', url: '/admin/settings/plan-services' },
        { title: 'Tipos de SLA', url: '/admin/settings/sla-types' },
        { title: 'Mídia', url: '/admin/settings/media' },
        { title: 'Analytics', url: '/admin/settings/analytics' },
        { title: 'Logs de Publicação', url: '/admin/settings/publish-logs' },
        { title: 'Manutenção', url: '/admin/settings/maintenance' },
      ],
    },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-col items-center justify-center pt-6 pb-4 px-2">
        <Link
          to="/admin/dashboard"
          className="flex items-center justify-center w-full min-h-10 overflow-hidden"
        >
          <img
            src={
              systemData?.logo_url || 'https://img.usecurling.com/i?q=logo&shape=outline&color=blue'
            }
            alt="Logo"
            className="h-10 w-auto object-contain transition-all duration-300 hidden group-data-[state=expanded]:block"
          />
          <img
            src={
              systemData?.browser_icon_url ||
              'https://img.usecurling.com/i?q=icon&shape=outline&color=blue'
            }
            alt="Icon"
            className="size-8 object-contain transition-all duration-300 group-data-[state=expanded]:hidden"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                if (!item.items) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                      >
                        <Link to={item.url}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                const isActive = item.items.some((sub) => location.pathname.startsWith(sub.url))

                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={location.pathname === subItem.url}
                              >
                                <Link to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sair">
              <LogOut className="size-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
