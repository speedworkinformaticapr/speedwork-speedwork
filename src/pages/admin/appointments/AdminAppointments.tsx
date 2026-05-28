import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { supabase } from '@/lib/supabase/client'
import { NewAppointmentDialog } from './components/NewAppointmentDialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Check, Clock, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AdminAppointments() {
  const [date, setDate] = useState<Date>(new Date())
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [date])

  const fetchAppointments = async () => {
    setLoading(true)
    const dateStr = date.toISOString().split('T')[0]
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', dateStr)
      .order('start_time')

    if (data) setAppointments(data)
    setLoading(false)
  }

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id)
    if (!error) {
      fetchAppointments()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-muted/10">
      <div className="flex items-center justify-between p-6 border-b bg-background shrink-0 shadow-sm z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a disponibilidade e os serviços diários.
          </p>
        </div>
        <NewAppointmentDialog onCreated={fetchAppointments} />
      </div>

      <div className="flex-1 overflow-hidden p-6 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[350px] shrink-0 border rounded-xl p-4 bg-background flex flex-col h-full overflow-y-auto shadow-sm">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && setDate(d)}
            locale={ptBR}
            className="mx-auto"
          />
        </div>

        <div className="flex-1 border rounded-xl bg-background flex flex-col h-full overflow-hidden shadow-sm">
          <div className="p-4 border-b shrink-0 bg-muted/20">
            <h2 className="text-lg font-semibold capitalize">
              {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-12 animate-pulse">
                Carregando agendamentos...
              </p>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground pb-12">
                <Clock className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Nenhum agendamento</p>
                <p className="text-sm">Não há serviços marcados para este dia.</p>
              </div>
            ) : (
              appointments.map((app) => (
                <div
                  key={app.id}
                  className="p-5 border rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-card shadow-sm hover:shadow transition-shadow"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-lg">
                        {app.start_time.substring(0, 5)} - {app.end_time.substring(0, 5)}
                      </span>
                      <Badge
                        variant={
                          app.status === 'Pré Agendado'
                            ? 'secondary'
                            : app.status === 'Agendado'
                              ? 'default'
                              : 'outline'
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground text-base">{app.client_name}</p>
                      <p className="text-sm text-muted-foreground font-medium">
                        {app.service_name}
                      </p>
                    </div>
                    {app.problema_descricao && (
                      <div className="mt-3 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border-l-2 border-primary italic">
                        "{app.problema_descricao}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 sm:mt-1">
                    {app.status === 'Pré Agendado' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                          onClick={() => updateStatus(app.id, 'Agendado')}
                        >
                          <Check className="w-4 h-4 mr-1.5" /> Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => updateStatus(app.id, 'Cancelado')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
