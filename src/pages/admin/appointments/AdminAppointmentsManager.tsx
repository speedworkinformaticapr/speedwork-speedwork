import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LayoutGrid, List, Play, Calendar as CalendarIcon, Car } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { VehicleModal } from '@/components/modals/VehicleModal'

const STATUSES = [
  'Pendente Confirmação',
  'Confirmado pelo Cliente',
  'Recebido no Horário',
  'Recebido c/ Atraso',
  'OS Rascunho',
  'Aguardando Aprovação',
  'Aprovado',
  'Solicitado Ajustes',
  'Não Aprovado',
  'Em Ajustes',
  'Pré-Fechada',
  'Fechada',
]

export default function AdminAppointmentsManager() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [view, setView] = useState<'kanban' | 'grid'>('kanban')
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  const fetchAppointments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false })
      .order('start_time', { ascending: true })
    if (data) setAppointments(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchAppointments()
    const channel = supabase
      .channel('public:appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        fetchAppointments,
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error)
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    else fetchAppointments()
  }

  const handleStartOS = async (apt: any) => {
    await updateStatus(apt.id, 'OS Rascunho')
    const params = new URLSearchParams({
      appointment_id: apt.id,
      client_name: apt.client_name,
      vehicle_plate: apt.vehicle_plate || '',
      vehicle_brand: apt.vehicle_brand || '',
      vehicle_model: apt.vehicle_model || '',
      vehicle_year: apt.vehicle_year || '',
    })
    navigate(`/admin/quotes/new?${params.toString()}`)
  }

  const renderCard = (apt: any) => (
    <Card key={apt.id} className="mb-3 hover:border-primary/50 transition-colors shadow-sm text-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <span className="font-bold text-base truncate pr-2">{apt.client_name}</span>
          <Badge variant="outline">{apt.start_time.substring(0, 5)}</Badge>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Car className="w-4 h-4 mr-2" />
          <span className="uppercase">{apt.vehicle_plate || 'Sem Placa'}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>{format(new Date(apt.date), 'dd/MM/yyyy')}</span>
        </div>
        {apt.problema_descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded">
            {apt.problema_descricao}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-2 bg-muted/20 border-t flex justify-between items-center gap-2">
        <select
          className="text-xs bg-transparent border rounded p-1 flex-1 max-w-[140px] truncate"
          value={apt.status}
          onChange={(e) => updateStatus(apt.id, e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {[
          'Pendente Confirmação',
          'Confirmado pelo Cliente',
          'Recebido no Horário',
          'Recebido c/ Atraso',
        ].includes(apt.status) && (
          <Button size="sm" className="h-7 px-2" onClick={() => handleStartOS(apt)}>
            <Play className="w-3 h-3 mr-1" /> Iniciar
          </Button>
        )}
      </CardFooter>
    </Card>
  )

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold">Painel de Agendamentos / OS</h1>
          <p className="text-muted-foreground">Acompanhe e movimente o fluxo da oficina.</p>
        </div>
        <div className="flex items-center gap-4">
          <VehicleModal />
          <div className="flex bg-muted p-1 rounded-lg">
            <Button
              variant={view === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('kanban')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Kanban
            </Button>
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('grid')}
            >
              <List className="w-4 h-4 mr-2" /> Lista
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : view === 'kanban' ? (
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4 items-start">
          {STATUSES.map((status) => {
            const columnApts = appointments.filter((a) => a.status === status)
            return (
              <div
                key={status}
                className="w-80 shrink-0 bg-muted/30 rounded-xl border flex flex-col max-h-full"
              >
                <div className="p-4 border-b bg-muted/50 rounded-t-xl flex justify-between items-center shrink-0">
                  <h3 className="font-semibold text-sm">{status}</h3>
                  <Badge variant="secondary">{columnApts.length}</Badge>
                </div>
                <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
                  {columnApts.map(renderCard)}
                  {columnApts.length === 0 && (
                    <p className="text-xs text-center text-muted-foreground py-4">Vazio</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="flex-1 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>
                      <div className="font-medium">{format(new Date(apt.date), 'dd/MM/yyyy')}</div>
                      <div className="text-xs text-muted-foreground">
                        {apt.start_time.substring(0, 5)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{apt.client_name}</TableCell>
                    <TableCell className="uppercase">{apt.vehicle_plate || 'N/A'}</TableCell>
                    <TableCell>
                      <select
                        className="text-sm bg-transparent border rounded p-1"
                        value={apt.status}
                        onChange={(e) => updateStatus(apt.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="text-right">
                      {[
                        'Pendente Confirmação',
                        'Confirmado pelo Cliente',
                        'Recebido no Horário',
                        'Recebido c/ Atraso',
                      ].includes(apt.status) && (
                        <Button size="sm" onClick={() => handleStartOS(apt)}>
                          <Play className="w-4 h-4 mr-2" /> Iniciar OS
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
