import { useState, useEffect, Suspense } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useSystemData } from '@/hooks/use-system-data'
import { DEFAULT_MENU_CONFIG, normalizeMenuConfig, type MenuConfig } from '@/lib/menu-constants'
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
  useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import * as Icons from 'lucide-react'
import { ChevronRight, LogOut, User } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const renderIcon = (iconName: string, className?: string) => {
  const IconCmp = (Icons as any)[iconName] || Icons.Circle
  return <IconCmp className={className || 'size-4'} />
}

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const { data: systemData } = useSystemData()
  const [profile, setProfile] = useState<any>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const { open: sidebarOpen } = useSidebar()

  useEffect(() => {
    localStorage.setItem('sidebar_open', String(sidebarOpen))
  }, [sidebarOpen])

  const rawMenuConfig = systemData?.admin_menu_config as any[] | undefined
  const menuConfig = rawMenuConfig?.length
    ? normalizeMenuConfig(rawMenuConfig)
    : DEFAULT_MENU_CONFIG

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

  useEffect(() => {
    let matchedMenu: string | null = null
    for (const group of menuConfig) {
      if (
        group.submenus?.some(
          (sub) => location.pathname === sub.url || location.pathname.startsWith(`${sub.url}/`),
        )
      ) {
        matchedMenu = group.id
        break
      }
    }
    if (
      !matchedMenu &&
      (location.pathname === '/admin' || location.pathname === '/admin/dashboard')
    ) {
      matchedMenu = null
    }
    if (matchedMenu) {
      setOpenMenu(matchedMenu)
    }
  }, [location.pathname, menuConfig])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isPathActive = (url: string) =>
    location.pathname === url || location.pathname.startsWith(`${url}/`)

  return (
    <div className="flex w-full min-h-screen bg-background">
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="flex h-16 items-center justify-center border-b px-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 font-bold text-lg overflow-hidden"
          >
            {systemData?.logo_url ? (
              <img
                src={systemData.logo_url}
                alt="Logo"
                className="h-8 w-8 object-contain shrink-0"
              />
            ) : (
              <span className="truncate group-data-[collapsible=icon]:hidden">
                {systemData?.platform_name || 'Admin'}
              </span>
            )}
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {menuConfig.map((group) => {
              const isOpen = openMenu === group.id
              const isActiveGroup = group.submenus?.some((sub) => isPathActive(sub.url))

              if (!group.submenus && group.url) {
                return (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton
                      tooltip={group.label}
                      isActive={isPathActive(group.url)}
                      asChild
                    >
                      <Link to={group.url}>
                        {group.icon && renderIcon(group.icon)}
                        <span>{group.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              }

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
                          {group.icon && renderIcon(group.icon)}
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
                        {group.submenus?.map((sub) => {
                          const isItemActive = isPathActive(sub.url)
                          return (
                            <SidebarMenuSubItem key={sub.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isItemActive}
                                className={cn(
                                  'transition-colors',
                                  isItemActive && 'font-semibold text-primary bg-primary/10',
                                )}
                              >
                                <Link to={sub.url}>{sub.label}</Link>
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
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </SidebarInset>
    </div>
  )
}
