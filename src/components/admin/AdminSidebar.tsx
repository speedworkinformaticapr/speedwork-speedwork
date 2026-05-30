import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { useSystemData } from '@/hooks/use-system-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

type MenuItem = {
  id: string
  title: string
  icon: string
  submenus: {
    id: string
    title: string
    path: string
  }[]
}

const defaultMenu: MenuItem[] = [
  {
    id: 'gestao',
    title: 'Gestão',
    icon: 'Briefcase',
    submenus: [
      { id: 'users', title: 'Usuários', path: '/admin/users' },
      {
        id: 'athlete-attributes',
        title: 'Atributos de Atletas',
        path: '/admin/athlete-attributes',
      },
      { id: 'athlete-evaluations', title: 'Avaliações', path: '/admin/athlete-evaluations' },
      { id: 'athlete-scouting', title: 'Scouting', path: '/admin/athlete-scouting' },
      { id: 'athlete-categories', title: 'Categorias', path: '/admin/athlete-categories' },
      { id: 'courses', title: 'Cursos', path: '/admin/courses' },
      { id: 'tournaments', title: 'Torneios', path: '/admin/tournaments' },
      { id: 'ranking', title: 'Rankings', path: '/admin/ranking' },
      { id: 'rules', title: 'Regras', path: '/admin/rules' },
    ],
  },
  {
    id: 'comercial',
    title: 'Comercial',
    icon: 'Store',
    submenus: [
      {
        id: 'dashboard-comercial',
        title: 'Dashboard Comercial',
        path: '/admin/commercial/dashboard',
      },
      { id: 'quotes', title: 'Orçamentos', path: '/admin/quotes' },
      { id: 'pedidos', title: 'Pedidos', path: '/admin/commercial/pedidos' },
      { id: 'contratos', title: 'Contratos', path: '/admin/commercial/contratos' },
      { id: 'services', title: 'Serviços', path: '/admin/services' },
      { id: 'appointments', title: 'Agendamentos', path: '/admin/appointments' },
    ],
  },
  {
    id: 'financeiro',
    title: 'Financeiro',
    icon: 'LineChart',
    submenus: [
      {
        id: 'dashboard-financeiro',
        title: 'Dashboard Financeiro',
        path: '/admin/financial/dashboard',
      },
      {
        id: 'chart-of-accounts',
        title: 'Plano de Contas',
        path: '/admin/financial/chart-of-accounts',
      },
      { id: 'categories-financeiro', title: 'Categorias', path: '/admin/financial/categories' },
      { id: 'payments', title: 'Pagamentos', path: '/admin/financial/payments' },
      { id: 'partners', title: 'Parceiros', path: '/admin/financial/partners' },
      { id: 'billing-logs', title: 'Logs de Faturamento', path: '/admin/financial/billing-logs' },
      {
        id: 'stripe-config',
        title: 'Configurações Stripe',
        path: '/admin/financial/stripe-config',
      },
    ],
  },
  {
    id: 'ecommerce',
    title: 'E-commerce',
    icon: 'ShoppingCart',
    submenus: [
      { id: 'groups', title: 'Grupos', path: '/admin/ecommerce/groups' },
      { id: 'products', title: 'Produtos', path: '/admin/ecommerce/products' },
      { id: 'store-editor', title: 'Editor da Loja', path: '/admin/ecommerce/store-editor' },
      {
        id: 'abandoned-carts',
        title: 'Carrinhos Abandonados',
        path: '/admin/ecommerce/abandoned-carts',
      },
      { id: 'logistics', title: 'Logística', path: '/admin/ecommerce/logistics' },
      { id: 'orders-ecommerce', title: 'Pedidos', path: '/admin/ecommerce/orders' },
    ],
  },
  {
    id: 'configuracoes',
    title: 'Configurações',
    icon: 'Settings',
    submenus: [
      { id: 'system-data', title: 'Dados do Sistema', path: '/admin/settings/system-data' },
      { id: 'maintenance', title: 'Manutenção', path: '/admin/settings/maintenance' },
      { id: 'plan-services', title: 'Planos/Serviços', path: '/admin/settings/plan-services' },
      { id: 'sla-types', title: 'Tipos de SLA', path: '/admin/settings/sla-types' },
      { id: 'media', title: 'Mídia', path: '/admin/settings/media' },
      { id: 'analytics', title: 'Analytics', path: '/admin/settings/analytics' },
    ],
  },
]

