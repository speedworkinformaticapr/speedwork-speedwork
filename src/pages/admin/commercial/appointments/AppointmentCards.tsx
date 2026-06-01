import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Appointment } from '@/services/appointments'
import { StatusBadge } from './StatusBadge'
import { AppointmentActions } from './AppointmentActions'
import { Car, Clock, Wrench } from 'lucide-react'

interface Props {
  appointments: Appointment[]
  onStart: (app: Appointment) => void
  onReload: () => void
}

export function AppointmentCards({ appointments, onStart, onReload }: Props) {
  if (appointments.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-lg bg-background">
        Nenhum agendamento encontrado.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {appointments.map((app) => (
        <Card key={app.id} className="flex flex-col shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 gap-2">
            <CardTitle className="text-base font-bold truncate" title={app.client_name}>
              {app.client_name}
            </CardTitle>
            <StatusBadge status={app.status} />
          </CardHeader>
          <CardContent className="flex-1 space-y-3 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Car className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">
                {app.vehicle_plate} {app.vehicle_model ? `- ${app.vehicle_model}` : ''}
              </span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-2 shrink-0" />
              <span>
                {format(new Date(app.date), 'dd/MM/yyyy')} às {app.start_time.substring(0, 5)}
              </span>
            </div>
            <div className="flex items-start text-muted-foreground">
              <Wrench className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
              <span className="line-clamp-2" title={app.problema_descricao || app.service_name}>
                {app.problema_descricao || app.service_name}
              </span>
            </div>
          </CardContent>
          <CardFooter className="pt-3 pb-3 border-t bg-muted/10">
            <div className="w-full flex justify-end">
              <AppointmentActions appointment={app} onStart={onStart} onReload={onReload} />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
