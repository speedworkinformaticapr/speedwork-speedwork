import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Settings,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Briefcase,
  ShoppingCart,
  Users,
  Wallet,
  ExternalLink,
  UserCircle,
  LineChart,
  DollarSign,
  CalendarDays,
  Tags,
  Database,
  Mail,
  Wrench,
  Receipt,
  MessageSquare,
  LayoutTemplate,
  Images,
  Layout,
  Image,
  Video,
  AppWindow,
  FileEdit,
  CreditCard,
  ShoppingBag,
  Settings2,
  Store,
  Package,
  Component,
  Truck,
  Box,
  ListPlus,
  Star,
  FileSignature,
  GraduationCap,
  CalendarClock,
  Bookmark,
  FileSpreadsheet,
  Calendar,
  ClipboardList,
  Trophy,
  Scale,
  Target,
  Flag,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

const navItems = [
  {
    title: 'Dashboards',
    icon: LayoutDashboard,
    items: [
      { title: 'Dashboard Administrativo', url: '/admin/dashboard', icon: LayoutDashboard },
      { title: 'Analytics & Performance', url: '/admin/settings/analytics', icon: LineChart },
      { title: 'Dashboard Comercial', url: '/admin/commercial/dashboard', icon: DollarSign },
      {
        title: 'Dashboard de Agendamentos',
        url: '/admin/appointments-dashboard',
        icon: CalendarDays,
      },
    ],
  },
  {
    title: 'Configurações',
    icon: Settings,
    items: [
      { title: 'Categorias de Associados', url: '/admin/financial/categories', icon: Tags },
      { title: 'Dados do Sistema', url: '/admin/settings/system-data', icon: Database },
      { title: 'Gestão de E-mail', url: '/admin/email', icon: Mail },
      { title: 'Manutenção', url: '/admin/settings/maintenance', icon: Wrench },
      { title: 'Plano de Contas', url: '/admin/financial/chart-of-accounts', icon: FileText },
      { title: 'Regras de Cobrança', url: '/admin/financial/settings', icon: Receipt },
      { title: 'Usuários do Sistema', url: '/admin/users', icon: Users },
      { title: 'Gestão WhatsApp', url: '/admin/whatsapp', icon: MessageSquare },
    ],
  },
  {
    title: 'Customizar CMS',
    icon: LayoutTemplate,
    items: [
      { title: 'Carrossel Principal', url: '/admin/settings/hero-carousel', icon: Images },
      { title: 'Dobras (Seções)', url: '/admin/sections', icon: Layout },
      { title: 'Galeria de Fotos', url: '/admin/gallery', icon: Image },
      { title: 'Gestão de Mídias', url: '/admin/settings/media', icon: Video },
      { title: 'Páginas & Rotas', url: '/admin/pages', icon: AppWindow },
      { title: 'Posts do Blog', url: '/admin/blog', icon: FileEdit },
    ],
  },
  {
    title: 'Financeiro',
    icon: Wallet,
    items: [
      { title: 'Controle de Pagamentos', url: '/admin/financial/payments', icon: CreditCard },
    ],
  },
  {
    title: 'Gestão de E-commerce',
    icon: ShoppingCart,
    items: [
      {
        title: 'Carrinhos Abandonados',
        url: '/admin/ecommerce/abandoned-carts',
        icon: ShoppingBag,
      },
      { title: 'Configurar Checkout', url: '/admin/ecommerce/checkout-config', icon: Settings2 },
      { title: 'Editor da Loja', url: '/admin/ecommerce/store-editor', icon: Store },
      { title: 'Gestão de Pedidos', url: '/admin/ecommerce/orders', icon: Package },
      { title: 'Grupos de Produtos', url: '/admin/ecommerce/groups', icon: Component },
      { title: 'Logística e Fretes', url: '/admin/ecommerce/logistics', icon: Truck },
      { title: 'Produtos', url: '/admin/ecommerce/products', icon: Box },
    ],
  },
  {
    title: 'Gestão de Negócio',
    icon: Briefcase,
    items: [
      { title: 'Atributos da Bio', url: '/admin/athlete-attributes', icon: ListPlus },
      { title: 'Avaliações', url: '/admin/athlete-evaluations', icon: Star },
      { title: 'Contratos', url: '/admin/commercial/contratos', icon: FileSignature },
      { title: 'Cursos', url: '/admin/courses', icon: GraduationCap },
      { title: 'Gerenciar Agendamentos', url: '/admin/appointments/manage', icon: CalendarClock },
      { title: 'Gestão de Categorias', url: '/admin/athlete-categories', icon: Bookmark },
      { title: 'Orçamentos', url: '/admin/quotes', icon: FileSpreadsheet },
      { title: 'Painel de Agendamentos', url: '/admin/appointments', icon: Calendar },
      { title: 'Pedidos', url: '/admin/commercial/pedidos', icon: ClipboardList },
      { title: 'Ranking', url: '/admin/ranking', icon: Trophy },
      { title: 'Regras', url: '/admin/rules', icon: Scale },
      { title: 'Scouting de Atletas', url: '/admin/athlete-scouting', icon: Target },
      { title: 'Serviços', url: '/admin/services', icon: Wrench },
      { title: 'Torneios', url: '/admin/tournaments', icon: Flag },
    ],
  },
]

