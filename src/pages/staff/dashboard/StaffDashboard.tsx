import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { PlayCircle, CheckSquare, Clock, MapPin, Camera, MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'

type Appointment = {
  id: string
  time: string
  service: string
  client: string
  location: string
  status: 'Pendente' | 'Em Andamento' | 'Concluído'
}

const MOCK_TODAY_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    time: '09:00',
    service: 'Consultoria de Campo',
    client: 'Clube Alpha',
    location: 'Campo Principal',
    status: 'Pendente',
  },
  {
    id: '2',
    time: '11:00',
    service: 'Manutenção Preventiva',
    client: 'Clube Beta',
    location: 'Setor Sul',
    status: 'Pendente',
  },
  {
    id: '3',
    time: '14:00',
    service: 'Treinamento Tático',
    client: 'João Silva',
    location: 'Área de Treino',
    status: 'Em Andamento',
  },
  {
    id: '4',
    time: '16:00',
    service: 'Auditoria de Regras',
    client: 'Maria Costa',
    location: 'Escritório Central',
    status: 'Pendente',
  },
  {
    id: '5',
    time: '18:00',
    service: 'Consultoria Premium',
    client: 'Clube Omega',
    location: 'Campo VIP',
    status: 'Concluído',
  },
]

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState(MOCK_TODAY_APPOINTMENTS)
  const [open, setOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [obs, setObs] = useState('')

  const handleStart = (id: string) => {
    setAppointments((xs) => xs.map((a) => (a.id === id ? { ...a, status: 'Em Andamento' } : a)))
    toast.success('Serviço iniciado com sucesso!')
  }

  const openConclude = (appt: Appointment) => {
    setSelectedAppt(appt)
    setFile(null)
    setObs('')
    setOpen(true)
  }

  const handleConclude = () => {
    if (selectedAppt) {
      setAppointments((xs) =>
        xs.map((a) => (a.id === selectedAppt.id ? { ...a, status: 'Concluído' } : a)),
      )
      toast.success('Serviço concluído e registrado no sistema!')
    }
    setOpen(false)
  }

  const handleSendProof = (appt: Appointment) => {
    toast.info(`Comprovante do serviço ${appt.service} enviado para o cliente via WhatsApp!`)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Dashboard Operacional</h1>
        <p className="text-muted-foreground mt-1">Acompanhe seus serviços agendados para hoje.</p>
      </div>

      <div className="grid gap-6">
        {appointments.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-2xl shadow-sm border border-border p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5 text-[#1B7D3A] font-black text-xl">
                  <Clock className="w-5 h-5" /> {a.time}
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    a.status === 'Concluído'
                      ? 'bg-green-100 text-green-700'
                      : a.status === 'Em Andamento'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {a.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{a.service}</h3>
              <p className="text-muted-foreground font-medium mb-1">Cliente: {a.client}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Local: {a.location}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto">
              {a.status === 'Pendente' && (
                <Button
                  onClick={() => handleStart(a.id)}
                  className="bg-blue-600 hover:bg-blue-700 w-full md:w-40 gap-2"
                >
                  <PlayCircle className="w-4 h-4" /> Iniciar Serviço
                </Button>
              )}
              {a.status === 'Em Andamento' && (
                <Button
                  onClick={() => openConclude(a)}
                  className="bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 w-full md:w-40 gap-2"
                >
                  <CheckSquare className="w-4 h-4" /> Concluir
                </Button>
              )}
              {a.status === 'Concluído' && (
                <Button
                  onClick={() => handleSendProof(a)}
                  variant="outline"
                  className="w-full md:w-auto gap-2 border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Send className="w-4 h-4" /> Enviar Comprovante
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1B7D3A]">
              Finalizar Serviço
            </DialogTitle>
          </DialogHeader>
          {selectedAppt && (
            <div className="py-4 space-y-5">
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p>
                  <strong>Serviço:</strong> {selectedAppt.service}
                </p>
                <p>
                  <strong>Cliente:</strong> {selectedAppt.client}
                </p>
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Foto do Serviço Concluído
                </Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                  <Input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <p className="text-sm font-bold text-[#1B7D3A]">{file.name}</p>
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center">
                      <Camera className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm font-medium">Clique ou arraste uma foto aqui</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Observações (Opcional)
                </Label>
                <Textarea
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Detalhes técnicos, uso de materiais extras..."
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleConclude}
                className="w-full h-12 bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 text-base font-bold mt-2"
              >
                Confirmar Conclusão
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
