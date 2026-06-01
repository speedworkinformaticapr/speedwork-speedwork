import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AppointmentWizardFlow } from './AppointmentWizardFlow'

export function AppointmentWizard({ onComplete }: { onComplete: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Novo Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b bg-muted/30">
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <AppointmentWizardFlow
            onComplete={() => {
              setOpen(false)
              onComplete()
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
