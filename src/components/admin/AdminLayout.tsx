import { useState, useEffect, useMemo, Suspense } from 'react'
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
  const { signOut, user, roles } = useAuth()
  const { data: systemData } = useSystemData()
  const [profile, setProfile] = useState<any>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const { open: sidebarOpen, state: sidebarState } = useSidebar()

  const rawMenuConfig = systemData?.admin_menu_config as any[] | undefined
  const menuConfig: MenuConfig[] = useMemo(
    () => (rawMenuConfig?.length ? normalizeMenuConfig(rawMenuConfig) : DEFAULT_MENU_CONFIG),
    [rawMenuConfig],
  )

  const isAuthor = roles.some((r) => r.toLowerCase() === 'autor')

  const filteredMenuConfig = useMemo<MenuConfig[]>(() => {
    if (!isAuthor) return menuConfig
    return [
      {
        id: 'blog',
        label: 'Posts do Blog',
        url: '/admin/settings/blog',
        icon: 'FileText',
      },
    ]
  }, [menuConfig, isAuthor])

  const allTerminalUrls = useMemo(() => {
    const urls: string[] = []
    for (const group of filteredMenuConfig) {
      if (group.submenus) {
        for (const sub of group.submenus) {
          if (sub.url) urls.push(sub.url)
        }
      } else if (group.url) {
        urls.push(group.url)
      }
    }
    return urls
  }, [filteredMenuConfig])

  const activeUrl = useMemo(() => {
    let best = ''
    for (const url of allTerminalUrls) {
      if (location.pathname === url || location.pathname.startsWith(`${url}/`)) {
        if (url.length > best.length) best = url
      }
    }
    return best
  }, [location.pathname, allTerminalUrls])

  useEffect(() => {
    localStorage.setItem('sidebar_open', String(sidebarOpen))
  }, [sidebarOpen])

  useEffect(() => {
    if (sidebarState === 'collapsed') {
      setOpenMenu(null)
    }
  }, [sidebarState])

  useEffect(() => {
    if (sidebarState === 'collapsed') return
    for (const group of filteredMenuConfig) {
      if (group.submenus?.some((sub) => sub.url === activeUrl)) {
        setOpenMenu(group.id)
        break
      }
    }
  }, [activeUrl, filteredMenuConfig, sidebarState])

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

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex w-full min-h-screen bg-background">
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="flex min-h-16 items-center justify-center border-b px-4 py-3">
          <Link to="/admin/dashboard" className="flex items-center justify-center">
            {systemData?.browser_icon_url || systemData?.logo_url ? (
              <img
                src={systemData.browser_icon_url || systemData.logo_url}
                alt="Logo"
                className="size-10 object-contain shrink-0"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shrink-0">
                {(systemData?.platform_name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {filteredMenuConfig.map((group) => {
              const isOpen = openMenu === group.id
              const isActiveGroup = group.submenus?.some((sub) => sub.url === activeUrl) ?? false

              if (!group.submenus && group.url) {
                return (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton
                      tooltip={group.label}
                      isActive={activeUrl === group.url}
                      asChild
                    >
                      <Link to={group.url}>
                        {group.icon && renderIcon(group.icon)}
                        <span className="group-data-[collapsible=icon]:hidden transition-opacity duration-200">
                          {group.label}
                        </span>
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
                        className={cn(
                          'w-full transition-all duration-300',
                          isActiveGroup && 'font-medium text-primary',
                        )}
                      >
                        {group.icon && renderIcon(group.icon)}
                        <span className="group-data-[collapsible=icon]:hidden transition-opacity duration-200">
                          {group.label}
                        </span>
                        <ChevronRight
                          className={cn(
                            'ml-auto size-4 transition-transform duration-300 group-data-[collapsible=icon]:hidden',
                            isOpen && 'rotate-90',
                          )}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                      <SidebarMenuSub>
                        {group.submenus?.map((sub) => {
                          const isItemActive = activeUrl === sub.url
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
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors duration-300"
              >
                <LogOut className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden transition-opacity duration-200">
                  Sair do Sistema
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 w-full min-w-0">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6 z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-2" />
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
