import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Edit2, Plus, Search, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSystemData } from '@/hooks/use-system-data'

export default function AdminTournaments() {
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null,
  )
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { toast } = useToast()
  const { data: systemData } = useSystemData()
  const itemsPerPage = systemData?.records_per_page || 50

  const loadData = async () => {
    const { data } = await supabase.from('events').select('*')
    setItems(data || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpen = (item?: any) => {
    setFormData(
      item || {
        name: '',
        event_type: '',
        description: '',
        date: '',
        end_date: '',
        location: '',
        status: 'published',
        price_registration: 0,
        price_ticket: 0,
        post_link: '',
        photos: [],
        category: '',
        max_participants: 0,
        image_url: '',
        regulation_url: '',
      },
    )
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name)
      return toast({
        title: 'Atenção',
        description: 'O nome do evento é obrigatório.',
        variant: 'destructive',
      })

    setIsSaving(true)
    try {
      if (formData.id) {
        const { error } = await supabase.from('events').update(formData).eq('id', formData.id)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Evento atualizado com sucesso!' })
      } else {
        const { error } = await supabase.from('events').insert([formData])
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Evento criado com sucesso!' })
      }

      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    setItemToDelete(id)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('events').delete().eq('id', itemToDelete)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Evento excluído com sucesso!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setItemToDelete(null)
    }
  }

  const toggleStatus = async (item: any) => {
    try {
      const newStatus = item.status === 'published' ? 'draft' : 'published'
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', item.id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const filteredItems = items
    .filter((c) => {
      const matchSearch =
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.location?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (!sortConfig) return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      const aVal = a[sortConfig.key] || ''
      const bVal = b[sortConfig.key] || ''
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

  const paginatedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, itemsPerPage])

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const SortHead = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label} <ArrowUpDown className="w-3 h-3 opacity-50" />
      </div>
    </TableHead>
  )

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Eventos & Torneios</h1>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Novo Evento
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 bg-background p-2 rounded-md border sticky top-[var(--header-height,0)] z-20 shadow-sm">
        <div className="flex items-center flex-1 w-full">
          <Search className="w-5 h-5 text-muted-foreground ml-2" />
          <Input
            placeholder="Buscar evento ou local..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] border-0 sm:border-l rounded-none px-4">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead label="Nome do Evento" sortKey="name" />
                <SortHead label="Tipo" sortKey="event_type" />
                <SortHead label="Data" sortKey="date" />
                <SortHead label="Local" sortKey="location" />
                <SortHead label="Status" sortKey="status" />
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.event_type || '-'}</TableCell>
                  <TableCell>{c.date ? new Date(c.date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{c.location || '-'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={c.status === 'published'}
                      onCheckedChange={() => toggleStatus(c)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpen(c)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 0 && (
          <div className="p-4 border-t flex items-center justify-between bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {paginatedItems.length} de {filteredItems.length} registros
            </span>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm px-2">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Nome *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Evento</Label>
              <Select
                value={formData.event_type}
                onValueChange={(v) => setFormData({ ...formData, event_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Torneio">Torneio</SelectItem>
                  <SelectItem value="Curso">Curso</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Campeonato Paranaense"
              />
            </div>
            <div className="space-y-2">
              <Label>Local</Label>
              <Input
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Limite de Participantes</Label>
              <Input
                type="number"
                value={formData.max_participants || ''}
                onChange={(e) =>
                  setFormData({ ...formData, max_participants: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Descrição</Label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Inscrição (R$)</Label>
              <Input
                type="number"
                value={formData.price_registration || 0}
                onChange={(e) => setFormData({ ...formData, price_registration: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Ingresso (R$)</Label>
              <Input
                type="number"
                value={formData.price_ticket || 0}
                onChange={(e) => setFormData({ ...formData, price_ticket: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Imagem de Capa (Banner)</Label>
              <Input
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Link do Regulamento</Label>
              <Input
                value={formData.regulation_url || ''}
                onChange={(e) => setFormData({ ...formData, regulation_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Link para Post Detalhado</Label>
              <Input
                value={formData.post_link || ''}
                onChange={(e) => setFormData({ ...formData, post_link: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Fotos (URLs separadas por vírgula)</Label>
              <Input
                value={(formData.photos || []).join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    photos: e.target.value
                      .split(',')
                      .map((u: string) => u.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="https://img1.jpg, https://img2.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Evento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O evento será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
