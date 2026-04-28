import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  CalendarDays,
  Clock,
  MapPin,
  XCircle,
  CheckCircle2,
  QrCode,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type FutureAppt = {
  id: string
  date: string
  time: string
  service: string
  location: string
  status: string
}
type CompletedAppt = {
  id: string
  date: string
  service: string
  imageUrl: string
  price: number
  isPaid: boolean
}

const MOCK_FUTURE: FutureAppt[] = [
  {
    id: 'f1',
    date: '25/05/2026',
    time: '10:00',
    service: 'Consultoria de Campo',
    location: 'Campo Principal',
    status: 'Confirmado',
  },
  {
    id: 'f2',
    date: '28/05/2026',
    time: '14:30',
    service: 'Manutenção Preventiva',
    location: 'Setor Sul',
    status: 'Aguardando Staff',
  },
  {
    id: 'f3',
    date: '02/06/2026',
    time: '09:00',
    service: 'Treinamento Tático',
    location: 'Área Vip',
    status: 'Confirmado',
  },
]

const MOCK_COMPLETED: CompletedAppt[] = [
  {
    id: 'c1',
    date: '10/05/2026',
    service: 'Auditoria de Regras',
    imageUrl: 'https://img.usecurling.com/p/300/200?q=golf%20rules',
    price: 200,
    isPaid: false,
  },
  {
    id: 'c2',
    date: '05/05/2026',
    service: 'Consultoria Premium',
    imageUrl: 'https://img.usecurling.com/p/300/200?q=golf%20course',
    price: 500,
    isPaid: true,
  },
]

export default function ClientDashboard() {
  const [future, setFuture] = useState(MOCK_FUTURE)
  const [completed, setCompleted] = useState(MOCK_COMPLETED)

  const handleCancel = (id: string) => {
    setFuture((xs) => xs.filter((x) => x.id !== id))
    toast.success('Agendamento cancelado com sucesso.')
  }

  const handlePay = (id: string) => {
    setCompleted((xs) => xs.map((x) => (x.id === id ? { ...x, isPaid: true } : x)))
    toast.success('Pagamento PIX simulado com sucesso!')
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight mb-2">Painel do Cliente</h1>
        <p className="text-muted-foreground">
          Gerencie seus próximos agendamentos e histórico de serviços.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left: Future Appointments */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#1B7D3A]" /> Próximos Agendamentos
          </h2>
          <div className="space-y-4">
            {future.length === 0 ? (
              <p className="text-muted-foreground bg-muted/30 p-6 rounded-xl border text-center">
                Não há serviços agendados.
              </p>
            ) : (
              future.map((a) => (
                <div
                  key={a.id}
                  className="bg-white p-5 rounded-xl border border-border shadow-sm group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-[#1B7D3A] transition-colors">
                        {a.service}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> {a.location}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {a.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg mt-4">
                    <div className="flex gap-4 text-sm font-bold text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" /> {a.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-muted-foreground" /> {a.time}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(a.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1 h-8"
                    >
                      <XCircle className="w-4 h-4" /> Cancelar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right: Completed Services & Billing */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#1B7D3A]" /> Serviços Concluídos
          </h2>
          <div className="space-y-4">
            {completed.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-5"
              >
                <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 relative group">
                  <img src={c.imageUrl} alt={c.service} className="w-full h-full object-cover" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <ImageIcon className="text-white w-6 h-6" />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl p-0 border-none bg-transparent shadow-none">
                      <img
                        src={c.imageUrl}
                        alt="Serviço Concluído"
                        className="w-full h-auto rounded-xl"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base">{c.service}</h3>
                      <span className="text-xs font-medium text-muted-foreground">{c.date}</span>
                    </div>
                    <p className="text-sm font-black text-gray-900 mt-1">
                      R$ {c.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="mt-3">
                    {c.isPaid ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pagamento Confirmado
                      </span>
                    ) : (
                      <Button
                        onClick={() => handlePay(c.id)}
                        size="sm"
                        className="w-full sm:w-auto bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 gap-1.5"
                      >
                        <QrCode className="w-4 h-4" /> Pagar com PIX
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
