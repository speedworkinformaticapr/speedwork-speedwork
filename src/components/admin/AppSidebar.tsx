import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useSystemData } from '@/hooks/use-system-data'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  Edit2,
  Check,
  LogOut,
  ChevronDown,
  Monitor,
  User,
  Shield,
  Home,
  GripVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEFAULT_MENU, ICON_MAP, type MenuGroup, type MenuItem } from '@/lib/constants/menu'

export function AppSidebar() {
  const { data: systemData, updateData } = useSystemData()
  const { signOut } = useAuth()
  const location = useLocation()

  const [isEditing, setIsEditing] = useState(false)
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>(DEFAULT_MENU)

  const [draggedItem, setDraggedItem] = useState<{ item: MenuItem; sourceGroupId: string } | null>(
    null,
  )
  const [dragOverInfo, setDragOverInfo] = useState<{ groupId: string; index: number } | null>(null)

  useEffect(() => {
    if (
      systemData?.admin_menu_config &&
      Array.isArray(systemData.admin_menu_config) &&
      systemData.admin_menu_config.length > 0
    ) {
      setMenuGroups(systemData.admin_menu_config as MenuGroup[])
    }
  }, [systemData?.admin_menu_config])

  const handleSaveMenu = async () => {
    await updateData({ admin_menu_config: menuGroups })
    setIsEditing(false)
  }

  const handleDragStart = (e: React.DragEvent, item: MenuItem, sourceGroupId: string) => {
    setDraggedItem({ item, sourceGroupId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, groupId: string, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverInfo({ groupId, index })
  }

  const handleDrop = (e: React.DragEvent, targetGroupId: string, targetIndex: number) => {
    e.preventDefault()
    if (!draggedItem) return

    const { item, sourceGroupId } = draggedItem

    if (sourceGroupId === targetGroupId && dragOverInfo?.index === targetIndex) {
      setDraggedItem(null)
      setDragOverInfo(null)
      return
    }

    setMenuGroups((prev) => {
      const newGroups = JSON.parse(JSON.stringify(prev)) as MenuGroup[]
      const sourceGroupIndex = newGroups.findIndex((g) => g.id === sourceGroupId)
      const targetGroupIndex = newGroups.findIndex((g) => g.id === targetGroupId)

      if (sourceGroupIndex === -1 || targetGroupIndex === -1) return prev

      const sourceItems = newGroups[sourceGroupIndex].items
      const targetItems =
        sourceGroupId === targetGroupId ? sourceItems : newGroups[targetGroupIndex].items

      const itemIndex = sourceItems.findIndex((i) => i.id === item.id)
      if (itemIndex > -1) {
        sourceItems.splice(itemIndex, 1)
      }

      let insertIndex = targetIndex
      if (sourceGroupId === targetGroupId && itemIndex < targetIndex) {
        insertIndex -= 1
      }

      targetItems.splice(insertIndex, 0, item)
      return newGroups
    })

    setDraggedItem(null)
    setDragOverInfo(null)
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between flex-row p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          {systemData?.logo_url ? (
            <img src={systemData.logo_url} alt="Logo" className="h-8" />
          ) : (
            <span className="font-bold text-lg">Speedwork</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (isEditing ? handleSaveMenu() : setIsEditing(true))}
          title={isEditing ? 'Salvar Menu' : 'Editar Menu'}
          className={cn(
            'transition-colors',
            isEditing &&
              'bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700',
          )}
        >
          {isEditing ? <Check className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
        </Button>
      </SidebarHeader>

      <SidebarContent className="overflow-auto pb-20">
        {menuGroups.map((group) => {
          const Icon = group.icon && ICON_MAP[group.icon] ? ICON_MAP[group.icon] : LayoutDashboard

          return (
            <SidebarGroup key={group.id}>
              <SidebarGroupLabel className="flex items-center gap-2 px-4 py-2 text-sm font-semibold">
                <Icon className="h-4 w-4" /> {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item, idx) => {
                    const isActive = location.pathname === item.path
                    const isDragOver =
                      dragOverInfo?.groupId === group.id && dragOverInfo?.index === idx

                    return (
                      <div key={item.id} className="relative">
                        {isEditing && isDragOver && (
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-primary z-10" />
                        )}
                        <SidebarMenuItem
                          draggable={isEditing}
                          onDragStart={(e) => handleDragStart(e, item, group.id)}
                          onDragOver={(e) => handleDragOver(e, group.id, idx)}
                          onDrop={(e) => handleDrop(e, group.id, idx)}
                          className={cn(
                            'transition-colors',
                            isEditing && 'cursor-grab hover:bg-sidebar-accent rounded-md',
                          )}
                        >
                          {isEditing ? (
                            <SidebarMenuButton asChild>
                              <div className="flex items-center gap-2 w-full select-none">
                                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </div>
                            </SidebarMenuButton>
                          ) : (
                            <SidebarMenuButton asChild isActive={isActive}>
                              <Link to={item.path}>{item.label}</Link>
                            </SidebarMenuButton>
                          )}
                        </SidebarMenuItem>
                      </div>
                    )
                  })}
                  {isEditing && (
                    <div
                      className={cn(
                        'h-6 w-full rounded-md border-2 border-dashed border-transparent transition-colors mt-1 flex items-center justify-center text-xs text-muted-foreground',
                        dragOverInfo?.groupId === group.id &&
                          dragOverInfo?.index === group.items.length &&
                          'border-primary bg-primary/10',
                      )}
                      onDragOver={(e) => handleDragOver(e, group.id, group.items.length)}
                      onDrop={(e) => handleDrop(e, group.id, group.items.length)}
                    >
                      Mover para o fim
                    </div>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border mt-auto p-4 flex flex-col gap-3 bg-sidebar">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              variant="outline"
              className="w-full justify-between border-sidebar-border h-10"
            >
              <span className="flex items-center gap-2 font-medium">
                <LayoutDashboard className="h-4 w-4" /> Dashboards
              </span>
              <ChevronDown className="h-4 w-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-[calc(var(--sidebar-width)-2rem)] mb-2"
          >
            <DropdownMenuItem asChild>
              <Link to="/admin/dashboard" className="flex w-full items-center cursor-pointer py-2">
                <Shield className="mr-2 h-4 w-4" /> Administrador
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/dashboard" className="flex w-full items-center cursor-pointer py-2">
                <Monitor className="mr-2 h-4 w-4" /> Master
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/client/dashboard" className="flex w-full items-center cursor-pointer py-2">
                <User className="mr-2 h-4 w-4" /> Usuário
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/club/dashboard" className="flex w-full items-center cursor-pointer py-2">
                <Home className="mr-2 h-4 w-4" /> Do Clube
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <SidebarMenuButton
          variant="default"
          onClick={signOut}
          className="w-full justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors h-10 font-semibold"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
