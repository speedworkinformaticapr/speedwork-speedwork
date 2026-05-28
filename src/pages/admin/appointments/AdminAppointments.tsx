import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, LayoutGrid, LayoutList } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { AppointmentCard, getStatusColor } from '@/components/admin/appointments/AppointmentCard'
import { AppointmentActions } from '@/components/admin/appointments/AppointmentActions'
import type { Appointment } from '@/services/appointments'

export default function AdminAppointments() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [view, setView] = useState<'card' | 'grid'>('card')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      let query = supabase.from('appointments').select('*').order('start_time', { ascending: true })

      if (date) {
        const dateStr = format(date, 'yyyy-MM-dd')
        query = query.eq('date', dateStr)
      }

      const { data, error } = await query
      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [date])

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-theme(spacing.16))] gap-4 p-4 md:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-none">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie a agenda de serviços do dia.</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[240px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => setDate(d || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Tabs
            value={view}
            onValueChange={(v) => setView(v as 'card' | 'grid')}
            className="w-[100px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card">
                <LayoutGrid className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="grid">
                <LayoutList className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full rounded-md border bg-muted/10 p-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mb-2 opacity-20" />
              <p>Nenhum agendamento para esta data.</p>
            </div>
          ) : view === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
              {appointments.map((app) => (
                <AppointmentCard key={app.id} appointment={app} onUpdate={fetchAppointments} />
              ))}
            </div>
          ) : (
            <div className="border rounded-md bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[130px]">Horário</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead className="w-[140px]">Status</TableHead>
                    <TableHead className="w-[80px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1.5 text-muted-foreground" />
                          {app.start_time?.slice(0, 5)} - {app.end_time?.slice(0, 5)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{app.client_name}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {app.vehicle_brand} {app.vehicle_model}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {app.vehicle_plate || 'Sem placa'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{app.service_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AppointmentActions appointment={app} onUpdate={fetchAppointments} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
