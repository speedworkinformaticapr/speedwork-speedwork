import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import { useSystemData } from '@/hooks/use-system-data'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  ShoppingCart,
  Briefcase,
  Database,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

function AdminSidebarBrand() {
  const { data } = useSystemData()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  if (!data) {
    return <div className="h-12 w-full animate-pulse bg-muted rounded-md" />
  }

  return (
    <Link
      to="/admin/dashboard"
      className="flex items-center justify-center w-full min-h-[3rem] transition-all overflow-hidden p-2 hover:bg-muted/50 rounded-md"
    >
      {!isCollapsed && data.logo_url ? (
        <img
          src={data.logo_url}
          alt="Logo"
          className="max-h-12 w-auto object-contain animate-in fade-in"
        />
      ) : isCollapsed && data.browser_icon_url ? (
        <img
          src={data.browser_icon_url}
          alt="Icon"
          className="max-h-8 w-auto object-contain animate-in fade-in"
        />
      ) : (
        <span className="font-bold text-xl truncate text-primary">
          {isCollapsed ? data.platform_name?.charAt(0) : data.platform_name || 'Admin'}
        </span>
      )}
    </Link>
  )
}

function AppSidebar() {
  const location = useLocation()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-4 py-3 h-[72px] flex flex-col justify-center">
        <AdminSidebarBrand />
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/admin/dashboard'}
                  tooltip="Dashboard"
                >
                  <Link to="/admin/dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith('/admin/commercial')}
                  tooltip="Comercial"
                >
                  <Link to="/admin/commercial/dashboard">
                    <Briefcase className="w-4 h-4" />
                    <span>Comercial</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith('/admin/financial')}
                  tooltip="Financeiro"
                >
                  <Link to="/admin/financial/dashboard">
                    <FileText className="w-4 h-4" />
                    <span>Financeiro</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith('/admin/ecommerce')}
                  tooltip="E-commerce"
                >
                  <Link to="/admin/ecommerce/orders">
                    <ShoppingCart className="w-4 h-4" />
                    <span>E-commerce</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith('/admin/users')}
                  tooltip="Usuários"
                >
                  <Link to="/admin/users">
                    <Users className="w-4 h-4" />
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/admin/settings/system-data'}
                  tooltip="Dados do Sistema"
                >
                  <Link to="/admin/settings/system-data">
                    <Database className="w-4 h-4" />
                    <span>Dados do Sistema</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    location.pathname.startsWith('/admin/settings') &&
                    location.pathname !== '/admin/settings/system-data'
                  }
                  tooltip="Configurações"
                >
                  <Link to="/admin/settings/maintenance">
                    <Settings className="w-4 h-4" />
                    <span>Configurações Gerais</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="group-data-[collapsible=icon]:hidden">Sair</span>
        </Button>
      </div>
    </Sidebar>
  )
}

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background w-full overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center px-4 shrink-0 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/20">
          <div className="mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
