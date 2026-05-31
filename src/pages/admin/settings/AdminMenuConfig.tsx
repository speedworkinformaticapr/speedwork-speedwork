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
import { Save, ArrowUp, ArrowDown, Trash2, Plus, GripVertical } from 'lucide-react'
import { DEFAULT_MENU_CONFIG } from '@/lib/menu-constants'

export default function AdminMenuConfig() {
  const { data, updateData } = useSystemData()
  const [config, setConfig] = useState<any[]>([])

  useEffect(() => {
    const activeConfig = (data?.admin_menu_config as any[])?.length
      ? data.admin_menu_config
      : DEFAULT_MENU_CONFIG
    setConfig(JSON.parse(JSON.stringify(activeConfig)))
  }, [data])

  const move = (arr: any[], idx: number, dir: 'up' | 'down') => {
    if (dir === 'up' && idx > 0) [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
    if (dir === 'down' && idx < arr.length - 1) [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]]
    return [...arr]
  }

  const updateGroup = (gIdx: number, field: string, val: any) => {
    const newConfig = [...config]
    newConfig[gIdx][field] = val
    setConfig(newConfig)
  }

  const updateItem = (gIdx: number, iIdx: number, field: string, val: any) => {
    const newConfig = [...config]
    newConfig[gIdx].items[iIdx][field] = val
    setConfig(newConfig)
  }

  const assignGroup = (gIdx: number, iIdx: number, newGroupId: string) => {
    if (config[gIdx].id === newGroupId) return
    const newConfig = [...config]
    const item = newConfig[gIdx].items.splice(iIdx, 1)[0]
    const targetGroup = newConfig.find((g) => g.id === newGroupId)
    if (targetGroup) targetGroup.items.push(item)
    setConfig(newConfig)
  }

  const addGroup = () => {
    setConfig([
      ...config,
      { id: `grp-${Date.now()}`, label: 'Novo Grupo', icon: 'Folder', items: [] },
    ])
  }

  const addItem = (gIdx: number) => {
    const newConfig = [...config]
    newConfig[gIdx].items.push({ id: `itm-${Date.now()}`, label: 'Novo Item', path: '/admin/novo' })
    setConfig(newConfig)
  }

  const removeGroup = (gIdx: number) => setConfig(config.filter((_, i) => i !== gIdx))
  const removeItem = (gIdx: number, iIdx: number) => {
    const newConfig = [...config]
    newConfig[gIdx].items.splice(iIdx, 1)
    setConfig(newConfig)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Menus</h1>
          <p className="text-muted-foreground mt-1">
            Organize o menu lateral do painel administrativo.
          </p>
        </div>
        <Button onClick={() => updateData({ admin_menu_config: config })} className="gap-2">
          <Save className="w-4 h-4" /> Salvar Alterações
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Grupos de Navegação</CardTitle>
            <CardDescription>Crie e ordene os grupos principais.</CardDescription>
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
                <div className="flex items-center gap-4 py-2 border-b">
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
                    className="w-48 font-medium"
                  />
                  <Input
                    value={group.icon}
                    onChange={(e) => updateGroup(gIdx, 'icon', e.target.value)}
                    className="w-40"
                    placeholder="Lucide Icon (ex: Trophy)"
                  />
                  <AccordionTrigger className="flex-1 justify-end hover:no-underline py-2" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 ml-2"
                    onClick={() => removeGroup(gIdx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <AccordionContent className="pt-4 space-y-3 pl-10">
                  {group.items?.map((item: any, iIdx: number) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-background p-2 rounded-md border shadow-sm"
                    >
                      <div className="flex flex-col gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => {
                            const nc = [...config]
                            nc[gIdx].items = move(nc[gIdx].items, iIdx, 'up')
                            setConfig(nc)
                          }}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => {
                            const nc = [...config]
                            nc[gIdx].items = move(nc[gIdx].items, iIdx, 'down')
                            setConfig(nc)
                          }}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Input
                        value={item.label}
                        onChange={(e) => updateItem(gIdx, iIdx, 'label', e.target.value)}
                        className="w-1/4 h-8"
                        placeholder="Nome"
                      />
                      <Input
                        value={item.path}
                        onChange={(e) => updateItem(gIdx, iIdx, 'path', e.target.value)}
                        className="flex-1 h-8"
                        placeholder="Caminho (/admin/...)"
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeItem(gIdx, iIdx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
