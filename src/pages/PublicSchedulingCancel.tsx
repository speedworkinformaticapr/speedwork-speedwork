import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, CheckCircle } from 'lucide-react'

export default function PublicSchedulingCancel() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [appt, setAppt] = useState<any>(null)
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    if (id) loadData()
  }, [id])

  const loadData = async () => {
    const { data } = await supabase.from('appointments').select('*').eq('id', id).single()
    setAppt(data)
    if (data?.status === 'Cancelado') setCancelled(true)
    setLoading(false)
  }

  const handleCancel = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'Cancelado' })
      .eq('id', id)
    setLoading(false)

    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível cancelar.', variant: 'destructive' })
    } else {
      setCancelled(true)
      toast({ title: 'Cancelado', description: 'Seu agendamento foi cancelado com sucesso.' })
    }
  }

  if (loading)
    return <div className="flex h-screen items-center justify-center">Processando...</div>
  if (!appt)
    return (
      <div className="flex h-screen items-center justify-center">Agendamento não encontrado.</div>
    )

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full animate-fade-in-up border-none shadow-xl text-center overflow-hidden">
        {cancelled ? (
          <>
            <div className="bg-red-500 p-8 flex flex-col items-center justify-center text-white">
              <CheckCircle className="w-20 h-20 mb-4" />
              <CardTitle className="text-2xl">Agendamento Cancelado</CardTitle>
            </div>
            <CardContent className="p-8">
              <p className="text-muted-foreground mb-6">O horário foi liberado com sucesso.</p>
              <Button onClick={() => navigate('/')} className="w-full">
                Página Inicial
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <div className="bg-primary/5 p-8 flex flex-col items-center justify-center">
              <XCircle className="w-20 h-20 mb-4 text-primary" />
              <CardTitle className="text-2xl">Confirmar Cancelamento</CardTitle>
            </div>
            <CardContent className="p-8">
              <p className="text-lg mb-6">
                Deseja realmente cancelar o agendamento de <strong>{appt.service_name}</strong>?
              </p>
              <div className="flex flex-col gap-3">
                <Button variant="destructive" size="lg" onClick={handleCancel}>
                  Sim, Cancelar
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/')}>
                  Manter Agendamento
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
