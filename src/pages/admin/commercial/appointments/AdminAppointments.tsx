import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card'
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
import { format } from 'date-fns'
import { Play, Trash2, Calendar, LayoutGrid, List, Clock, Car } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/lib/supabase/types'

type Appointment = Database['public']['Tables']['appointments']['Row']

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  const fetchAppointments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false })
      .order('start_time', { ascending: false })

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      setAppointments(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleIniciar = async (app: Appointment) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'Iniciado' })
      .eq('id', app.id)
    if (error) {
      toast({ title: 'Erro ao iniciar', description: error.message, variant: 'destructive' })
      return
    }

    const params = new URLSearchParams()
    if (app.id) params.append('appointment_id', app.id)
    if (app.cliente_id) params.append('cliente_id', app.cliente_id)
    if (app.vehicle_id) params.append('vehicle_id', app.vehicle_id)
    if (app.vehicle_plate) params.append('veiculo_placa', app.vehicle_plate)
    if (app.problema_descricao) params.append('observacoes', app.problema_descricao)

    navigate(`/admin/commercial/quotes/new?${params.toString()}`, {
      state: {
        appointment_id: app.id,
        cliente_id: app.cliente_id,
        vehicle_id: app.vehicle_id,
        veiculo_placa: app.vehicle_plate,
        observacoes: app.problema_descricao,
      },
    })
  }

  const handleDelete = async (app: Appointment) => {
    if (app.orcamento_id || ['Iniciado', 'Em Andamento', 'Concluído'].includes(app.status)) {
      toast({
        title: 'Ação não permitida',
        description:
          'Não é possível excluir um agendamento já iniciado ou com orçamento vinculado.',
        variant: 'destructive',
      })
      return
    }

    const { error } = await supabase.from('appointments').delete().eq('id', app.id)
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Agendamento excluído.' })
      fetchAppointments()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pendente Confirmação':
      case 'Pendente':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>
      case 'Iniciado':
      case 'Em Andamento':
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
      case 'Concluído':
      case 'Fechada':
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case 'Rascunho':
      case 'OS Rascunho':
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie os agendamentos e inicie orçamentos.</p>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex justify-end mb-4">
          <TabsList>
            <TabsTrigger value="grid" className="gap-2">
              <LayoutGrid className="w-4 h-4" /> Cards
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" /> Lista
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="mt-0">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data / Hora</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Problema</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.client_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{format(new Date(app.date), 'dd/MM/yyyy')}</span>
                        <span className="text-xs text-muted-foreground">
                          {app.start_time.substring(0, 5)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span>{app.vehicle_plate || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={app.problema_descricao || app.service_name}
                    >
                      {app.problema_descricao || app.service_name}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIniciar(app)}
                          className="gap-1"
                        >
                          <Play className="w-3 h-3" /> Iniciar
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(app)}
                          disabled={
                            !!app.orcamento_id ||
                            ['Iniciado', 'Em Andamento', 'Concluído'].includes(app.status)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {appointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum agendamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {appointments.map((app) => (
              <Card key={app.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{app.client_name}</CardTitle>
                    {getStatusBadge(app.status)}
                  </div>
                  <CardDescription className="flex items-center gap-2 mt-2 text-sm">
                    <Calendar className="w-4 h-4" /> {format(new Date(app.date), 'dd/MM/yyyy')}
                    <Clock className="w-4 h-4 ml-2" /> {app.start_time.substring(0, 5)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-3 text-sm space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Car className="w-4 h-4" /> {app.vehicle_plate || 'Sem placa'}{' '}
                    {app.vehicle_model ? `- ${app.vehicle_model}` : ''}
                  </div>
                  <div className="line-clamp-2 mt-2">
                    <span className="font-semibold">Problema: </span>
                    {app.problema_descricao || app.service_name}
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t flex justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 bg-primary/5 hover:bg-primary/10"
                    onClick={() => handleIniciar(app)}
                  >
                    <Play className="w-4 h-4" /> Iniciar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(app)}
                    disabled={
                      !!app.orcamento_id ||
                      ['Iniciado', 'Em Andamento', 'Concluído'].includes(app.status)
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {appointments.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                Nenhum agendamento encontrado.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
