import { useEffect, useState } from 'react'
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
import { Edit, Trash2 } from 'lucide-react'

export default function AdminQuotes() {
  const [data, setData] = useState<any[]>([])
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

  const fetchData = async () => {
    let q = supabase.from('orcamentos').select('*, profiles(name)')

    if (debouncedSearch) {
      q = q.or(`numero_orcamento.ilike.%${debouncedSearch}%,observacoes.ilike.%${debouncedSearch}%`)
    }
    if (status && status !== 'all') {
      q = q.eq('status', status)
    }
    if (dateRange?.from) {
      q = q.gte('data_emissao', dateRange.from.toISOString())
    }
    if (dateRange?.to) {
      q = q.lte('data_emissao', dateRange.to.toISOString())
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
  }, [debouncedSearch, status, dateRange, sortConfig])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('orcamentos').delete().eq('id', id)
      fetchData()
    }
  }

  const statusOptions = [
    { label: 'Rascunho', value: 'rascunho' },
    { label: 'Pendente', value: 'pendente' },
    { label: 'Aprovado', value: 'aprovado' },
    { label: 'Rejeitado', value: 'rejeitado' },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Orçamentos</CardTitle>
          <Button asChild>
            <Link to="new">Novo Orçamento</Link>
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
            searchPlaceholder="Buscar por número..."
          />
          <div className="rounded-md border overflow-hidden relative">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                  <TableRow>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Número"
                        column="numero_orcamento"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Data"
                        column="data_emissao"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Total"
                        column="total"
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
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.numero_orcamento}</TableCell>
                      <TableCell>{item.profiles?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(item.data_emissao).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.total || 0)}
                      </TableCell>
                      <TableCell>{item.status}</TableCell>
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
