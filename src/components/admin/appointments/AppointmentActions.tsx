import { Play, Pause, Check, Trash2, MessageCircleWarning, Clock, MoreVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAppointmentActions } from '@/hooks/use-appointment-actions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import type { Appointment } from '@/services/appointments'

export function AppointmentActions({
  appointment,
  onUpdate,
}: {
  appointment: Appointment
  onUpdate: () => void
}) {
  const { toast } = useToast()
  const { handleStart, handlePause, handleComplete, handleConfirmDelete, handleDelayCommunicate } =
    useAppointmentActions(onUpdate)

  const updateStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointment.id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso.' })
      onUpdate()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Clock className="mr-2 h-4 w-4" /> Alterar Status
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={appointment.status} onValueChange={updateStatus}>
                <DropdownMenuRadioItem value="Pré Agendado">Pré Agendado</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Agendado">Agendado</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Pendente">Pendente</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Em Andamento">Em Andamento</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Pausado">Pausado</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Concluído">Concluído</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Cancelado">Cancelado</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuItem
          onClick={() => handleStart(appointment)}
          disabled={['Em Andamento', 'Concluído', 'Cancelado'].includes(appointment.status)}
        >
          <Play className="mr-2 h-4 w-4 text-green-600" /> Iniciar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handlePause(appointment)}
          disabled={appointment.status !== 'Em Andamento'}
        >
          <Pause className="mr-2 h-4 w-4 text-orange-600" /> Pausar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleComplete(appointment)}
          disabled={['Concluído', 'Cancelado'].includes(appointment.status)}
        >
          <Check className="mr-2 h-4 w-4 text-emerald-600" /> Concluir
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelayCommunicate(appointment, 'Atraso operacional')}>
          <MessageCircleWarning className="mr-2 h-4 w-4 text-yellow-600" /> Notificar Atraso
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleConfirmDelete(appointment.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Remover
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
