import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useSystemData } from '@/hooks/use-system-data'
import { DEFAULT_MENU_CONFIG } from '@/lib/menu-constants'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Briefcase,
  Trophy,
  DollarSign,
  ShoppingCart,
  Settings,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Briefcase,
  Trophy,
  DollarSign,
  ShoppingCart,
  Settings,
}

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const { data: systemData } = useSystemData()
  const [profile, setProfile] = useState<any>(null)

  const menuConfig = systemData?.admin_menu_config || DEFAULT_MENU_CONFIG

  // Accordion state: only one menu open at a time
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data)
        })
    }
  }, [user?.id])

  // Initialize or update open menu based on current route
  useEffect(() => {
    let matchedMenu = null

    // Find if current path matches any submenu item
    for (const group of menuConfig) {
      if (
        group.items?.some(
          (item: any) =>
            location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
        )
      ) {
        matchedMenu = group.id
        break
      }
    }

    // If we're at /admin or /admin/dashboard and no match, default to dashboards
    if (
      !matchedMenu &&
      (location.pathname === '/admin' || location.pathname === '/admin/dashboard')
    ) {
      matchedMenu = 'dashboards'
    }

    if (matchedMenu) {
      setOpenMenu(matchedMenu)
    }
  }, [location.pathname, menuConfig])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex w-full min-h-screen bg-background">
      <Sidebar variant="sidebar" collapsible="offcanvas">
        <SidebarHeader className="flex h-16 items-center justify-center border-b px-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 font-bold text-lg overflow-hidden"
          >
            {systemData?.logo_url ? (
              <img src={systemData.logo_url} alt="Logo" className="h-8 object-contain" />
            ) : (
              <span className="truncate">{systemData?.platform_name || 'Admin'}</span>
            )}
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {menuConfig.map((group: any) => {
              const Icon = ICON_MAP[group.icon] || LayoutDashboard
              const isOpen = openMenu === group.id
              const isActiveGroup = group.items?.some(
                (item: any) =>
                  location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
              )

              return (
                <Collapsible
                  key={group.id}
                  open={isOpen}
                  onOpenChange={(open) => setOpenMenu(open ? group.id : null)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={group.label}
                        isActive={isOpen || isActiveGroup}
                        className={cn(
                          'w-full justify-between transition-all',
                          (isOpen || isActiveGroup) && 'font-medium text-primary',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="size-4" />
                          <span>{group.label}</span>
                        </div>
                        <ChevronRight
                          className={cn(
                            'size-4 transition-transform duration-200',
                            isOpen && 'rotate-90',
                          )}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.items?.map((item: any) => {
                          const isItemActive =
                            location.pathname === item.path ||
                            location.pathname.startsWith(`${item.path}/`)
                          return (
                            <SidebarMenuSubItem key={item.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isItemActive}
                                className={cn(
                                  'transition-colors',
                                  isItemActive && 'font-semibold text-primary bg-primary/10',
                                )}
                              >
                                <Link to={item.path}>{item.label}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleSignOut}
                tooltip="Sair"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              >
                <LogOut className="size-4" />
                <span>Sair do Sistema</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 w-full min-w-0">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6 z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-2 md:hidden" />
            <SidebarTrigger className="hidden md:flex -ml-2" />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full h-8 w-8">
              <Link to="/profile">
                <Avatar className="size-8 border bg-background">
                  {profile?.photo_url ? (
                    <AvatarImage src={profile.photo_url} alt={profile.name || 'User'} />
                  ) : (
                    <AvatarFallback>
                      {profile?.name ? (
                        profile.name.charAt(0).toUpperCase()
                      ) : (
                        <User className="size-4" />
                      )}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 w-full overflow-y-auto p-4 md:p-6 bg-muted/10">
          <Outlet />
        </main>
      </SidebarInset>
    </div>
  )
}
