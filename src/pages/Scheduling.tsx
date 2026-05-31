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
import { ChevronRight, ChevronLeft, Check, CheckCircle2, Loader2 } from 'lucide-react'

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
    <div className="container max-w-2xl mx-auto h-screen sm:h-[calc(100vh-4rem)] py-4 sm:py-8 px-4 flex flex-col">
      <div className="mb-6 flex items-center justify-between shrink-0">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 mx-1 rounded-full transition-colors duration-300 ${step >= s ? 'bg-primary' : 'bg-secondary'}`}
          />
        ))}
      </div>

      <Card className="shadow-lg border-primary/10 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4 shrink-0">
          <CardTitle className="text-xl sm:text-2xl tracking-tight">
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

        <CardContent className="pt-6 flex-1 overflow-y-auto">
          <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            {step === 1 && (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <Label>CPF / CNPJ (Opcional)</Label>
                  <Input
                    placeholder="Apenas números"
                    value={data.cpf}
                    onChange={(e) => handleChange('cpf', e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Isso nos ajuda a encontrar seu cadastro rapidamente.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    className="h-12"
                    value={data.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Como gostaria de ser chamado"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail *</Label>
                  <Input
                    className="h-12"
                    type="email"
                    value={data.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="exemplo@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone / WhatsApp *</Label>
                  <Input
                    className="h-12"
                    value={data.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2 text-center">
                  <Label className="text-lg">Informe a placa do seu veículo</Label>
                  <Input
                    placeholder="AAA-0000"
                    className="uppercase text-3xl tracking-widest text-center h-16 mt-2"
                    value={data.plate}
                    onChange={(e) => handleChange('plate', e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Marca do Veículo</Label>
                    <Input
                      className="h-12"
                      placeholder="Ex: Honda, Toyota..."
                      value={data.brand}
                      onChange={(e) => handleChange('brand', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Input
                      className="h-12"
                      placeholder="Ex: Civic, Corolla..."
                      value={data.model}
                      onChange={(e) => handleChange('model', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ano de Fabricação</Label>
                    <Input
                      className="h-12"
                      placeholder="Ex: 2021"
                      value={data.year}
                      onChange={(e) => handleChange('year', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chassi (Opcional)</Label>
                    <Input
                      className="h-12"
                      value={data.chassis}
                      onChange={(e) => handleChange('chassis', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base">
                    Descreva brevemente o problema ou o serviço que você precisa:
                  </Label>
                  <Textarea
                    className="resize-none mt-2"
                    rows={6}
                    placeholder="Ex: Troca de óleo, barulho metálico no motor ao ligar de manhã, revisão preventiva dos 40.000km..."
                    value={data.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Selecione o Dia</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                    {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                      const dt = addDays(startOfDay(new Date()), d)
                      const dtStr = format(dt, 'yyyy-MM-dd')
                      return (
                        <Button
                          key={d}
                          variant={data.date === dtStr ? 'default' : 'outline'}
                          className={`h-16 flex-col ${data.date === dtStr ? 'shadow-md border-primary' : 'hover:border-primary/50'}`}
                          onClick={() => {
                            handleChange('date', dtStr)
                            loadSlots(dtStr)
                          }}
                        >
                          <span className="text-xs uppercase opacity-80">
                            {format(dt, 'EEE', { locale: ptBR })}
                          </span>
                          <span className="font-bold text-sm">{format(dt, 'dd/MM')}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {data.date && (
                  <div className="pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-base font-semibold">Selecione o Horário</Label>
                    {loading ? (
                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" /> Buscando horários...
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                        {availableSlots.map((time) => (
                          <Button
                            key={time}
                            variant={data.time === time ? 'default' : 'secondary'}
                            className={`h-12 ${data.time === time ? 'shadow-md' : 'hover:bg-secondary/80'}`}
                            onClick={() => handleChange('time', time)}
                          >
                            {time}
                          </Button>
                        ))}
                        {availableSlots.length === 0 && (
                          <div className="col-span-3 sm:col-span-4 bg-muted/50 p-4 rounded-md text-center border border-dashed border-border">
                            <p className="text-sm text-muted-foreground">
                              Nenhum horário disponível para a data selecionada. Por favor, escolha
                              outro dia.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 7 && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-5">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  Pedido Recebido!
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
                  Seu pré-agendamento foi registrado com sucesso. Enviamos um link de confirmação
                  para o seu e-mail/WhatsApp. <strong>Lembre-se de confirmar sua presença!</strong>
                </p>
                <div className="pt-8">
                  <Button variant="outline" onClick={() => (window.location.href = '/')}>
                    Voltar para o início
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {step < 7 && (
          <CardFooter className="flex justify-between bg-muted/10 pt-4 pb-4 shrink-0 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || loading}
              className="gap-2 w-[110px]"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </Button>

            {step === 1 ? (
              <Button onClick={searchClient} disabled={loading} className="gap-2 w-[140px]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continuar'}
                {!loading && <ChevronRight className="w-4 h-4" />}
              </Button>
            ) : step === 3 ? (
              <Button onClick={searchVehicle} disabled={loading} className="gap-2 w-[140px]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continuar'}
                {!loading && <ChevronRight className="w-4 h-4" />}
              </Button>
            ) : step === 6 ? (
              <Button
                onClick={submit}
                disabled={!data.date || !data.time || loading}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 px-6"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                {!loading && <Check className="w-4 h-4" />}
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)} className="gap-2 w-[140px]">
                Continuar <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
