import { useEffect, useState } from 'react'
import type { DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDataTable } from '@/hooks/use-data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, GripVertical } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function AdminPageList() {
  const [data, setData] = useState<any[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const {
    search,
    setSearch,
    debouncedSearch,
    status,
    setStatus,
    dateRange,
    setDateRange,
    sortConfig,
    handleSort,
  } = useDataTable()

  const isDefaultSort = !sortConfig || sortConfig.column === 'display_order'
  const hasFilters =
    !!debouncedSearch || (!!status && status !== 'all') || !!dateRange?.from || !!dateRange?.to
  const canReorder = isDefaultSort && !hasFilters

  const fetchData = async () => {
    let q = supabase.from('pages').select('*')

    if (debouncedSearch) {
      q = q.or(`title.ilike.%${debouncedSearch}%,slug.ilike.%${debouncedSearch}%`)
    }
    if (status && status !== 'all') {
      q = q.eq('is_published', status === 'true')
    }
    if (dateRange?.from) {
      q = q.gte('created_at', dateRange.from.toISOString())
    }
    if (dateRange?.to) {
      q = q.lte('created_at', dateRange.to.toISOString())
    }
    if (sortConfig) {
      q = q.order(sortConfig.column, { ascending: sortConfig.direction === 'asc' })
    } else {
      q = q.order('display_order', { ascending: true })
    }

    const { data: result } = await q
    if (result) setData(result)
  }

  useEffect(() => {
    fetchData()
  }, [debouncedSearch, status, dateRange, sortConfig])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('pages').delete().eq('id', id)
      fetchData()
    }
  }

  const saveOrder = async (newData: any[]) => {
    setSaving(true)
    try {
      const updates = newData.map((item, index) =>
        supabase.from('pages').update({ display_order: index }).eq('id', item.id),
      )
      await Promise.all(updates)
      toast({
        title: 'Ordem atualizada!',
        description: 'A nova ordem das páginas foi salva com sucesso.',
      })
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a nova ordem.',
        variant: 'destructive',
      })
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault()
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newData = [...data]
    const [movedItem] = newData.splice(draggedIndex, 1)
    newData.splice(dropIndex, 0, movedItem)

    setData(newData)
    setDraggedIndex(null)
    setDragOverIndex(null)
    saveOrder(newData)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const statusOptions = [
    { label: 'Publicado', value: 'true' },
    { label: 'Rascunho', value: 'false' },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Páginas Institucionais</CardTitle>
          <Button asChild>
            <Link to="new">Nova Página</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <DataTableToolbar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            statusOptions={statusOptions}
            dateRange={dateRange}
            setDateRange={setDateRange}
            searchPlaceholder="Buscar por título ou slug..."
          />
          {saving && (
            <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Salvando ordem...
            </div>
          )}
          {!canReorder && hasFilters && (
            <p className="py-2 text-sm text-muted-foreground">
              A reordenação por arraste está disponível apenas sem filtros ativos e na ordenação
              padrão.
            </p>
          )}
          <div className="rounded-md border overflow-hidden relative">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                  <TableRow>
                    <TableHead className="w-12" />
                    <TableHead>
                      <DataTableColumnHeader
                        title="Título"
                        column="title"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Slug"
                        column="slug"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Publicado"
                        column="is_published"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Data"
                        column="created_at"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow
                      key={item.id}
                      draggable={canReorder}
                      onDragStart={() => canReorder && handleDragStart(index)}
                      onDragOver={(e) => canReorder && handleDragOver(e, index)}
                      onDrop={(e) => canReorder && handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'transition-colors',
                        canReorder && 'cursor-grab active:cursor-grabbing',
                        draggedIndex === index && 'opacity-40',
                        dragOverIndex === index &&
                          draggedIndex !== index &&
                          'bg-primary/10 border-t-2 border-t-primary',
                      )}
                    >
                      <TableCell className="w-12 text-center">
                        {canReorder ? (
                          <GripVertical className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : (
                          <span className="text-xs text-muted-foreground">{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.slug}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            item.is_published
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                          )}
                        >
                          {item.is_published ? 'Sim' : 'Não'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString('pt-BR')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`${item.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
