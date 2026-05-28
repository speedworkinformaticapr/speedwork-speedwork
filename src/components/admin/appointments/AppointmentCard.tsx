import { Car, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppointmentActions } from './AppointmentActions'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/services/appointments'

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pré Agendado':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900'
    case 'Agendado':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900'
    case 'Pendente':
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    case 'Em Andamento':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900'
    case 'Pausado':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900'
    case 'Concluído':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900'
    case 'Cancelado':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
  }
}

export function AppointmentCard({
  appointment,
  onUpdate,
}: {
  appointment: Appointment
  onUpdate: () => void
}) {
  return (
    <Card className="flex flex-col shadow-sm">
      <CardHeader className="pb-2 border-b bg-muted/30">
        <div className="flex justify-between items-start">
          <div className="min-w-0 pr-2">
            <CardTitle className="text-lg font-semibold truncate" title={appointment.client_name}>
              {appointment.client_name}
            </CardTitle>
            <div className="text-sm text-muted-foreground flex items-center mt-1">
              <Clock className="w-3 h-3 mr-1" />
              {appointment.start_time?.slice(0, 5)} - {appointment.end_time?.slice(0, 5)}
            </div>
          </div>
          <Badge variant="outline" className={cn('shrink-0', getStatusColor(appointment.status))}>
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <div className="space-y-4">
          <div>
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Veículo
            </span>
            <div className="flex items-center mt-1.5">
              <Car className="w-4 h-4 mr-2 text-primary" />
              <span className="font-medium text-sm leading-none">
                {appointment.vehicle_brand} {appointment.vehicle_model}
              </span>
            </div>
            <div className="text-xs text-muted-foreground ml-6 mt-1">
              Placa: {appointment.vehicle_plate || 'N/I'} • Ano: {appointment.vehicle_year || 'N/I'}
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Serviço
            </span>
            <p className="text-sm font-medium mt-1 leading-snug">{appointment.service_name}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-2 bg-muted/10 flex justify-end">
        <AppointmentActions appointment={appointment} onUpdate={onUpdate} />
      </CardFooter>
    </Card>
  )
}
