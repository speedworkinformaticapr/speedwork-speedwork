import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit } from 'lucide-react'
import { Appointment, updateAppointment } from '@/services/appointments'
import { useToast } from '@/hooks/use-toast'
import { formatTimeShort, parseTime } from '@/lib/utils/appointments'

interface Props {
  app: Appointment | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  services: any[]
}

export function AppointmentEditModal({ app, isOpen, onClose, onSuccess, services }: Props) {
  const [editDate, setEditDate] = useState('')
  const [editStartTime, setEditStartTime] = useState('09:00')
  const [editEndTime, setEditEndTime] = useState('10:00')
  const [status, setStatus] = useState('Pendente')
  const [obs, setObs] = useState('')
  const [linkPagamento, setLinkPagamento] = useState('')
  const [editSelServices, setEditSelServices] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (app && isOpen) {
      setEditDate(app.date)
      setEditStartTime(app.start_time.substring(0, 5))
      setEditEndTime(app.end_time.substring(0, 5))
      setStatus(app.status)
      setObs(app.notes || '')
      setLinkPagamento(app.link_pagamento || '')
      const names = app.service_name.split(', ')
      setEditSelServices(services.filter((s) => names.includes(s.name)).map((s) => s.id))
    }
  }, [app, isOpen, services])

  useEffect(() => {
    if (isOpen && editSelServices.length > 0) {
      const total = editSelServices.reduce(
        (acc, id) => acc + (services.find((s) => s.id === id)?.execution_time_minutes || 0),
        0,
      )
      const startMin = parseTime(editStartTime)
      if (startMin !== null) {
        setEditEndTime(formatTimeShort(startMin + total))
      }
    }
  }, [editSelServices, editStartTime, services, isOpen])

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!app) return
    if (!editDate) {
      toast({ title: 'Atenção', description: 'A data é obrigatória.', variant: 'destructive' })
      return
    }

    const srvs = editSelServices.map((id) => services.find((s) => s.id === id)).filter(Boolean)
    const serviceNames = srvs.map((s) => s.name).join(', ')

    setIsSaving(true)
    try {
      await updateAppointment(app.id, {
        date: editDate,
        start_time: `${editStartTime}:00`,
        end_time: `${editEndTime}:00`,
        status,
        notes: obs,
        service_name: serviceNames || app.service_name,
        link_pagamento: linkPagamento,
      })
      toast({ title: 'Sucesso', description: 'Agendamento atualizado com sucesso!' })
      onSuccess()
      onClose()
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar agendamento.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" /> Editar Agendamento
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid gap-2">
            <Label>Data *</Label>
            <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Início</Label>
              <Input
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Fim</Label>
              <Input
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Link de Pagamento</Label>
            <Input
              type="url"
              placeholder="https://..."
              value={linkPagamento}
              onChange={(e) => setLinkPagamento(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Confirmado">Confirmado</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Pausado">Pausado</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Serviços</Label>
            <div className="max-h-32 overflow-y-auto space-y-2 p-2 border rounded-md custom-scrollbar">
              {services.map((s) => (
                <div key={s.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`srv-${s.id}`}
                    checked={editSelServices.includes(s.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setEditSelServices([...editSelServices, s.id])
                      else setEditSelServices(editSelServices.filter((id) => id !== s.id))
                    }}
                  />
                  <Label htmlFor={`srv-${s.id}`} className="text-sm font-normal cursor-pointer">
                    {s.name} ({s.execution_time_minutes}m)
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Observações</Label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Detalhes..."
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
