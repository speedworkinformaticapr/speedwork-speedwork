import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Settings,
  CalendarDays,
  FileText,
  ShoppingCart,
  Users,
  Briefcase,
  FileSignature,
  LogOut,
  Globe,
  DollarSign,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const adminNavItems = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '/admin/dashboard' },
  { title: 'Agendamentos', icon: CalendarDays, url: '/admin/appointments' },
  { title: 'Comercial', icon: Briefcase, url: '/admin/commercial/dashboard' },
  { title: 'Orçamentos', icon: FileSignature, url: '/admin/quotes' },
  { title: 'Financeiro', icon: DollarSign, url: '/admin/financial/dashboard' },
  { title: 'E-commerce', icon: ShoppingCart, url: '/admin/ecommerce/orders' },
  { title: 'Serviços', icon: FileText, url: '/admin/services' },
  { title: 'Usuários', icon: Users, url: '/admin/users' },
  { title: 'Comunicação', icon: MessageSquare, url: '/admin/whatsapp' },
  { title: 'Conteúdo Site', icon: Globe, url: '/admin/pages' },
  { title: 'Configurações', icon: Settings, url: '/admin/settings/system-data' },
]

export default function AdminLayout() {
  const { pathname } = useLocation()
  const { signOut } = useAuth()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="p-4 border-b">
            <h2 className="text-xl font-bold truncate">Administração</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.url)}
                        tooltip={item.title}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 shrink-0" />
                          <span className="font-medium whitespace-normal break-words">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => signOut()} tooltip="Sair da Conta">
                  <LogOut className="w-5 h-5 shrink-0 text-red-500" />
                  <span className="font-medium text-red-500 whitespace-normal break-words">
                    Sair da Conta
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b flex items-center px-4 bg-background shrink-0 shadow-sm">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
