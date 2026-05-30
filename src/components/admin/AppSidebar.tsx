import React, { useState, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
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
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  PieChart,
  DollarSign,
  Settings,
  Users,
  Calendar,
  MessageSquare,
  Mail,
  Image as ImageIcon,
  BookOpen,
  GripVertical,
  ChevronsUpDown,
  Briefcase,
  ShieldCheck,
  User,
  Building,
  MenuSquare,
  Map,
  Trophy,
  Star,
  Ruler,
} from 'lucide-react'

const IconMap: Record<string, any> = {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  PieChart,
  DollarSign,
  Settings,
  Users,
  Calendar,
  MessageSquare,
  Mail,
  ImageIcon,
  BookOpen,
  MenuSquare,
  Map,
  Trophy,
  Star,
  Ruler,
}

const defaultMenu = [
  {
    id: 'group-commercial',
    title: 'Comercial',
    items: [
      {
        id: 'item-com-dash',
        title: 'Dashboard',
        url: '/admin/commercial/dashboard',
        icon: 'LayoutDashboard',
      },
      {
        id: 'item-com-ped',
        title: 'Pedidos',
        url: '/admin/commercial/pedidos',
        icon: 'ShoppingCart',
      },
      {
        id: 'item-com-con',
        title: 'Contratos',
        url: '/admin/commercial/contratos',
        icon: 'FileText',
      },
    ],
  },
  {
    id: 'group-financial',
    title: 'Financeiro',
    items: [
      {
        id: 'item-fin-dash',
        title: 'Dashboard',
        url: '/admin/financial/dashboard',
        icon: 'PieChart',
      },
      {
        id: 'item-fin-pay',
        title: 'Pagamentos',
        url: '/admin/financial/payments',
        icon: 'DollarSign',
      },
      {
        id: 'item-fin-set',
        title: 'Configurações',
        url: '/admin/financial/settings',
        icon: 'Settings',
      },
    ],
  },
  {
    id: 'group-business',
    title: 'Negócio',
    items: [
      { id: 'item-bus-users', title: 'Usuários', url: '/admin/users', icon: 'Users' },
      { id: 'item-bus-courses', title: 'Campos', url: '/admin/courses', icon: 'Map' },
      { id: 'item-bus-tournaments', title: 'Torneios', url: '/admin/tournaments', icon: 'Trophy' },
      { id: 'item-bus-ranking', title: 'Ranking', url: '/admin/ranking', icon: 'Star' },
    ],
  },
  {
    id: 'group-system',
    title: 'Sistema',
    items: [
      { id: 'item-sys-pages', title: 'Páginas', url: '/admin/pages', icon: 'BookOpen' },
      { id: 'item-sys-blog', title: 'Blog', url: '/admin/blog', icon: 'FileText' },
    ],
  },
]

export function AppSidebar() {
  const { data, updateData } = useSystemData()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [menuData, setMenuData] = useState(defaultMenu)
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null)

  useEffect(() => {
    if (
      data?.admin_menu_config &&
      Array.isArray(data.admin_menu_config) &&
      data.admin_menu_config.length > 0
    ) {
      setMenuData(data.admin_menu_config as any)
    }
  }, [data?.admin_menu_config])

  const handleDragStart = (e: React.DragEvent, item: any, groupId: string) => {
    setDraggedItem(item)
    setDraggedGroup(groupId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetItem: any, targetGroupId: string) => {
    e.preventDefault()
    if (!draggedItem || !draggedGroup) return

    if (draggedItem.id === targetItem?.id) return

    const newMenuData = JSON.parse(JSON.stringify(menuData))

    const sourceGroupIndex = newMenuData.findIndex((g: any) => g.id === draggedGroup)
    if (sourceGroupIndex === -1) return
    const sourceItemIndex = newMenuData[sourceGroupIndex].items.findIndex(
      (i: any) => i.id === draggedItem.id,
    )
    if (sourceItemIndex === -1) return

    newMenuData[sourceGroupIndex].items.splice(sourceItemIndex, 1)

    const targetGroupIndex = newMenuData.findIndex((g: any) => g.id === targetGroupId)
    if (targetGroupIndex === -1) return

    if (targetItem) {
      const targetItemIndex = newMenuData[targetGroupIndex].items.findIndex(
        (i: any) => i.id === targetItem.id,
      )
      newMenuData[targetGroupIndex].items.splice(targetItemIndex, 0, draggedItem)
    } else {
      newMenuData[targetGroupIndex].items.push(draggedItem)
    }

    setMenuData(newMenuData)
    setDraggedItem(null)
    setDraggedGroup(null)

    await updateData({ admin_menu_config: newMenuData })
  }

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex flex-row items-center justify-start px-4 border-b border-sidebar-border overflow-hidden shrink-0">
        <div className="flex items-center gap-3 w-full">
          {data?.logo_url ? (
            <img src={data.logo_url} alt="Logo" className="h-8 max-w-[140px] object-contain" />
          ) : (
            <div className="size-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
              S
            </div>
          )}
          <span className="font-semibold truncate text-lg hidden md:block">
            {data?.platform_name || 'Speedwork'}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        {Array.isArray(menuData) &&
          menuData.map((group) => (
            <SidebarGroup
              key={group.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, null, group.id)}
              className="px-2 mb-4"
            >
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2 px-2">
                {group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {Array.isArray(group.items) &&
                    group.items.map((item: any) => {
                      const Icon = IconMap[item.icon] || LayoutDashboard
                      const isActive = location.pathname.startsWith(item.url)
                      return (
                        <SidebarMenuItem key={item.id}>
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, item, group.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, item, group.id)}
                            className="flex items-center w-full group/drag relative"
                          >
                            <div className="absolute -left-2 opacity-0 group-hover/drag:opacity-100 cursor-grab active:cursor-grabbing p-1">
                              <GripVertical className="size-3.5 text-muted-foreground" />
                            </div>
                            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                              <Link to={item.url} className="flex-1">
                                <Icon className="size-4" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </div>
                        </SidebarMenuItem>
                      )
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <User className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-semibold">
                  {user?.email?.split('@')[0] || 'Usuário'}
                </span>
                <span className="truncate text-xs text-muted-foreground">Dashboards</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-lg" align="end" side="top" sideOffset={8}>
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
              Alternar Visão
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/admin/dashboard')}
              className="cursor-pointer"
            >
              <ShieldCheck className="mr-2 size-4" />
              <span>Administrador</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/admin/dashboard')}
              className="cursor-pointer"
            >
              <Briefcase className="mr-2 size-4" />
              <span>Master</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              <User className="mr-2 size-4" />
              <span>Usuário</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/club/dashboard')}
              className="cursor-pointer"
            >
              <Building className="mr-2 size-4" />
              <span>Clube</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
