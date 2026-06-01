import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'

export function AppointmentWizardFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [data, setData] = useState({
    cpf: '',
    name: '',
    email: '',
    phone: '',
    plate: '',
    brand: '',
    model: '',
    year: '',
    chassis: '',
    description: '',
    date: '',
    time: '',
  })
  const [slots, setSlots] = useState<string[]>([])

  const loadSlots = async (selectedDate: string) => {
    setLoading(true)
    const newSlots = []
    let start = 8 * 60
    const end = 18 * 60
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
      if (!booked.includes(timeStr)) newSlots.push(timeStr)
      start += 30
    }
    setSlots(newSlots)
    setLoading(false)
  }

  const submit = async () => {
    setLoading(true)
    const { error } = await supabase.from('appointments').insert({
      client_name: data.name,
      date: data.date,
      start_time: data.time,
      end_time: data.time,
      service_name: 'Agendamento Interno',
      problema_descricao: data.description,
      vehicle_plate: data.plate,
      vehicle_brand: data.brand,
      vehicle_model: data.model,
      vehicle_year: data.year,
      status: 'Pendente',
    })
    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      setStep(7)
    }
  }

  const canProceed = () => {
    if (step === 2) return data.name && data.phone
    if (step === 3) return data.plate
    if (step === 5) return data.description
    if (step === 6) return data.date && data.time
    return true
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all"
          style={{ width: `${((step - 1) / 6) * 100}%` }}
        />
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <div
            key={s}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-background border-2 border-muted'}`}
          >
            {step > s ? <Check className="w-4 h-4" /> : s}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="font-semibold text-lg">1. Identificação</h3>
            <div className="space-y-2">
              <Label>CPF / CNPJ (Opcional)</Label>
              <Input
                value={data.cpf}
                onChange={(e) => setData({ ...data, cpf: e.target.value })}
                placeholder="Apenas números"
              />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="font-semibold text-lg">2. Contato</h3>
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone *</Label>
              <Input
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
              />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="font-semibold text-lg">3. Placa do Veículo</h3>
            <div className="space-y-2">
              <Label>Placa *</Label>
              <Input
                className="uppercase"
                value={data.plate}
                onChange={(e) => setData({ ...data, plate: e.target.value })}
                placeholder="AAA-0000"
              />
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="font-semibold text-lg">4. Detalhes do Veículo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input
                  value={data.brand}
                  onChange={(e) => setData({ ...data, brand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input
                  value={data.model}
                  onChange={(e) => setData({ ...data, model: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Input
                  value={data.year}
                  onChange={(e) => setData({ ...data, year: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Chassi</Label>
                <Input
                  value={data.chassis}
                  onChange={(e) => setData({ ...data, chassis: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="font-semibold text-lg">5. Problema</h3>
            <div className="space-y-2">
              <Label>Descrição do Problema ou Serviço *</Label>
              <Textarea
                rows={5}
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
              />
            </div>
          </div>
        )}
        {step === 6 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="font-semibold text-lg">6. Data e Hora</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Selecione o Dia</Label>
                <Input
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  value={data.date}
                  onChange={(e) => {
                    setData({ ...data, date: e.target.value, time: '' })
                    loadSlots(e.target.value)
                  }}
                />
              </div>
              {data.date && (
                <div className="space-y-2">
                  <Label>Selecione o Horário</Label>
                  {loading ? (
                    <div className="text-sm">
                      <Loader2 className="w-4 h-4 animate-spin inline" /> Buscando...
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map((t) => (
                        <Button
                          key={t}
                          type="button"
                          variant={data.time === t ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setData({ ...data, time: t })}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {step === 7 && (
          <div className="space-y-4 text-center animate-in fade-in zoom-in-95 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-2xl">Agendamento Criado!</h3>
            <p className="text-muted-foreground">
              O serviço foi agendado com sucesso e está pendente na fila.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t mt-auto">
        {step < 7 ? (
          <>
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            {step === 6 ? (
              <Button onClick={submit} disabled={!canProceed() || loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}{' '}
                Confirmar
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
                Continuar <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </>
        ) : (
          <div className="flex justify-end w-full">
            <Button onClick={onComplete}>Finalizar e Fechar</Button>
          </div>
        )}
      </div>
    </div>
  )
}
