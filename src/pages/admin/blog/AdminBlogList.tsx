import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
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
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Settings, Eye } from 'lucide-react'
import { BlogAiModelSettings } from '@/components/blog/BlogAiModelSettings'
import { InlineCellSelect } from '@/components/blog/InlineCellSelect'
import { blogService } from '@/services/blog'

const STATUS_OPTIONS = [
  { label: 'Publicado', value: 'published' },
  { label: 'Rascunho', value: 'draft' },
  { label: 'Revisão', value: 'review' },
  { label: 'Arquivado', value: 'archived' },
]

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  draft: 'Rascunho',
  review: 'Revisão',
  archived: 'Arquivado',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  published: 'default',
  draft: 'secondary',
  review: 'outline',
  archived: 'destructive',
}

export default function AdminBlogList() {
  const [data, setData] = useState<any[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string }[]>([])
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

  const fetchData = useCallback(async () => {
    let q = supabase.from('blog_posts').select('*')

    if (debouncedSearch) {
      q = q.or(`title.ilike.%${debouncedSearch}%,category.ilike.%${debouncedSearch}%`)
    }
    if (status && status !== 'all') {
      q = q.eq('status', status)
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
      q = q.order('created_at', { ascending: false })
    }

    const { data: result } = await q
    if (result) setData(result)
  }, [debouncedSearch, status, dateRange, sortConfig])

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await blogService.getCategories()
      setCategoryOptions(cats.map((c) => ({ label: c, value: c })))
    } catch {
      setCategoryOptions([])
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('blog_posts').delete().eq('id', id)
      fetchData()
    }
  }

  const handleInlineUpdate = async (
    id: string,
    field: 'category' | 'status',
    value: string,
    label: string,
  ) => {
    try {
      await blogService.updatePostField(id, field, value)
      setData((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
      toast.success(`${label} atualizado com sucesso!`)
    } catch {
      toast.error(`Erro ao atualizar ${label.toLowerCase()}.`)
      throw new Error('update failed')
    }
  }

  return (
    <div className="space-y-6">
      <BlogAiModelSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Postagens do Blog</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4 mr-2" /> IA
            </Button>
            <Button asChild>
              <Link to="new">Novo Post</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTableToolbar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            statusOptions={STATUS_OPTIONS}
            dateRange={dateRange}
            setDateRange={setDateRange}
            searchPlaceholder="Buscar por título ou categoria..."
          />
          <div className="rounded-md border overflow-hidden relative">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                  <TableRow>
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
                        title="Categoria"
                        column="category"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Status"
                        column="status"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-center">Views</TableHead>
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
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <InlineCellSelect
                          value={item.category || ''}
                          options={categoryOptions}
                          placeholder="Sem categoria"
                          onUpdate={(val) =>
                            handleInlineUpdate(item.id, 'category', val, 'Categoria')
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <InlineCellSelect
                          value={item.status || 'draft'}
                          options={STATUS_OPTIONS}
                          onUpdate={(val) => handleInlineUpdate(item.id, 'status', val, 'Status')}
                          className="border-transparent"
                        />
                        <Badge
                          variant={STATUS_VARIANT[item.status] || 'secondary'}
                          className="ml-2 hidden"
                        >
                          {STATUS_LABELS[item.status] || item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          {item.view_count || 0}
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