export function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [userRoles, setUserRoles] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setUserRoles(data.map((r: any) => r.role))
          } else {
            supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single()
              .then(({ data: profileData }) => {
                if (profileData?.role) {
                  setUserRoles([profileData.role])
                }
              })
          }
        })
    }
  }, [user])

  const handleSwitchRole = (role: string) => {
    localStorage.setItem('activeRole', role)
    if (role === 'admin') window.location.href = '/admin/dashboard'
    else if (role === 'club') window.location.href = '/club/dashboard'
    else if (role === 'staff') window.location.href = '/staff/dashboard'
    else if (role === 'client') window.location.href = '/client/dashboard'
    else window.location.href = '/'
  }

  const allNavItems = useMemo(() => {
    const baseItems = [...navItems]

    const dashboardItem = baseItems.find((item) => item.title === 'Dashboards')
    const otherItems = baseItems.filter((item) => item.title !== 'Dashboards')

    const processedOtherItems = otherItems.map((item) => {
      if (item.items) {
        return {
          ...item,
          items: [...item.items].sort((a, b) => a.title.localeCompare(b.title)),
        }
      }
      return item
    })

    processedOtherItems.sort((a, b) => a.title.localeCompare(b.title))

    return dashboardItem ? [dashboardItem, ...processedOtherItems] : processedOtherItems
  }, [userRoles])

  const [openSection, setOpenSection] = useState<string | null>(() => {
    return (
      allNavItems.find((item) => item.items?.some((sub) => location.pathname.startsWith(sub.url)))
        ?.title || null
    )
  })

  useEffect(() => {
    const currentSection = allNavItems.find((item) =>
      item.items?.some((sub) => location.pathname.startsWith(sub.url)),
    )?.title

    if (currentSection) {
      setOpenSection((prev) => (prev !== currentSection ? currentSection : prev))
    }
  }, [location.pathname, allNavItems])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="h-16 flex items-center justify-center border-b">
        <div className="flex items-center gap-3 px-2 overflow-hidden w-full">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="truncate font-bold text-lg group-data-[collapsible=icon]:hidden text-primary">
            Admin Footgolf
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel aria-label="Seções do Sistema">Menu Administrativo</SidebarGroupLabel>
          <SidebarMenu>
            {allNavItems.map((item) =>
              item.items ? (
                <Collapsible
                  key={item.title}
                  asChild
                  open={openSection === item.title}
                  onOpenChange={(isOpen) => setOpenSection(isOpen ? item.title : null)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        aria-label={`Abrir menu ${item.title}`}
                      >
                        {item.icon && <item.icon aria-hidden="true" />}
                        <span>{item.title}</span>
                        <ChevronRight
                          className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                          aria-hidden="true"
                        />
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
                              <Link to={subItem.url} aria-label={`Ir para ${subItem.title}`}>
                                {subItem.icon && (
                                  <subItem.icon
                                    className="h-4 w-4 mr-2 shrink-0"
                                    aria-hidden="true"
                                  />
                                )}
                                <span className="truncate">{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url} aria-label={`Ir para ${item.title}`}>
                      {item.icon && <item.icon aria-hidden="true" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ),
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Visualizar Site">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden="true" />
                <span>Visualizar Site</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-1">
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-destructive hover:text-destructive flex-1"
              tooltip="Sair do sistema"
            >
              <LogOut aria-hidden="true" />
              <span>Logout</span>
            </SidebarMenuButton>

            {userRoles.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0"
                    title="Trocar Perfil"
                  >
                    <UserCircle aria-hidden="true" className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                    Trocar Perfil
                  </div>
                  {userRoles.map((role) => (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => handleSwitchRole(role)}
                      className="cursor-pointer"
                    >
                      {role === 'admin'
                        ? 'Administrador'
                        : role === 'club'
                          ? 'Clube'
                          : role === 'client'
                            ? 'Cliente'
                            : role === 'staff'
                              ? 'Equipe'
                              : role}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
