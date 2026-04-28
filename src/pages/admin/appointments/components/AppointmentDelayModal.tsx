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
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle } from 'lucide-react'
import { Appointment } from '@/services/appointments'

interface Props {
  app: Appointment | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (app: Appointment, reason: string) => void
}

export function AppointmentDelayModal({ app, isOpen, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (isOpen) setReason('')
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" /> Comunicar Atraso
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            O cliente <strong>{app?.client_name}</strong> será notificado sobre o atraso no serviço.
          </p>
          <div className="grid gap-2">
            <Label>Motivo do Atraso</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Serviço anterior se estendeu além do previsto..."
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onConfirm(app!, reason)
              onClose()
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Enviar Comunicado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
