import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useSystemData } from '@/hooks/use-system-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronRight, GripVertical, Check, X, PanelLeft, Edit } from 'lucide-react'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEFAULT_MENU_CONFIG } from '@/lib/menu-constants'

const defaultMenuConfig = DEFAULT_MENU_CONFIG

export function AdminSidebar() {
  const { data, updateData } = useSystemData()
  const { toggleSidebar, state } = useSidebar()
  const location = useLocation()

  const [menuConfig, setMenuConfig] = useState(defaultMenuConfig)
  const [isEditing, setIsEditing] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<{
    parentIndex: number | null
    index: number
  } | null>(null)

  useEffect(() => {
    if (
      data?.admin_menu_config &&
      Array.isArray(data.admin_menu_config) &&
      data.admin_menu_config.length > 0
    ) {
      setMenuConfig(data.admin_menu_config as any)
    } else {
      setMenuConfig(defaultMenuConfig)
    }
  }, [data?.admin_menu_config])

  useEffect(() => {
    if (isEditing) return
    const parent = menuConfig.find(
      (p) => p.url === location.pathname || p.submenus?.some((s) => s.url === location.pathname),
    )
    if (parent && parent.submenus) {
      setOpenMenuId(parent.id)
    } else if (parent && !parent.submenus) {
      setOpenMenuId(null)
    }
  }, [location.pathname, menuConfig, isEditing])

  const handleDragStart = (e: React.DragEvent, parentIndex: number | null, index: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ parentIndex, index }))
    setDraggedItem({ parentIndex, index })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (
    e: React.DragEvent,
    targetParentIndex: number | null,
    targetIndex: number,
  ) => {
    e.preventDefault()
    try {
      const { parentIndex, index } = JSON.parse(e.dataTransfer.getData('application/json'))
      if (parentIndex !== targetParentIndex) return

      const newConfig = [...menuConfig]
      if (parentIndex === null) {
        const [removed] = newConfig.splice(index, 1)
        newConfig.splice(targetIndex, 0, removed)
      } else {
        const parent = { ...newConfig[parentIndex] }
        if (!parent.submenus) return
        const submenus = [...parent.submenus]
        const [removed] = submenus.splice(index, 1)
        submenus.splice(targetIndex, 0, removed)
        parent.submenus = submenus
        newConfig[parentIndex] = parent
      }
      setMenuConfig(newConfig)
    } catch {
      /* intentionally ignored */
    }
    setDraggedItem(null)
  }

  const updateLabel = (parentIndex: number | null, index: number, newLabel: string) => {
    const newConfig = [...menuConfig]
    if (parentIndex === null) {
      newConfig[index].label = newLabel
    } else {
      const parent = { ...newConfig[parentIndex] }
      if (parent.submenus) {
        parent.submenus[index].label = newLabel
      }
      newConfig[parentIndex] = parent
    }
    setMenuConfig(newConfig)
  }

  const handleSave = async () => {
    await updateData({ admin_menu_config: menuConfig })
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (
      data?.admin_menu_config &&
      Array.isArray(data.admin_menu_config) &&
      data.admin_menu_config.length > 0
    ) {
      setMenuConfig(data.admin_menu_config as any)
    } else {
      setMenuConfig(defaultMenuConfig)
    }
    setIsEditing(false)
  }

  const renderIcon = (iconName: string) => {
    const IconCmp = (Icons as any)[iconName] || Icons.Circle
    return <IconCmp className="size-4 shrink-0" />
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b py-3">
        <div className="flex items-center justify-between px-2">
          <div
            className="flex items-center gap-2 font-semibold cursor-pointer w-full overflow-hidden hover:opacity-80 transition-opacity"
            onClick={toggleSidebar}
            title="Expandir/Recolher Sidebar"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PanelLeft className="size-5" />
            </div>
            {state === 'expanded' && (
              <span className="truncate">{data?.platform_name || 'Admin'}</span>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="mt-4 px-2">
          {menuConfig.map((item, index) => {
            const isActive =
              item.url === location.pathname ||
              item.submenus?.some((s) => s.url === location.pathname)
            const isOpen = openMenuId === item.id || isEditing

            return (
              <SidebarMenuItem
                key={item.id}
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, null, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, null, index)}
                className={cn(
                  isEditing &&
                    'mb-1 rounded border border-dashed border-transparent hover:border-border transition-colors',
                )}
              >
                {item.submenus ? (
                  <Collapsible
                    open={isOpen}
                    onOpenChange={(open) => {
                      if (!isEditing) setOpenMenuId(open ? item.id : null)
                    }}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={isActive && !isOpen}
                        className={cn(isEditing && 'cursor-move')}
                        asChild={isEditing}
                      >
                        {isEditing ? (
                          <div className="flex items-center w-full">
                            <GripVertical className="mr-1 size-4 shrink-0 opacity-50" />
                            {item.icon && renderIcon(item.icon)}
                            <Input
                              value={item.label}
                              onChange={(e) => updateLabel(null, index, e.target.value)}
                              className="h-6 px-1 text-sm bg-background ml-2 flex-1 min-w-0"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                            />
                          </div>
                        ) : (
                          <>
                            {item.icon && renderIcon(item.icon)}
                            <span>{item.label}</span>
                            <ChevronRight
                              className={cn(
                                'ml-auto size-4 transition-transform duration-200',
                                isOpen && 'rotate-90',
                              )}
                            />
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className={cn(isEditing && 'mr-0 pr-0')}>
                        {item.submenus.map((sub, subIndex) => (
                          <SidebarMenuSubItem
                            key={sub.id}
                            draggable={isEditing}
                            onDragStart={(e) => handleDragStart(e, index, subIndex)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index, subIndex)}
                            className={cn(isEditing && 'my-1')}
                          >
                            <SidebarMenuSubButton
                              isActive={location.pathname === sub.url}
                              className={cn(
                                isEditing &&
                                  'cursor-move border border-dashed border-transparent hover:border-border',
                              )}
                              asChild={true}
                            >
                              {isEditing ? (
                                <div className="flex items-center w-full">
                                  <GripVertical className="mr-1 size-3 shrink-0 opacity-50" />
                                  <Input
                                    value={sub.label}
                                    onChange={(e) => updateLabel(index, subIndex, e.target.value)}
                                    className="h-6 px-1 text-xs bg-background flex-1 min-w-0"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                    }}
                                  />
                                </div>
                              ) : (
                                <Link to={sub.url!}>
                                  <span>{sub.label}</span>
                                </Link>
                              )}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={isActive}
                    className={cn(isEditing && 'cursor-move')}
                    asChild={isEditing || !item.submenus}
                  >
                    {isEditing ? (
                      <div className="flex items-center w-full">
                        <GripVertical className="mr-1 size-4 shrink-0 opacity-50" />
                        {item.icon && renderIcon(item.icon)}
                        <Input
                          value={item.label}
                          onChange={(e) => updateLabel(null, index, e.target.value)}
                          className="h-6 px-1 text-sm bg-background ml-2 flex-1 min-w-0"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                        />
                      </div>
                    ) : (
                      <Link to={item.url!}>
                        {item.icon && renderIcon(item.icon)}
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <Button onClick={handleSave} size="sm" className="w-full justify-start">
              <Check className="mr-2 size-4" /> Salvar
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <X className="mr-2 size-4" /> Cancelar
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <Edit className="mr-2 size-4" />
            Editar Menu
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
