import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit } from 'lucide-react'
import { Appointment, updateAppointment } from '@/services/appointments'
import { useToast } from '@/hooks/use-toast'

export function AppointmentEditDialog({
  appointment,
  onReload,
}: {
  appointment: Appointment
  onReload: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [data, setData] = useState({
    date: appointment.date,
    start_time: appointment.start_time,
    status: appointment.status,
    problema_descricao: appointment.problema_descricao || '',
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateAppointment(appointment.id, data)
      toast({ title: 'Sucesso', description: 'Agendamento atualizado.' })
      setOpen(false)
      onReload()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" className="h-8 w-8">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input
                type="time"
                value={data.start_time}
                onChange={(e) => setData({ ...data, start_time: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={data.status} onValueChange={(v) => setData({ ...data, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente Confirmação">Pendente Confirmação</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Fechada">Fechada</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Problema / Descrição</Label>
            <Textarea
              value={data.problema_descricao}
              onChange={(e) => setData({ ...data, problema_descricao: e.target.value })}
              rows={4}
            />
          </div>
          <Button className="w-full" onClick={handleSave} disabled={loading}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
