import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import { useSystemData } from '@/hooks/use-system-data'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ChevronUp,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronRight,
  GripVertical,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// Helper to safely render icons by name
const IconRenderer = ({
  iconName,
  fallback: FallbackIcon = LucideIcons.Circle,
}: {
  iconName?: string
  fallback?: any
}) => {
  if (!iconName) return <FallbackIcon className="h-4 w-4" />
  const Icon = (LucideIcons as any)[iconName] || FallbackIcon
  return <Icon className="h-4 w-4" />
}

const DASHBOARDS = [
  { title: 'Principal', url: '/admin/dashboard' },
  { title: 'Comercial', url: '/admin/commercial/dashboard' },
  { title: 'Financeiro', url: '/admin/financial/dashboard' },
]

export function AppSidebar() {
  const { data: systemData, updateData } = useSystemData()
  const { user, signOut } = useAuth()
  const location = useLocation()
  const { state } = useSidebar()

  const [dashboards] = useState(DASHBOARDS)
  const [menuData, setMenuData] = useState<any[]>([])

  // DND State for subitems
  const [draggedItem, setDraggedItem] = useState<{
    groupIdx: number
    itemIdx: number
    subIdx: number
  } | null>(null)

  useEffect(() => {
    if (systemData?.admin_menu_config && Array.isArray(systemData.admin_menu_config)) {
      setMenuData(systemData.admin_menu_config)
    } else {
      // Fallback
      setMenuData([
        {
          title: 'Geral',
          items: [
            { title: 'Dashboard', url: '/admin/dashboard', icon: 'LayoutDashboard' },
            { title: 'Usuários', url: '/admin/users', icon: 'Users' },
            { title: 'Páginas', url: '/admin/pages', icon: 'FileText' },
            { title: 'Blog', url: '/admin/blog', icon: 'Edit3' },
          ],
        },
        {
          title: 'Negócios',
          items: [
            { title: 'Atributos', url: '/admin/athlete-attributes', icon: 'List' },
            { title: 'Avaliações', url: '/admin/athlete-evaluations', icon: 'ClipboardList' },
            { title: 'Categorias', url: '/admin/athlete-categories', icon: 'Tags' },
            { title: 'Campos', url: '/admin/courses', icon: 'Map' },
            { title: 'Torneios', url: '/admin/tournaments', icon: 'Trophy' },
            { title: 'Ranking', url: '/admin/ranking', icon: 'Medal' },
            { title: 'Regras', url: '/admin/rules', icon: 'BookOpen' },
          ],
        },
        {
          title: 'Configurações',
          items: [
            { title: 'Dados do Sistema', url: '/admin/settings/system-data', icon: 'Settings' },
            { title: 'Manutenção', url: '/admin/settings/maintenance', icon: 'Wrench' },
          ],
        },
      ])
    }
  }, [systemData?.admin_menu_config])

  const handleDragStart = (
    e: React.DragEvent,
    groupIdx: number,
    itemIdx: number,
    subIdx: number,
  ) => {
    setDraggedItem({ groupIdx, itemIdx, subIdx })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (
    e: React.DragEvent,
    targetGroupIdx: number,
    targetItemIdx: number,
    targetSubIdx: number,
  ) => {
    e.preventDefault()
    if (!draggedItem) return

    if (
      draggedItem.groupIdx === targetGroupIdx &&
      draggedItem.itemIdx === targetItemIdx &&
      draggedItem.subIdx !== targetSubIdx
    ) {
      const newMenuData = [...(menuData || [])]
      const group = newMenuData[targetGroupIdx]
      const item = group?.items?.[targetItemIdx]

      if (item && Array.isArray(item.subitems)) {
        const newSubitems = [...item.subitems]
        const [removed] = newSubitems.splice(draggedItem.subIdx, 1)
        newSubitems.splice(targetSubIdx, 0, removed)

        item.subitems = newSubitems
        setMenuData(newMenuData)

        // Persist change if it came from system config
        if (systemData?.admin_menu_config) {
          await updateData({ admin_menu_config: newMenuData })
        }
      }
    }
    setDraggedItem(null)
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          {systemData?.logo_url ? (
            <img src={systemData.logo_url} alt="Logo" className="h-8 w-auto object-contain" />
          ) : (
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
              SW
            </div>
          )}
          {state === 'expanded' && (
            <span className="font-semibold text-lg truncate">
              {systemData?.platform_name || 'Admin Dashboard'}
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {(menuData || []).map((group, groupIdx) => (
          <SidebarGroup key={groupIdx}>
            <SidebarGroupLabel>{group?.title || 'Menu'}</SidebarGroupLabel>
            <SidebarMenu>
              {(group?.items || []).map((item: any, itemIdx: number) => {
                const isActive = location.pathname === item?.url
                const hasSubItems = Array.isArray(item?.subitems) && item.subitems.length > 0
                const isSubItemActive =
                  hasSubItems && item.subitems.some((s: any) => s?.url === location.pathname)

                return (
                  <SidebarMenuItem key={itemIdx}>
                    {hasSubItems ? (
                      <Collapsible defaultOpen={isSubItemActive} className="group/collapsible">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item?.title}>
                            <IconRenderer iconName={item?.icon} />
                            <span>{item?.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {(item.subitems || []).map((subitem: any, subIdx: number) => (
                              <SidebarMenuSubItem
                                key={subIdx}
                                draggable
                                onDragStart={(e) => handleDragStart(e, groupIdx, itemIdx, subIdx)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, groupIdx, itemIdx, subIdx)}
                                className="cursor-grab active:cursor-grabbing relative flex items-center group/subitem"
                              >
                                <GripVertical className="h-3 w-3 mr-1 opacity-0 group-hover/subitem:opacity-50 transition-opacity absolute -left-4" />
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={location.pathname === subitem?.url}
                                >
                                  <Link to={subitem?.url || '#'}>
                                    <span>{subitem?.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item?.title}>
                        <Link to={item?.url || '#'}>
                          <IconRenderer iconName={item?.icon} />
                          <span>{item?.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboards</span>
                  </div>
                  <ChevronUp className="h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuLabel>Selecione o Dashboard</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(dashboards || []).map((dashboard: any, idx: number) => (
                  <DropdownMenuItem key={idx} asChild>
                    <Link to={dashboard?.url || '#'}>{dashboard?.title}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.user_metadata?.avatar_url}
                      alt={user?.user_metadata?.name || 'User'}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.user_metadata?.name?.substring(0, 2).toUpperCase() || 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.user_metadata?.name || user?.email}
                    </span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
