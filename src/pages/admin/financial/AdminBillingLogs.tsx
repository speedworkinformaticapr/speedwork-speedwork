import { useState, useEffect } from 'react'
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
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AdminBillingLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const loadData = async () => {
    setLoading(true)
    let query = supabase
      .from('billing_logs')
      .select('*')
      .order('execution_date', { ascending: false })

    if (dateRange?.from) {
      query = query.gte('execution_date', dateRange.from.toISOString())
    }
    if (dateRange?.to) {
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)
      query = query.lte('execution_date', toDate.toISOString())
    }

    const { data } = await query
    setLogs(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [dateRange])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Logs de Faturamento</h1>
        <DateRangePicker date={dateRange} setDate={setDateRange} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Execuções</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum log encontrado para o período.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data de Execução</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Faturas Geradas</TableHead>
                    <TableHead>Duplicidades Evitadas</TableHead>
                    <TableHead>Mensagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {log.execution_date
                          ? format(new Date(log.execution_date), 'dd/MM/yyyy HH:mm', {
                              locale: ptBR,
                            })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            log.status === 'success'
                              ? 'text-green-600 font-medium'
                              : 'text-red-600 font-medium'
                          }
                        >
                          {log.status === 'success' ? 'Sucesso' : 'Erro'}
                        </span>
                      </TableCell>
                      <TableCell>{log.total_generated || 0}</TableCell>
                      <TableCell>{log.total_duplicates_avoided || 0}</TableCell>
                      <TableCell
                        className="text-muted-foreground max-w-[250px] truncate"
                        title={log.error_message || '-'}
                      >
                        {log.error_message || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
