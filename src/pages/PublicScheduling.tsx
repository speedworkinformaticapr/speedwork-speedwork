import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2, Calendar, Clock, Car, User } from 'lucide-react'
import { format } from 'date-fns'

export default function PublicScheduling() {
  const { id } = useParams()
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) setAppointment(data)
          setLoading(false)
        })
    }
  }, [id])

  const confirm = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'Confirmado pelo Cliente' })
      .eq('id', id)
    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Confirmado!', description: 'Seu agendamento foi confirmado com sucesso.' })
      setAppointment({ ...appointment, status: 'Confirmado pelo Cliente' })
    }
  }

  if (loading) return <div className="p-12 text-center">Carregando agendamento...</div>
  if (!appointment)
    return (
      <div className="p-12 text-center text-red-500">
        Agendamento não encontrado ou link inválido.
      </div>
    )

  return (
    <div className="container max-w-lg mx-auto py-12 px-4">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="text-center bg-primary/5 pb-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Confirmação de Agendamento</CardTitle>
          <CardDescription>
            Revise os dados abaixo e confirme sua presença para liberar o box
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{appointment.client_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Veículo</p>
              <p className="font-medium uppercase">
                {appointment.vehicle_plate || 'N/A'} - {appointment.vehicle_brand}{' '}
                {appointment.vehicle_model}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-medium">{format(new Date(appointment.date), 'dd/MM/yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Horário</p>
              <p className="font-medium">{appointment.start_time.substring(0, 5)}</p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-semibold mb-1">Status Atual do Serviço:</p>
            <p className="text-primary font-bold">{appointment.status}</p>
          </div>

          {appointment.status === 'Pendente Confirmação' ? (
            <Button className="w-full h-12 text-lg" onClick={confirm} disabled={loading}>
              <CheckCircle2 className="w-5 h-5 mr-2" /> Confirmar Minha Presença
            </Button>
          ) : (
            <div className="text-center p-4 bg-green-50 text-green-700 rounded-lg font-medium flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 mr-2" /> Agendamento já confirmado na oficina!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
