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

export default function AdminRanking() {
  const [data, setData] = useState<any[]>([])
  const { search, setSearch, debouncedSearch, dateRange, setDateRange, sortConfig, handleSort } =
    useDataTable()

  const fetchData = async () => {
    let q = supabase.from('rankings').select('*, athletes!inner(name)')

    if (debouncedSearch) {
      q = q.ilike('athletes.name', `%${debouncedSearch}%`)
    }
    if (dateRange?.from) {
      q = q.gte('updated_at', dateRange.from.toISOString())
    }
    if (dateRange?.to) {
      q = q.lte('updated_at', dateRange.to.toISOString())
    }
    if (sortConfig) {
      q = q.order(sortConfig.column, { ascending: sortConfig.direction === 'asc' })
    } else {
      q = q.order('points', { ascending: false })
    }

    const { data: result } = await q
    if (result) setData(result)
  }

  useEffect(() => {
    fetchData()
  }, [debouncedSearch, dateRange, sortConfig])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableToolbar
            search={search}
            setSearch={setSearch}
            dateRange={dateRange}
            setDateRange={setDateRange}
            searchPlaceholder="Buscar por atleta..."
          />
          <div className="rounded-md border overflow-hidden relative">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Pontos"
                        column="points"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Ranking Nacional"
                        column="national_ranking"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Atualizado em"
                        column="updated_at"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.athletes?.name || 'N/A'}</TableCell>
                      <TableCell>{item.points}</TableCell>
                      <TableCell>{item.national_ranking}</TableCell>
                      <TableCell>
                        {item.updated_at
                          ? new Date(item.updated_at).toLocaleString('pt-BR')
                          : 'N/A'}
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
