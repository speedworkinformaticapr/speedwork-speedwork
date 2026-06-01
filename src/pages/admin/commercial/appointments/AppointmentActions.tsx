import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { AppointmentEditDialog } from './AppointmentEditDialog'
import { AppointmentDeleteDialog } from './AppointmentDeleteDialog'
import { Appointment } from '@/services/appointments'

interface Props {
  appointment: Appointment
  onStart: (app: Appointment) => void
  onReload: () => void
}

export function AppointmentActions({ appointment, onStart, onReload }: Props) {
  const isPending = ['Pendente', 'Pendente Confirmação'].includes(appointment.status)
  const canDelete = isPending && !appointment.orcamento_id

  return (
    <div className="flex items-center justify-end gap-2">
      {isPending && (
        <Button
          size="sm"
          variant="default"
          onClick={() => onStart(appointment)}
          className="bg-blue-600 hover:bg-blue-700 h-8 text-xs font-semibold"
        >
          <Play className="w-3 h-3 mr-1" /> Iniciar
        </Button>
      )}
      <AppointmentEditDialog appointment={appointment} onReload={onReload} />
      {canDelete && <AppointmentDeleteDialog appointment={appointment} onReload={onReload} />}
    </div>
  )
}
