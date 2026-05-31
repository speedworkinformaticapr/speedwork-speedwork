import { Link, useLocation } from 'react-router-dom'
import * as LucideIcons from 'lucide-react'
import { useSystemData } from '@/hooks/use-system-data'
import {
  useSidebar,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronRight } from 'lucide-react'
import { DEFAULT_MENU_CONFIG } from '@/lib/menu-constants'

const RenderIcon = ({ name, className }: { name: string; className?: string }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Circle
  return <Icon className={className} />
}

export function AppSidebar() {
  const { data } = useSystemData()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const location = useLocation()

  const rawMenuConfig = data?.admin_menu_config as any[] | undefined
  const menuConfig = rawMenuConfig?.length ? rawMenuConfig : DEFAULT_MENU_CONFIG

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-4 flex items-center justify-center min-h-[72px]">
        {state === 'expanded' ? (
          <img
            src={data?.logo_url || '/placeholder.svg'}
            alt="Logo"
            className="h-8 object-contain"
          />
        ) : (
          <img
            src={data?.browser_icon_url || '/placeholder.svg'}
            alt="Icon"
            className="h-8 w-8 object-contain"
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuConfig.map((group: any) => {
              const isActiveGroup = group.items?.some((i: any) =>
                location.pathname.startsWith(i.path),
              )
              return (
                <Collapsible
                  key={group.id}
                  defaultOpen={isActiveGroup || true}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={group.label}>
                        <RenderIcon name={group.icon} />
                        <span>{group.label}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.items?.map((item: any) => (
                          <SidebarMenuSubItem key={item.id}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={location.pathname === item.path}
                            >
                              <Link to={item.path} onClick={() => isMobile && setOpenMobile(false)}>
                                {item.label}
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
    </Sidebar>
  )
}
