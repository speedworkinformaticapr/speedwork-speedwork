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

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const loadData = async () => {
    setLoading(true)
    let query = supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false })
      .order('start_time', { ascending: false })

    if (dateRange?.from) {
      query = query.gte('date', format(dateRange.from, 'yyyy-MM-dd'))
    }
    if (dateRange?.to) {
      query = query.lte('date', format(dateRange.to, 'yyyy-MM-dd'))
    }

    const { data } = await query
    setAppointments(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [dateRange])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Agendamentos</h1>
        <DateRangePicker date={dateRange} setDate={setDateRange} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum agendamento encontrado para o período.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>
                        {format(new Date(apt.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{apt.start_time}</TableCell>
                      <TableCell className="font-medium">{apt.client_name}</TableCell>
                      <TableCell>{apt.service_name}</TableCell>
                      <TableCell>{apt.vehicle_plate || '-'}</TableCell>
                      <TableCell>{apt.status}</TableCell>
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
