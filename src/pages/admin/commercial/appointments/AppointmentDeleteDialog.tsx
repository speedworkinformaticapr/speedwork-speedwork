import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteAppointment, Appointment } from '@/services/appointments'
import { useToast } from '@/hooks/use-toast'

export function AppointmentDeleteDialog({
  appointment,
  onReload,
}: {
  appointment: Appointment
  onReload: () => void
}) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteAppointment(appointment.id)
      toast({ title: 'Sucesso', description: 'Agendamento removido.' })
      onReload()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="destructive" className="h-8 w-8">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Agendamento?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o agendamento de {appointment.client_name}? Esta ação não
            pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
