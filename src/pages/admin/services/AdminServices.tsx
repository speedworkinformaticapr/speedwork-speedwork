import { useEffect, useState } from 'react'
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
import { Trash2, ExternalLink } from 'lucide-react'

export default function AdminServices() {
  const [data, setData] = useState<any[]>([])
  const { search, setSearch, debouncedSearch, dateRange, setDateRange, sortConfig, handleSort } =
    useDataTable()

  const fetchData = async () => {
    let q = supabase.from('services').select('*')

    if (debouncedSearch) {
      q = q.ilike('title', `%${debouncedSearch}%`)
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
  }

  useEffect(() => {
    fetchData()
  }, [debouncedSearch, dateRange, sortConfig])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('services').delete().eq('id', id)
      fetchData()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableToolbar
            search={search}
            setSearch={setSearch}
            dateRange={dateRange}
            setDateRange={setDateRange}
            searchPlaceholder="Buscar por título..."
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
                        title="Custo"
                        column="cost_value"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Venda"
                        column="sale_value"
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
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.cost_value || 0)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.sale_value || 0)}
                      </TableCell>
                      <TableCell>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString('pt-BR')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.evaluation_slug && (
                            <Button variant="ghost" size="icon" asChild title="Avaliação Pública">
                              <a
                                href={`/avaliar/${item.evaluation_slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
