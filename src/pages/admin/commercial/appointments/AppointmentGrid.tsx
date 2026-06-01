import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { Appointment } from '@/services/appointments'
import { StatusBadge } from './StatusBadge'
import { AppointmentActions } from './AppointmentActions'

interface Props {
  appointments: Appointment[]
  onStart: (app: Appointment) => void
  onReload: () => void
}

export function AppointmentGrid({ appointments, onStart, onReload }: Props) {
  if (appointments.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-lg bg-background">
        Nenhum agendamento encontrado.
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Veículo</TableHead>
            <TableHead>Serviço / Problema</TableHead>
            <TableHead>Data / Hora</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">{app.client_name}</TableCell>
              <TableCell>
                {app.vehicle_plate}
                {app.vehicle_model && (
                  <span className="text-muted-foreground ml-1 text-xs">({app.vehicle_model})</span>
                )}
              </TableCell>
              <TableCell
                className="max-w-[200px] truncate"
                title={app.problema_descricao || app.service_name}
              >
                {app.problema_descricao || app.service_name}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{format(new Date(app.date), 'dd/MM/yyyy')}</span>
                  <span className="text-xs text-muted-foreground">
                    {app.start_time.substring(0, 5)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={app.status} />
              </TableCell>
              <TableCell>
                <AppointmentActions appointment={app} onStart={onStart} onReload={onReload} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
