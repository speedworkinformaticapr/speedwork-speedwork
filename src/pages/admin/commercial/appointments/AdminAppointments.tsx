import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, Car, Edit, Eye } from 'lucide-react'
import type { Appointment } from '@/services/appointments'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false })
      .order('start_time', { ascending: false })

    if (!error && data) {
      setAppointments(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'concluído':
      case 'fechada':
      case 'aprovado':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
      case 'em andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
      case 'pausado':
      case 'pendente confirmação':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
      case 'cancelado':
      case 'não aprovado':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os agendamentos e horários dos clientes.
          </p>
        </div>
        <Button onClick={() => window.open('/scheduling', '_blank')} className="gap-2">
          <Calendar className="w-4 h-4" />
          Novo Agendamento
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Calendar className="w-12 h-12 mb-4 text-gray-300" />
          <CardTitle className="text-lg">Nenhum agendamento encontrado</CardTitle>
          <p>Os novos agendamentos aparecerão aqui.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {appointments.map((app) => (
            <Card key={app.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-1" title={app.client_name}>
                      {app.client_name}
                    </CardTitle>
                    <CardDescription
                      className="font-medium text-primary line-clamp-1"
                      title={app.service_name}
                    >
                      {app.service_name}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(app.status)} whitespace-nowrap`}
                  >
                    {app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-y-3">
                  <div className="col-span-2 sm:col-span-1 flex items-start gap-2 text-sm">
                    <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="font-medium">
                      {format(new Date(app.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-start gap-2 text-sm">
                    <Clock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="font-medium">
                      {app.start_time.slice(0, 5)}{' '}
                      {app.end_time && app.end_time !== app.start_time
                        ? `às ${app.end_time.slice(0, 5)}`
                        : ''}
                    </span>
                  </div>

                  {(app.vehicle_brand || app.vehicle_model || app.vehicle_plate) && (
                    <div className="col-span-2 flex items-start gap-2 text-sm bg-muted/30 p-3 rounded-md border border-border/50">
                      <Car className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <span className="font-medium block">
                          {app.vehicle_plate?.toUpperCase() || 'Sem Placa'}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {app.vehicle_brand} {app.vehicle_model}{' '}
                          {app.vehicle_year && `(${app.vehicle_year})`}
                        </span>
                      </div>
                    </div>
                  )}

                  {app.notes && (
                    <div className="col-span-2 text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-md border border-yellow-100 dark:border-yellow-900/30">
                      <span className="font-semibold text-yellow-800 dark:text-yellow-600 block mb-1">
                        Notas:
                      </span>
                      <span className="line-clamp-2">{app.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 p-4 border-t border-border/50 flex gap-2 shrink-0">
                <Button className="flex-1" variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Detalhes
                </Button>
                <Button className="flex-1" variant="secondary" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
