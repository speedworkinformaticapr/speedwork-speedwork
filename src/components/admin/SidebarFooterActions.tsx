import { useAuth } from '@/hooks/use-auth'
import { LogOut, LayoutDashboard, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'

export function SidebarFooterActions() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <SidebarMenu>
      {profile?.is_club && (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => navigate('/club/dashboard')}
            tooltip="Dashboard Clube"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Clube</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}

      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate('/profile')}
          tooltip="Dashboard Usuário"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <User className="w-4 h-4" />
          <span>Dashboard Usuário</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleLogout}
          tooltip="Sair"
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
