import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { format, addDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronRight, ChevronLeft, Check, CheckCircle2 } from 'lucide-react'

export default function Scheduling() {
  const [step, setStep] = useState(1)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState({
    cpf: '',
    name: '',
    email: '',
    phone: '',
    plate: '',
    chassis: '',
    brand: '',
    model: '',
    year: '',
    description: '',
    date: '',
    time: '',
  })

  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [intervalMins, setIntervalMins] = useState(30)

  useEffect(() => {
    supabase
      .from('system_data')
      .select('scheduling_interval_minutes')
      .single()
      .then(({ data }) => {
        if (data?.scheduling_interval_minutes) setIntervalMins(data.scheduling_interval_minutes)
      })
  }, [])

  const handleChange = (field: string, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const searchClient = async () => {
    if (!data.cpf) return setStep(2)
    setLoading(true)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('cpf_cnpj', data.cpf)
      .maybeSingle()
    if (profile) {
      setData((p) => ({
        ...p,
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      }))
      toast({ title: 'Cliente encontrado!', description: 'Dados preenchidos automaticamente.' })
    }
    setLoading(false)
    setStep(2)
  }

  const searchVehicle = async () => {
    if (!data.plate) return setStep(4)
    setLoading(true)
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('*, vehicle_brands(name), vehicle_models(name)')
      .eq('plate', data.plate)
      .maybeSingle()
    if (vehicle) {
      setData((p) => ({
        ...p,
        chassis: vehicle.chassis || '',
        brand: vehicle.vehicle_brands?.name || '',
        model: vehicle.vehicle_models?.name || '',
        year: vehicle.manufacturing_year?.toString() || '',
      }))
      toast({ title: 'Veículo encontrado!', description: 'Dados preenchidos automaticamente.' })
    }
    setLoading(false)
    setStep(4)
  }

  const loadSlots = async (selectedDate: string) => {
    setLoading(true)
    const slots = []
    let start = 8 * 60 // 8:00
    const end = 18 * 60 // 18:00

    const { data: existing } = await supabase
      .from('appointments')
      .select('start_time')
      .eq('date', selectedDate)
    const booked = existing?.map((a) => a.start_time.substring(0, 5)) || []

    while (start < end) {
      const h = Math.floor(start / 60)
        .toString()
        .padStart(2, '0')
      const m = (start % 60).toString().padStart(2, '0')
      const timeStr = `${h}:${m}`
      if (!booked.includes(timeStr)) slots.push(timeStr)
      start += intervalMins
    }
    setAvailableSlots(slots)
    setLoading(false)
  }

  const submit = async () => {
    setLoading(true)
    const { data: apt, error } = await supabase
      .from('appointments')
      .insert({
        client_name: data.name,
        date: data.date,
        start_time: data.time,
        end_time: data.time,
        service_name: 'Agendamento Site',
        problema_descricao: data.description,
        vehicle_plate: data.plate,
        vehicle_brand: data.brand,
        vehicle_model: data.model,
        vehicle_year: data.year,
        status: 'Pendente Confirmação',
      })
      .select()
      .single()

    if (!error && apt) {
      await supabase.functions.invoke('enviar_whatsapp', {
        body: {
          empresa_id: '00000000-0000-0000-0000-000000000001',
          tipo_mensagem: 'confirmacao_agendamento',
          telefone_destino: data.phone,
          mensagem_customizada: `Olá ${data.name}, recebemos seu pedido de agendamento para o dia ${format(new Date(data.date), 'dd/MM/yyyy')} às ${data.time}. Confirme sua presença acessando: ${window.location.origin}/agendar/${apt.id}`,
        },
      })
    }

    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      setStep(7)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8 flex items-center justify-between">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 mx-1 rounded-full ${step >= s ? 'bg-primary' : 'bg-secondary'}`}
          />
        ))}
      </div>

      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-primary/5 pb-6">
          <CardTitle className="text-2xl">
            {step === 1 && '1. Identificação'}
            {step === 2 && '2. Seus Dados de Contato'}
            {step === 3 && '3. Placa do Veículo'}
            {step === 4 && '4. Detalhes do Veículo'}
            {step === 5 && '5. Qual o problema?'}
            {step === 6 && '6. Data e Hora'}
            {step === 7 && '7. Agendamento Solicitado!'}
          </CardTitle>
          <CardDescription>
            {step < 7 && 'Preencha as informações para agendar seu serviço de forma rápida.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {step === 1 && (
            <div className="space-y-4">
              <Label>CPF / CNPJ (Opcional)</Label>
              <Input
                placeholder="Apenas números"
                value={data.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Nome Completo</Label>
                <Input value={data.name} onChange={(e) => handleChange('name', e.target.value)} />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label>Telefone / WhatsApp</Label>
                <Input value={data.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>Placa do Veículo</Label>
              <Input
                placeholder="AAA-0000"
                className="uppercase text-xl tracking-widest"
                value={data.plate}
                onChange={(e) => handleChange('plate', e.target.value)}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label>Marca</Label>
                <Input value={data.brand} onChange={(e) => handleChange('brand', e.target.value)} />
              </div>
              <div>
                <Label>Modelo</Label>
                <Input value={data.model} onChange={(e) => handleChange('model', e.target.value)} />
              </div>
              <div>
                <Label>Ano</Label>
                <Input value={data.year} onChange={(e) => handleChange('year', e.target.value)} />
              </div>
              <div>
                <Label>Chassi (Opcional)</Label>
                <Input
                  value={data.chassis}
                  onChange={(e) => handleChange('chassis', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <Label>Descreva o problema ou serviço desejado</Label>
              <Textarea
                rows={5}
                placeholder="Ex: Troca de óleo, barulho no motor..."
                value={data.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div>
                <Label>Selecione a Data</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                    const dt = addDays(startOfDay(new Date()), d)
                    const dtStr = format(dt, 'yyyy-MM-dd')
                    return (
                      <Button
                        key={d}
                        variant={data.date === dtStr ? 'default' : 'outline'}
                        className="h-16 flex-col"
                        onClick={() => {
                          handleChange('date', dtStr)
                          loadSlots(dtStr)
                        }}
                      >
                        <span className="text-xs uppercase">
                          {format(dt, 'EEE', { locale: ptBR })}
                        </span>
                        <span className="font-bold">{format(dt, 'dd/MM')}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {data.date && (
                <div>
                  <Label>Selecione o Horário</Label>
                  {loading ? (
                    <p className="text-sm text-muted-foreground mt-2">
                      Buscando disponibilidade...
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {availableSlots.map((time) => (
                        <Button
                          key={time}
                          variant={data.time === time ? 'default' : 'secondary'}
                          onClick={() => handleChange('time', time)}
                        >
                          {time}
                        </Button>
                      ))}
                      {availableSlots.length === 0 && (
                        <p className="text-sm text-muted-foreground col-span-4">
                          Nenhum horário disponível nesta data.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in fade-in zoom-in">
              <CheckCircle2 className="w-20 h-20 text-green-500" />
              <h2 className="text-2xl font-bold">Pedido Recebido!</h2>
              <p className="text-muted-foreground">
                Seu pré-agendamento foi realizado. Enviamos um link de confirmação para o seu
                e-mail/WhatsApp. Lembre-se de confirmar sua presença!
              </p>
            </div>
          )}
        </CardContent>

        {step < 7 && (
          <CardFooter className="flex justify-between bg-muted/20 pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>

            {step === 1 ? (
              <Button onClick={searchClient} disabled={loading}>
                Continuar <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : step === 3 ? (
              <Button onClick={searchVehicle} disabled={loading}>
                Continuar <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : step === 6 ? (
              <Button
                onClick={submit}
                disabled={!data.date || !data.time || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirmar Agendamento <Check className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)}>
                Continuar <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
