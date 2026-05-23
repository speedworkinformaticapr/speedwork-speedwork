import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Edit, Trash2, Plus, Search, Settings2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ServiceSettingsModal } from './ServiceSettingsModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Service = {
  id: string
  title: string
  description: string
  cost_value: number
  sale_value: number
  exec_time: string
  margin_time: number
  add_time: string
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('title_asc')
  const [formData, setFormData] = useState<Partial<Service>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('services' as any)
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar serviços.', variant: 'destructive' })
    } else {
      setServices(data || [])
    }
    setIsLoading(false)
  }

  const maskTime = (v: string) => {
    v = v.replace(/\D/g, '')
    if (v.length > 6) v = v.substring(0, 6)
    return v.length > 4
      ? v.replace(/(\d{2})(\d{2})(\d{1,2})/, '$1:$2:$3')
      : v.length > 2
        ? v.replace(/(\d{2})(\d{1,2})/, '$1:$2')
        : v
  }

  const calcAddTime = (execTime = '00:00:00', margin = 0) => {
    const [h, m, s] = execTime.split(':').map((n) => parseInt(n || '0', 10))
    if (isNaN(h) || isNaN(m) || isNaN(s)) return '00:00:00'
    const added = Math.round((h * 3600 + m * 60 + s) * (margin / 100))
    return `${Math.floor(added / 3600)
      .toString()
      .padStart(2, '0')}:${Math.floor((added % 3600) / 60)
      .toString()
      .padStart(2, '0')}:${(added % 60).toString().padStart(2, '0')}`
  }

  const handleSave = async () => {
    if (!formData.title) {
      return toast({ title: 'Atenção', description: 'Título obrigatório.', variant: 'destructive' })
    }
    setIsSaving(true)

    const payload = {
      title: formData.title,
      description: formData.description || '',
      cost_value: formData.cost_value || 0,
      sale_value: formData.sale_value || 0,
      exec_time: formData.exec_time || '00:00:00',
      margin_time: formData.margin_time || 0,
      add_time: formData.add_time || '00:00:00',
    }

    let error
    if (editingId) {
      const res = await supabase
        .from('services' as any)
        .update(payload)
        .eq('id', editingId)
      error = res.error
    } else {
      const res = await supabase.from('services' as any).insert([payload])
      error = res.error
    }

    setIsSaving(false)

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Serviço salvo!' })
      setOpen(false)
      loadServices()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este serviço?')) return
    const { error } = await supabase
      .from('services' as any)
      .delete()
      .eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Serviço excluído.' })
      setServices(services.filter((s) => s.id !== id))
    }
  }

  const openNew = () => {
    setFormData({
      cost_value: 0,
      sale_value: 0,
      exec_time: '00:00:00',
      margin_time: 0,
      add_time: '00:00:00',
    })
    setEditingId(null)
    setOpen(true)
  }

  const handleEdit = (s: Service) => {
    setFormData(s)
    setEditingId(s.id)
    setOpen(true)
  }

  const filtered = useMemo(() => {
    let res = searchTerm
      ? services.filter((s) => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
      : [...services]
    return res.sort((a, b) => {
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title)
      if (sortBy === 'title_desc') return b.title.localeCompare(a.title)
      if (sortBy === 'price_asc') return a.sale_value - b.sale_value
      if (sortBy === 'price_desc') return b.sale_value - a.sale_value
      if (sortBy === 'margin_asc') return a.margin_time - b.margin_time
      return b.margin_time - a.margin_time
    })
  }, [services, searchTerm, sortBy])

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Catálogo de Serviços</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os serviços com valor por hora para orçamentos e pedidos.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-border/50">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingId ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 grid-cols-1 md:grid-cols-2">
              <div className="col-span-1 md:col-span-2 grid gap-2">
                <Label>Título</Label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="col-span-1 md:col-span-2 grid gap-2">
                <Label>Descrição</Label>
                <RichTextEditor
                  value={formData.description || ''}
                  onChange={(v) => setFormData({ ...formData, description: v })}
                  minHeight="120px"
                />
              </div>
              <div className="grid gap-2">
                <Label>Custo (R$ / hora)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost_value || 0}
                  onChange={(e) => setFormData({ ...formData, cost_value: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Venda (R$ / hora)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sale_value || 0}
                  onChange={(e) => setFormData({ ...formData, sale_value: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label>T. Execução Padrão</Label>
                <Input
                  placeholder="00:00:00"
                  value={formData.exec_time || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      exec_time: maskTime(e.target.value),
                      add_time: calcAddTime(maskTime(e.target.value), formData.margin_time),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>% Margem de Tempo</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.margin_time || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      margin_time: Number(e.target.value),
                      add_time: calcAddTime(formData.exec_time, Number(e.target.value)),
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 min-w-[120px]"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card/50 backdrop-blur-sm border-border/50 shadow-sm"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[220px] bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title_asc">Título (A-Z)</SelectItem>
            <SelectItem value="title_desc">Título (Z-A)</SelectItem>
            <SelectItem value="price_asc">Menor Valor Hora</SelectItem>
            <SelectItem value="price_desc">Maior Valor Hora</SelectItem>
            <SelectItem value="margin_asc">Menor Margem (%)</SelectItem>
            <SelectItem value="margin_desc">Maior Margem (%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ServiceSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        serviceId={selectedServiceId}
      />

      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-md shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-border/50">
              <TableHead className="font-semibold h-12">Título do Serviço</TableHead>
              <TableHead className="font-semibold h-12">Custo / h</TableHead>
              <TableHead className="font-semibold h-12">Venda / h</TableHead>
              <TableHead className="font-semibold h-12">T. Execução Padrão</TableHead>
              <TableHead className="font-semibold h-12">Margem/Acrés.</TableHead>
              <TableHead className="text-right font-semibold h-12 pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  Carregando serviços...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-8 h-8 mb-3 opacity-20" />
                    <p>Nenhum serviço encontrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow
                  key={s.id}
                  className="hover:bg-muted/30 border-border/50 transition-colors group"
                >
                  <TableCell className="font-medium py-4">
                    <div className="flex flex-col">
                      <span>{s.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">
                        {s.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground py-4">
                    R$ {(s.cost_value || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="font-bold text-[#1B7D3A] dark:text-green-500 py-4">
                    R$ {(s.sale_value || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="bg-secondary/50 px-2 py-1 rounded text-xs font-medium">
                      {s.exec_time || '00:00:00'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground py-4">
                    <span className="text-foreground font-medium">{s.margin_time || 0}%</span>{' '}
                    <span className="text-xs">(+{s.add_time || '00:00:00'})</span>
                  </TableCell>
                  <TableCell className="text-right py-4 pr-4">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedServiceId(s.id)
                          setSettingsOpen(true)
                        }}
                        className="h-8 w-8 hover:text-purple-600"
                        title="Configurar Agendamento"
                      >
                        <Settings2 className="w-4 h-4 text-purple-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(s)}
                        className="h-8 w-8 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(s.id)}
                        className="h-8 w-8 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
