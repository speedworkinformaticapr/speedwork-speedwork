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
import { StepSlotSelection } from './StepSlotSelection'
import { StepClientAuth } from './StepClientAuth'
import { StepDetails } from './StepDetails'

export function NewAppointmentDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)

  const [appointmentData, setAppointmentData] = useState<any>({
    date: new Date(),
    startTime: '',
    endTime: '',
    client: null,
    description: '',
  })

  const reset = () => {
    setStep(1)
    setAppointmentData({
      date: new Date(),
      startTime: '',
      endTime: '',
      client: null,
      description: '',
    })
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Novo Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 border-b bg-muted/20 shrink-0">
          <DialogTitle className="text-2xl font-bold">
            {step === 1 && 'Etapa 1: Disponibilidade e Horário'}
            {step === 2 && 'Etapa 2: Identificação do Cliente'}
            {step === 3 && 'Etapa 3: Detalhes do Problema'}
          </DialogTitle>
          <div className="flex items-center gap-3 mt-5">
            <div
              className={`h-2.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}
            />
            <div
              className={`h-2.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}
            />
            <div
              className={`h-2.5 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6 relative bg-muted/5">
          <div className="h-full overflow-y-auto pr-2 pb-6">
            {step === 1 && (
              <StepSlotSelection
                data={appointmentData}
                onChange={setAppointmentData}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <StepClientAuth
                data={appointmentData}
                onChange={setAppointmentData}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <StepDetails
                data={appointmentData}
                onChange={setAppointmentData}
                onBack={() => setStep(2)}
                onComplete={() => {
                  onCreated()
                  handleOpenChange(false)
                }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
