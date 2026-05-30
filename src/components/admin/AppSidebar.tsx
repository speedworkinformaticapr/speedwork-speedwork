import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Image,
  Settings,
  Users,
  CreditCard,
  ShoppingCart,
  LogOut,
  ChevronUp,
  User2,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  ChevronRight,
  Trophy,
  Globe,
} from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { useSystemData } from '@/hooks/use-system-data'
import { supabase } from '@/lib/supabase/client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const adminMenus = [
  {
    title: 'Geral',
    items: [
      { title: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { title: 'Usuários', icon: Users, path: '/admin/users' },
      { title: 'Agendamentos', icon: Calendar, path: '/admin/appointments' },
      { title: 'Serviços', icon: Settings, path: '/admin/services' },
      { title: 'Orçamentos', icon: FileText, path: '/admin/quotes' },
    ],
  },
  {
    title: 'Comercial',
    icon: Briefcase,
    items: [
      { title: 'Dashboard', path: '/admin/commercial/dashboard' },
      { title: 'Pedidos', path: '/admin/commercial/pedidos' },
      { title: 'Contratos', path: '/admin/commercial/contratos' },
    ],
  },
  {
    title: 'Negócio & Esporte',
    icon: Trophy,
    items: [
      { title: 'Atributos', path: '/admin/athlete-attributes' },
      { title: 'Avaliações', path: '/admin/athlete-evaluations' },
      { title: 'Scouting', path: '/admin/athlete-scouting' },
      { title: 'Categorias', path: '/admin/athlete-categories' },
      { title: 'Cursos/Campos', path: '/admin/courses' },
      { title: 'Torneios', path: '/admin/tournaments' },
      { title: 'Ranking', path: '/admin/ranking' },
      { title: 'Regras', path: '/admin/rules' },
    ],
  },
  {
    title: 'Conteúdo',
    icon: FileText,
    items: [
      { title: 'Páginas', path: '/admin/pages' },
      { title: 'Blog', path: '/admin/blog' },
      { title: 'Galeria', path: '/admin/gallery' },
    ],
  },
  {
    title: 'Comunicação',
    icon: Phone,
    items: [
      { title: 'WhatsApp', path: '/admin/whatsapp' },
      { title: 'E-mail', path: '/admin/email' },
    ],
  },
  {
    title: 'E-commerce',
    icon: ShoppingCart,
    items: [
      { title: 'Pedidos', path: '/admin/ecommerce/orders' },
      { title: 'Produtos', path: '/admin/ecommerce/products' },
      { title: 'Grupos', path: '/admin/ecommerce/groups' },
      { title: 'Carrinhos Abandonados', path: '/admin/ecommerce/abandoned-carts' },
      { title: 'Logística', path: '/admin/ecommerce/logistics' },
      { title: 'Checkout', path: '/admin/ecommerce/checkout-config' },
      { title: 'Aparência', path: '/admin/ecommerce/store-editor' },
    ],
  },
  {
    title: 'Financeiro',
    icon: CreditCard,
    items: [
      { title: 'Dashboard', path: '/admin/financial/dashboard' },
      { title: 'Lançamentos', path: '/admin/financial/payments' },
      { title: 'Inscrições', path: '/admin/financial/registration-payments' },
      { title: 'Categorias', path: '/admin/financial/categories' },
      { title: 'Plano de Contas', path: '/admin/financial/chart-of-accounts' },
      { title: 'Parceiros', path: '/admin/financial/partners' },
      { title: 'Stripe Config', path: '/admin/financial/stripe-config' },
      { title: 'Logs de Cobrança', path: '/admin/financial/billing-logs' },
      { title: 'Configurações', path: '/admin/financial/settings' },
    ],
  },
  {
    title: 'Configurações',
    icon: Settings,
    items: [
      { title: 'Dados do Sistema', path: '/admin/settings/system-data' },
      { title: 'Planos e Serviços', path: '/admin/settings/plan-services' },
      { title: 'Tipos de SLA', path: '/admin/settings/sla-types' },
      { title: 'Mídias', path: '/admin/settings/media' },
      { title: 'Manutenção', path: '/admin/settings/maintenance' },
      { title: 'Analytics', path: '/admin/settings/analytics' },
      { title: 'Logs de Publicação', path: '/admin/settings/publish-logs' },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { data: systemData } = useSystemData()
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile({ name: data.name || '', email: data.email || user.email || '' })
          } else {
            setProfile({ name: 'Administrador', email: user.email || '' })
          }
        })
    }
  }, [user])

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4 shrink-0">
        <Link to="/admin/dashboard" className="flex items-center gap-3 w-full">
          {systemData?.logo_url ? (
            <img src={systemData.logo_url} alt="Logo" className="h-8 w-auto object-contain" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
              A
            </div>
          )}
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="truncate font-semibold text-sm">
              {systemData?.platform_name || 'Admin Panel'}
            </span>
            <span className="truncate text-xs text-muted-foreground">Área Administrativa</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {adminMenus.map((group) => {
              if (!group.icon) {
                return group.items.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                      <Link to={item.path} className="flex items-center gap-2">
                        {item.icon && <item.icon className="size-4 shrink-0" />}
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              }

              const isActiveGroup = group.items.some((i) => location.pathname.startsWith(i.path))

              return (
                <Collapsible
                  key={group.title}
                  asChild
                  defaultOpen={isActiveGroup}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={group.title}>
                        <group.icon className="size-4 shrink-0" />
                        <span className="truncate">{group.title}</span>
                        <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-5 border-l px-0 py-1">
                        {group.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.path}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={location.pathname === subItem.path}
                            >
                              <Link to={subItem.path} className="pl-4">
                                <span className="truncate">{subItem.title}</span>
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
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-full justify-between border bg-background shadow-sm hover:bg-accent data-[state=open]:bg-sidebar-accent"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User2 className="size-4" />
                </div>
                <div className="flex flex-col items-start overflow-hidden text-left">
                  <span className="truncate text-sm font-medium w-full">
                    {profile?.name || user?.email?.split('@')[0] || 'Carregando...'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground w-full">
                    {profile?.email || ''}
                  </span>
                </div>
              </div>
              <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px] mb-2">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/admin/dashboard" className="w-full flex items-center">
                <LayoutDashboard className="mr-2 size-4" />
                Dashboard Admin
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/" className="w-full flex items-center">
                <Globe className="mr-2 size-4" />
                Acessar Site Público
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/admin/settings/system-data" className="w-full flex items-center">
                <Settings className="mr-2 size-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
            >
              <LogOut className="mr-2 size-4" />
              Sair do Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