export function AdminSidebar() {
  const location = useLocation()
  const { data: systemData, updateData } = useSystemData()
  const [isEditing, setIsEditing] = useState(false)
  const [menuData, setMenuData] = useState<MenuItem[]>(defaultMenu)
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const [draggedGroup, setDraggedGroup] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<{ groupId: string; itemId: string } | null>(null)

  useEffect(() => {
    if (systemData?.admin_menu_config) {
      setMenuData(systemData.admin_menu_config)
    }
  }, [systemData?.admin_menu_config])

  useEffect(() => {
    if (!isEditing && !openGroup) {
      const activeGroup = menuData.find((g) => g.submenus.some((s) => s.path === location.pathname))
      if (activeGroup) setOpenGroup(activeGroup.id)
    }
  }, [location.pathname, menuData, isEditing, openGroup])

  const handleSave = async () => {
    await updateData({ admin_menu_config: menuData })
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (systemData?.admin_menu_config) {
      setMenuData(systemData.admin_menu_config)
    } else {
      setMenuData(defaultMenu)
    }
    setIsEditing(false)
  }

  const renderIcon = (name: string) => {
    const Icon = (Icons as any)[name]
    return Icon ? (
      <Icon className="w-4 h-4 shrink-0" />
    ) : (
      <Icons.Circle className="w-4 h-4 shrink-0" />
    )
  }

  const onGroupDragStart = (e: React.DragEvent, groupId: string) => {
    if (!isEditing) return
    setDraggedGroup(groupId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onGroupDragOver = (e: React.DragEvent) => {
    if (!isEditing || !draggedGroup) return
    e.preventDefault()
  }

  const onGroupDrop = (e: React.DragEvent, targetGroupId: string) => {
    if (!isEditing || !draggedGroup || draggedGroup === targetGroupId) return
    e.preventDefault()

    const newMenu = [...menuData]
    const draggedIdx = newMenu.findIndex((g) => g.id === draggedGroup)
    const targetIdx = newMenu.findIndex((g) => g.id === targetGroupId)

    const [removed] = newMenu.splice(draggedIdx, 1)
    newMenu.splice(targetIdx, 0, removed)

    setMenuData(newMenu)
    setDraggedGroup(null)
  }

  const onItemDragStart = (e: React.DragEvent, groupId: string, itemId: string) => {
    if (!isEditing) return
    e.stopPropagation()
    setDraggedItem({ groupId, itemId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const onItemDragOver = (e: React.DragEvent) => {
    if (!isEditing || !draggedItem) return
    e.preventDefault()
  }

  const onItemDrop = (e: React.DragEvent, targetGroupId: string, targetItemId: string) => {
    if (!isEditing || !draggedItem) return
    e.preventDefault()
    e.stopPropagation()

    if (draggedItem.groupId !== targetGroupId || draggedItem.itemId === targetItemId) return

    const newMenu = [...menuData]
    const groupIdx = newMenu.findIndex((g) => g.id === targetGroupId)
    if (groupIdx === -1) return

    const submenus = [...newMenu[groupIdx].submenus]
    const draggedIdx = submenus.findIndex((i) => i.id === draggedItem.itemId)
    const targetIdx = submenus.findIndex((i) => i.id === targetItemId)

    const [removed] = submenus.splice(draggedIdx, 1)
    submenus.splice(targetIdx, 0, removed)

    newMenu[groupIdx].submenus = submenus
    setMenuData(newMenu)
    setDraggedItem(null)
  }

  const updateGroupTitle = (groupId: string, newTitle: string) => {
    setMenuData((prev) => prev.map((g) => (g.id === groupId ? { ...g, title: newTitle } : g)))
  }

  const updateItemTitle = (groupId: string, itemId: string, newTitle: string) => {
    setMenuData((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            submenus: g.submenus.map((i) => (i.id === itemId ? { ...i, title: newTitle } : i)),
          }
        }
        return g
      }),
    )
  }

  return (
    <Sidebar className="border-r shadow-sm">
      <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b">
        <span className="font-bold text-lg text-primary tracking-tight">Painel Admin</span>
      </SidebarHeader>
      <SidebarContent className="p-2 gap-1 overflow-y-auto hidden-scrollbar">
        <SidebarMenu>
          {menuData.map((group) => (
            <Collapsible
              key={group.id}
              open={isEditing ? true : openGroup === group.id}
              onOpenChange={(isOpen) => {
                if (!isEditing) setOpenGroup(isOpen ? group.id : null)
              }}
              className="group/collapsible"
              asChild
            >
              <SidebarMenuItem
                draggable={isEditing}
                onDragStart={(e) => onGroupDragStart(e, group.id)}
                onDragOver={onGroupDragOver}
                onDrop={(e) => onGroupDrop(e, group.id)}
                className={cn(
                  isEditing &&
                    'border border-transparent hover:border-border rounded-md transition-colors',
                )}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={group.title}
                    className={cn(
                      'h-10 cursor-pointer',
                      openGroup === group.id &&
                        !isEditing &&
                        'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                    )}
                  >
                    {isEditing && (
                      <Icons.GripVertical className="w-4 h-4 cursor-grab text-muted-foreground shrink-0" />
                    )}
                    {!isEditing && renderIcon(group.icon)}
                    {isEditing ? (
                      <Input
                        value={group.title}
                        onChange={(e) => updateGroupTitle(group.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 px-2 text-sm ml-1 flex-1"
                      />
                    ) : (
                      <span className="flex-1 truncate select-none">{group.title}</span>
                    )}
                    {!isEditing && (
                      <Icons.ChevronDown className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent className="pl-4 pr-0 py-1">
                  <SidebarMenuSub className="m-0 border-l border-border/50">
                    {group.submenus.map((item) => (
                      <SidebarMenuSubItem
                        key={item.id}
                        draggable={isEditing}
                        onDragStart={(e) => onItemDragStart(e, group.id, item.id)}
                        onDragOver={onItemDragOver}
                        onDrop={(e) => onItemDrop(e, group.id, item.id)}
                        className={cn(
                          isEditing && 'pl-2 hover:bg-muted/50 rounded-md transition-colors',
                        )}
                      >
                        {isEditing ? (
                          <div className="flex items-center w-full gap-2 py-1 pr-2">
                            <Icons.GripVertical className="w-4 h-4 cursor-grab text-muted-foreground shrink-0" />
                            <Input
                              value={item.title}
                              onChange={(e) => updateItemTitle(group.id, item.id, e.target.value)}
                              className="h-6 px-2 text-xs flex-1"
                            />
                          </div>
                        ) : (
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === item.path}
                            className={cn(
                              'text-sm h-8 cursor-pointer transition-colors',
                              location.pathname === item.path && 'font-medium text-primary',
                            )}
                          >
                            <Link to={item.path}>{item.title}</Link>
                          </SidebarMenuSubButton>
                        )}
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t bg-sidebar">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="default" className="w-full" onClick={handleSave}>
              <Icons.Save className="w-4 h-4 mr-2" /> Salvar
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={handleCancel}>
              <Icons.X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
            <Icons.Edit3 className="w-4 h-4 mr-2" /> Editar Menu
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
