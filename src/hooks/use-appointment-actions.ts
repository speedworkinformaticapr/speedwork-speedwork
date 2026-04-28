import {
  updateAppointment,
  deleteAppointment,
  notifyClientDelay,
  Appointment,
} from '@/services/appointments'
import { useToast } from '@/hooks/use-toast'

export function useAppointmentActions(onSuccess: () => void) {
  const { toast } = useToast()

  const handleStart = async (app: Appointment) => {
    try {
      await updateAppointment(app.id, {
        status: 'Em Andamento',
        last_started_at: new Date().toISOString(),
      })
      toast({ title: 'Sucesso', description: 'Serviço iniciado.' })
      onSuccess()
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao iniciar.', variant: 'destructive' })
    }
  }

  const handlePause = async (app: Appointment) => {
    try {
      const now = new Date()
      let addedMinutes = 0
      if (app.last_started_at) {
        const diffMs = now.getTime() - new Date(app.last_started_at).getTime()
        addedMinutes = Math.floor(diffMs / 60000)
      }
      await updateAppointment(app.id, {
        status: 'Pausado',
        executed_minutes: (app.executed_minutes || 0) + addedMinutes,
        last_started_at: null,
      })
      toast({ title: 'Sucesso', description: 'Serviço pausado.' })
      onSuccess()
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao pausar.', variant: 'destructive' })
    }
  }

  const handleComplete = async (app: Appointment) => {
    try {
      const now = new Date()
      let addedMinutes = 0
      if (app.last_started_at && app.status === 'Em Andamento') {
        const diffMs = now.getTime() - new Date(app.last_started_at).getTime()
        addedMinutes = Math.floor(diffMs / 60000)
      }
      await updateAppointment(app.id, {
        status: 'Concluído',
        executed_minutes: (app.executed_minutes || 0) + addedMinutes,
        last_started_at: null,
      })
      toast({ title: 'Sucesso', description: 'Serviço concluído.' })
      onSuccess()
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao concluir.', variant: 'destructive' })
    }
  }

  const handleConfirmDelete = async (id: string) => {
    try {
      await deleteAppointment(id)
      toast({ title: 'Sucesso', description: 'Agendamento removido.' })
      onSuccess()
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao remover.', variant: 'destructive' })
    }
  }

  const handleDelayCommunicate = async (app: Appointment, reason: string) => {
    try {
      const success = await notifyClientDelay(
        app.client_name,
        app.start_time,
        reason,
        app.notes || '',
        app.id,
      )
      if (success) {
        toast({ title: 'Sucesso', description: 'Cliente notificado sobre o atraso.' })
      } else {
        toast({
          title: 'Aviso',
          description: 'Cliente não possui e-mail cadastrado, mas o registro foi feito.',
          variant: 'warning',
        })
      }
      onSuccess()
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao notificar atraso.', variant: 'destructive' })
    }
  }

  return { handleStart, handlePause, handleComplete, handleConfirmDelete, handleDelayCommunicate }
}
