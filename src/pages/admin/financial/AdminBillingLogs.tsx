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

export default function AdminBillingLogs() {
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
    let q = supabase.from('billing_logs').select('*')

    if (debouncedSearch) {
      q = q.ilike('error_message', `%${debouncedSearch}%`)
    }
    if (status && status !== 'all') {
      q = q.eq('status', status)
    }
    if (dateRange?.from) {
      q = q.gte('execution_date', dateRange.from.toISOString())
    }
    if (dateRange?.to) {
      q = q.lte('execution_date', dateRange.to.toISOString())
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

  const statusOptions = [
    { label: 'Sucesso', value: 'success' },
    { label: 'Erro', value: 'error' },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logs de Faturamento</CardTitle>
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
            searchPlaceholder="Buscar por mensagem de erro..."
          />
          <div className="rounded-md border overflow-hidden relative">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                  <TableRow>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Data de Execução"
                        column="execution_date"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Gerados"
                        column="total_generated"
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
                    <TableHead>Mensagem de Erro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.execution_date
                          ? new Date(item.execution_date).toLocaleString('pt-BR')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{item.total_generated}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.error_message || 'Nenhum erro'}
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
