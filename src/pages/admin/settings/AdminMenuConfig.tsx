import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, ArrowUp, ArrowDown, Plus, GripVertical } from 'lucide-react'
import {
  DEFAULT_MENU_CONFIG,
  normalizeMenuConfig,
  type MenuConfig,
  type MenuSubmenu,
} from '@/lib/menu-constants'

export default function AdminMenuConfig() {
  const { data, updateData } = useSystemData()
  const [config, setConfig] = useState<MenuConfig[]>([])

  useEffect(() => {
    const raw = data?.admin_menu_config as any[] | undefined
    const activeConfig = raw?.length ? normalizeMenuConfig(raw) : DEFAULT_MENU_CONFIG
    setConfig(JSON.parse(JSON.stringify(activeConfig)))
  }, [data])

  const move = <T,>(arr: T[], idx: number, dir: 'up' | 'down'): T[] => {
    const next = [...arr]
    if (dir === 'up' && idx > 0) [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    if (dir === 'down' && idx < next.length - 1)
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]
    return next
  }

  const updateGroup = (gIdx: number, field: keyof MenuConfig, val: any) => {
    setConfig((prev) => {
      const next = [...prev]
      ;(next[gIdx] as any)[field] = val
      return next
    })
  }

  const updateItem = (gIdx: number, iIdx: number, field: keyof MenuSubmenu, val: any) => {
    setConfig((prev) => {
      const next = [...prev]
      ;(next[gIdx].submenus![iIdx] as any)[field] = val
      return next
    })
  }

  const assignGroup = (gIdx: number, iIdx: number, newGroupId: string) => {
    if (config[gIdx].id === newGroupId) return
    setConfig((prev) => {
      const next: MenuConfig[] = JSON.parse(JSON.stringify(prev))
      const item = next[gIdx].submenus!.splice(iIdx, 1)[0]
      const target = next.find((g) => g.id === newGroupId)
      if (target) {
        target.submenus = target.submenus || []
        target.submenus.push(item)
      }
      return next
    })
  }

  const addGroup = () => {
    setConfig((prev) => [
      ...prev,
      { id: `grp-${Date.now()}`, label: 'Novo Grupo', icon: 'Folder', submenus: [] },
    ])
  }

  const addItem = (gIdx: number) => {
    setConfig((prev) => {
      const next = [...prev]
      next[gIdx].submenus = next[gIdx].submenus || []
      next[gIdx].submenus!.push({ id: `itm-${Date.now()}`, label: 'Novo Item', url: '/admin/novo' })
      return next
    })
  }

  const handleSave = () => updateData({ admin_menu_config: config })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Menus</h1>
          <p className="text-muted-foreground mt-1">
            Organize o menu lateral do painel administrativo.
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" /> Salvar Alterações
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Grupos de Navegação</CardTitle>
            <CardDescription>Edite e ordene os grupos principais.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addGroup}>
            <Plus className="w-4 h-4 mr-2" /> Grupo
          </Button>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-4">
            {config.map((group, gIdx) => (
              <AccordionItem
                key={group.id}
                value={group.id}
                className="border rounded-lg px-4 bg-muted/20"
              >
                <div className="flex items-center gap-3 py-2 border-b flex-wrap">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setConfig(move(config, gIdx, 'up'))}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setConfig(move(config, gIdx, 'down'))}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    value={group.label}
                    onChange={(e) => updateGroup(gIdx, 'label', e.target.value)}
                    className="w-44 font-medium"
                    placeholder="Nome do Grupo"
                  />
                  <Input
                    value={group.icon || ''}
                    onChange={(e) => updateGroup(gIdx, 'icon', e.target.value)}
                    className="w-36"
                    placeholder="Ícone (ex: Trophy)"
                  />
                  <AccordionTrigger className="flex-1 justify-end hover:no-underline py-2 min-w-[40px]" />
                </div>
                <AccordionContent className="pt-4 space-y-3 pl-10">
                  {group.submenus?.map((item: MenuSubmenu, iIdx: number) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-background p-2 rounded-md border shadow-sm flex-wrap"
                    >
                      <div className="flex flex-col gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() =>
                            setConfig((prev) => {
                              const next = [...prev]
                              next[gIdx].submenus = move(next[gIdx].submenus!, iIdx, 'up')
                              return next
                            })
                          }
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() =>
                            setConfig((prev) => {
                              const next = [...prev]
                              next[gIdx].submenus = move(next[gIdx].submenus!, iIdx, 'down')
                              return next
                            })
                          }
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Input
                        value={item.label}
                        onChange={(e) => updateItem(gIdx, iIdx, 'label', e.target.value)}
                        className="w-36 h-8"
                        placeholder="Nome"
                      />
                      <Input
                        value={item.url}
                        onChange={(e) => updateItem(gIdx, iIdx, 'url', e.target.value)}
                        className="flex-1 min-w-[180px] h-8"
                        placeholder="URL (/admin/...)"
                      />
                      <Select
                        value={group.id}
                        onValueChange={(val) => assignGroup(gIdx, iIdx, val)}
                      >
                        <SelectTrigger className="w-40 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config.map((g) => (
                            <SelectItem key={g.id} value={g.id}>
                              {g.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => addItem(gIdx)}
                    className="mt-2 text-xs h-7"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Novo Item
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
