import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clock, CheckCircle2, User, Plus, Trash2, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getValidSlotsForDate,
  formatTimeShort,
  formatTime,
  parseTime,
} from '@/lib/utils/appointments'

export default function Scheduling() {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [docStr, setDocStr] = useState('')
  const [client, setClient] = useState<any>(null)
  const [reg, setReg] = useState({ name: '', email: '', phone: '', pwd: '' })
  const [srvs, setSrvs] = useState<any[]>([])
  const [selSrvId, setSelSrvId] = useState('')
  const [selSrvs, setSelSrvs] = useState<any[]>([])
  const [bizHours, setBizHours] = useState<any>(null)
  const [date, setDate] = useState<Date>()
  const [slots, setSlots] = useState<string[]>([])
  const [selTime, setSelTime] = useState('')
  const [confAppt, setConfAppt] = useState<any>(null)

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .eq('status', 'active')
      .then(({ data }) => data && setSrvs(data))
    supabase
      .from('system_data')
      .select('business_hours')
      .single()
      .then(({ data }) => data && setBizHours(data.business_hours))
  }, [])

  const fmtDoc = (e: any) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 14)
    if (v.length <= 11) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    else v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    setDocStr(v)
  }

  const checkDoc = async () => {
    const d = docStr.replace(/\D/g, '')
    if (d.length !== 11 && d.length !== 14)
      return toast({ title: 'Erro', description: 'Documento inválido', variant: 'destructive' })
    const { data } = await supabase.from('profiles').select('*').eq('document', d).maybeSingle()
    if (data) {
      if (data.status === 'active' || !data.status) {
        setClient(data)
        setStep(3)
        toast({ title: 'Sucesso', description: `Olá ${data.name}!` })
      } else toast({ title: 'Erro', description: 'Cliente inativo', variant: 'destructive' })
    } else {
      toast({ title: 'Aviso', description: 'Cadastro não encontrado.' })
      setStep(2)
    }
  }

  const doReg = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({
      email: reg.email,
      password: reg.pwd,
      options: {
        data: {
          name: reg.name,
          phone: reg.phone,
          document: docStr.replace(/\D/g, ''),
          is_client: true,
        },
      },
    })
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Verifique seu e-mail para confirmar.' })
      setStep(1)
      setDocStr('')
      setReg({ name: '', email: '', phone: '', pwd: '' })
    }
  }

  const addSrv = () => {
    const s = srvs.find((x) => x.id === selSrvId)
    if (s && !selSrvs.find((x) => x.id === s.id)) setSelSrvs([...selSrvs, s])
  }

  const tMins = selSrvs.reduce((a, s) => a + s.execution_time_minutes, 0)

  useEffect(() => {
    if (!date || !bizHours || tMins === 0) return setSlots([])

    supabase
      .from('appointments')
      .select('*')
      .eq('date', format(date, 'yyyy-MM-dd'))
      .neq('status', 'Cancelado')
      .then(({ data: appts }) => {
        if (!appts) {
          setSlots([])
          return
        }

        const validSlots = getValidSlotsForDate(date, tMins, appts as any[], bizHours)
        setSlots(validSlots.map((slot) => formatTimeShort(slot)))
        setSelTime('')
      })
  }, [date, bizHours, tMins])

  const confirm = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        date: format(date!, 'yyyy-MM-dd'),
        start_time: selTime.length === 5 ? `${selTime}:00` : selTime,
        end_time: formatTime((parseTime(selTime) || 0) + tMins),
        service_name: selSrvs.map((s) => s.name).join(', '),
        client_name: client.name,
        status: 'Pendente',
      })
      .select()
      .single()

    if (error) toast({ title: 'Erro', description: 'Falha ao agendar', variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Confirmado!' })
      setConfAppt(data)
      setStep(5)

      const dStr = docStr.replace(/\D/g, '')
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, autoriza_whatsapp, telefone_whatsapp')
        .eq('document', dStr)
        .maybeSingle()

      if (prof?.autoriza_whatsapp && prof?.telefone_whatsapp) {
        const { error: wppErr } = await supabase.functions.invoke('enviar_whatsapp', {
          body: {
            cliente_id: prof.id,
            telefone_destino: prof.telefone_whatsapp,
            tipo_mensagem: 'agendamento_confirmacao',
            variaveis: {
              cliente_nome: client.name,
              data_agendamento: format(date!, 'dd/MM/yyyy'),
              hora_agendamento: selTime,
              servico_nome: selSrvs.map((s) => s.name).join(', '),
            },
          },
        })
        if (!wppErr) {
          toast({ title: 'WhatsApp', description: 'Mensagem de confirmação enviada com sucesso!' })
        } else {
          toast({
            title: 'Aviso',
            description: 'Agendado, mas falhou ao enviar confirmação no WhatsApp.',
            variant: 'default',
          })
        }
      }
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Portal de Agendamento</h1>
        <p className="text-muted-foreground">Reserve seu horário de forma rápida</p>
      </div>

      <div className="flex justify-center space-x-4 mb-8">
        {[1, 3, 4, 5].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
            </div>
            {i < 3 && <div className={cn('w-12 h-1', step > s ? 'bg-primary' : 'bg-muted')} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="max-w-md mx-auto animate-fade-in-up">
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
            <CardDescription>Informe seu CPF/CNPJ.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={docStr} onChange={fmtDoc} placeholder="000.000.000-00" maxLength={18} />
            <Button onClick={checkDoc} className="w-full" size="lg" disabled={!docStr}>
              Continuar
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-md mx-auto animate-fade-in-up">
          <CardHeader>
            <CardTitle>Novo Cadastro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={doReg} className="space-y-4">
              <Input value={docStr} disabled />
              <Input
                required
                placeholder="Nome Completo"
                value={reg.name}
                onChange={(e) => setReg({ ...reg, name: e.target.value })}
              />
              <Input
                type="email"
                required
                placeholder="E-mail"
                value={reg.email}
                onChange={(e) => setReg({ ...reg, email: e.target.value })}
              />
              <Input
                required
                placeholder="Telefone"
                value={reg.phone}
                onChange={(e) => setReg({ ...reg, phone: e.target.value })}
              />
              <Input
                type="password"
                required
                placeholder="Senha"
                value={reg.pwd}
                onChange={(e) => setReg({ ...reg, pwd: e.target.value })}
              />
              <Button type="submit" className="w-full">
                Cadastrar e Validar E-mail
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(1)}>
                Voltar
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex gap-2">
              <User className="w-5 h-5" /> Seleção de Serviços
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-3">
              <Select value={selSrvId} onValueChange={setSelSrvId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {srvs.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} - R$ {s.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addSrv}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
            {selSrvs.length > 0 && (
              <div className="bg-muted/20 p-4 rounded-md space-y-3 border">
                {selSrvs.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-3 bg-background rounded-md shadow-sm border"
                  >
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.execution_time_minutes} min
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelSrvs(selSrvs.filter((x) => x.id !== s.id))}
                    >
                      <Trash2 className="text-destructive w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="pt-3 border-t font-bold flex justify-between">
                  <span>Total:</span>
                  <span>{tMins} min</span>
                </div>
              </div>
            )}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={() => setStep(4)} disabled={!selSrvs.length}>
                Horário
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex gap-2">
              <CalendarDays className="w-5 h-5" /> Data e Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={ptBR}
                  className="border rounded-md shadow-sm"
                  disabled={{ before: new Date() }}
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-medium flex gap-2">
                  <Clock className="w-4 h-4" /> Horários ({tMins} min)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((s) => (
                    <Button
                      key={s}
                      variant={selTime === s ? 'default' : 'outline'}
                      onClick={() => setSelTime(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-8 border-t mt-8">
              <Button variant="outline" onClick={() => setStep(3)}>
                Voltar
              </Button>
              <Button onClick={confirm} disabled={!date || !selTime}>
                Confirmar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && confAppt && (
        <Card className="max-w-md mx-auto bg-primary/5 border-primary/20 animate-fade-in-up">
          <CardHeader className="text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto text-primary mb-4" />
            <CardTitle>Confirmado!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-background p-4 rounded-md border shadow-sm space-y-2">
              <p>
                <strong>Cliente:</strong> {confAppt.client_name}
              </p>
              <p>
                <strong>Serviços:</strong> {confAppt.service_name}
              </p>
              <p>
                <strong>Data:</strong> {format(new Date(confAppt.date), 'dd/MM/yyyy')}
              </p>
              <p>
                <strong>Horário:</strong> {confAppt.start_time.substring(0, 5)} -{' '}
                {confAppt.end_time.substring(0, 5)}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => {
                setStep(1)
                setDocStr('')
                setSelSrvs([])
                setDate(undefined)
                setSelTime('')
              }}
            >
              Novo Agendamento
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
