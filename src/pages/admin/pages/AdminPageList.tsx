import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSystemData } from '@/hooks/use-system-data'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
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
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  GripVertical,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function AdminPageList() {
  const [pages, setPages] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null,
  )
  const [page, setPage] = useState(1)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  const { data: systemData } = useSystemData()
  const itemsPerPage = systemData?.records_per_page || 50

  const loadPages = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('pages')
      .select('id, title, slug, is_published, display_order')
      .order('display_order', { ascending: true })
    if (data) setPages(data)
    setLoading(false)
  }

  useEffect(() => {
    loadPages()
  }, [])

  const filteredItems = useMemo(() => {
    return pages
      .filter((p) => {
        const matchSearch =
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          p.slug?.toLowerCase().includes(search.toLowerCase())
        const matchStatus =
          statusFilter === 'all' ||
          (statusFilter === 'published' ? p.is_published : !p.is_published)
        return matchSearch && matchStatus
      })
      .sort((a, b) => {
        if (!sortConfig) return a.display_order - b.display_order
        let aVal = a[sortConfig.key] || ''
        let bVal = b[sortConfig.key] || ''
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
  }, [pages, search, statusFilter, sortConfig])

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

  const deletePage = (id: string) => {
    setItemToDelete(id)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('pages').delete().eq('id', itemToDelete)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Página excluída com sucesso!' })
      loadPages()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setItemToDelete(null)
    }
  }

  const togglePublish = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('pages').update({ is_published: !current }).eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso!' })
      loadPages()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('dragIndex', index.toString())
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    const dragData = e.dataTransfer.getData('dragIndex')
    if (!dragData) return
    const dragIndex = parseInt(dragData, 10)
    if (isNaN(dragIndex) || dragIndex === dropIndex) return

    const newPages = [...pages]
    const [moved] = newPages.splice(dragIndex, 1)
    newPages.splice(dropIndex, 0, moved)
    const updated = newPages.map((p, i) => ({ ...p, display_order: i }))
    setPages(updated)
    for (const p of updated) {
      await supabase.from('pages').update({ display_order: p.display_order }).eq('id', p.id)
    }
    toast({ title: 'Ordem atualizada' })
  }

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <span>Páginas</span>
          </h1>
        </div>
        <div>
          <Link to="/admin/pages/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              <span>Nova Página</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6 bg-background p-2 rounded-md border sticky top-[var(--header-height,0)] z-20 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] border-0 sm:border-l rounded-none px-4 focus:ring-0">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filtrar Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="published">Ativos</SelectItem>
            <SelectItem value="draft">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <SortHead label="Ordem" sortKey="display_order" />
                <SortHead label="Nome da Página" sortKey="title" />
                <SortHead label="Status" sortKey="is_published" />
                <TableHead className="text-right">
                  <span>Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <span>Carregando...</span>
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    <span>Nenhuma página encontrada.</span>
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filteredItems.length > 0 &&
                paginatedItems.map((page, i) => (
                  <TableRow
                    key={page.id}
                    draggable={!sortConfig && search === '' && statusFilter === 'all'}
                    onDragStart={(e) => handleDragStart(e, (page as any).index ?? i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, (page as any).index ?? i)}
                    className={
                      !sortConfig && search === '' && statusFilter === 'all'
                        ? 'cursor-move hover:bg-muted/30'
                        : ''
                    }
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <GripVertical className="text-muted-foreground w-5 h-5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{page.title}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={page.is_published}
                          onCheckedChange={() => togglePublish(page.id, page.is_published)}
                        />
                        <span className="text-sm">{page.is_published ? 'Ativo' : 'Inativo'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/pages/${page.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => deletePage(page.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
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
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A página será permanentemente removida.
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
