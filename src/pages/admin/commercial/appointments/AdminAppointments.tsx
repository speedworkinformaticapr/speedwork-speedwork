import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutGrid, List } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getAppointments, updateAppointment, Appointment } from '@/services/appointments'
import { AppointmentGrid } from './AppointmentGrid'
import { AppointmentCards } from './AppointmentCards'
import { AppointmentWizard } from './AppointmentWizard'

export default function AdminAppointments() {
  const [view, setView] = useState('grid')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAppointments()
      setAppointments(data)
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStart = async (app: Appointment) => {
    try {
      await updateAppointment(app.id, { status: 'Em Andamento' })
      toast({
        title: 'Sucesso',
        description: 'Atendimento iniciado. Redirecionando para orçamentos...',
      })

      navigate('/admin/commercial/quotes/new', {
        state: {
          cliente_id: app.cliente_id,
          client_name: app.client_name,
          veiculo_placa: app.vehicle_plate,
          veiculo_brand: app.vehicle_brand,
          veiculo_model: app.vehicle_model,
          problema_descricao: app.problema_descricao,
          appointment_id: app.id,
        },
      })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o agendamento',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os agendamentos e inicie atendimentos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={view} onValueChange={setView} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">
                <List className="w-4 h-4 mr-2" /> Tabela
              </TabsTrigger>
              <TabsTrigger value="cards">
                <LayoutGrid className="w-4 h-4 mr-2" /> Cards
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <AppointmentWizard onComplete={loadData} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground border rounded-lg bg-background">
          Carregando agendamentos...
        </div>
      ) : view === 'grid' ? (
        <AppointmentGrid appointments={appointments} onStart={handleStart} onReload={loadData} />
      ) : (
        <AppointmentCards appointments={appointments} onStart={handleStart} onReload={loadData} />
      )}
    </div>
  )
}
