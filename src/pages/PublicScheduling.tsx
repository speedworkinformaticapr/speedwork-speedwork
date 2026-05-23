import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { format, addMinutes, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Clock, CalendarDays, Download, ChevronLeft } from 'lucide-react'

export default function PublicScheduling() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [service, setService] = useState<any>(null)
  const [fields, setFields] = useState<any[]>([])
  const [availability, setAvailability] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>('')
  const [formData, setFormData] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmedAppt, setConfirmedAppt] = useState<any>(null)

  useEffect(() => {
    if (id) loadServiceData()
  }, [id])

  const loadServiceData = async () => {
    const { data: srv } = await supabase.from('services').select('*').eq('id', id).single()
    if (!srv) {
      toast({ title: 'Serviço não encontrado', variant: 'destructive' })
      navigate('/')
      return
    }
    setService(srv)

    const [fRes, aRes] = await Promise.all([
      supabase.from('campos_agendamento').select('*').eq('servico_id', id).order('ordem'),
      supabase.from('disponibilidade_servicos').select('*').eq('servico_id', id).eq('ativo', true),
    ])
    if (fRes.data) setFields(fRes.data)
    if (aRes.data) setAvailability(aRes.data)
  }

  useEffect(() => {
    if (date) loadAppointmentsForDate(date)
  }, [date])

  const loadAppointmentsForDate = async (d: Date) => {
    const dStr = format(d, 'yyyy-MM-dd')
    const { data } = await supabase
      .from('appointments')
      .select('start_time, duracao_minutos')
      .eq('date', dStr)
      .neq('status', 'Cancelado')

    setAppointments(data || [])
    setTime('')
  }

  const getAvailableSlots = () => {
    if (!date || !service || !availability.length) return []
    const dayOfWeek = date.getDay()
    const dayAvails = availability.filter((a) => a.dia_semana === dayOfWeek)

    if (!dayAvails.length) return []

    const slots: string[] = []
    const execMin =
      parseInt(service.exec_time?.split(':')[1] || '0') +
      parseInt(service.exec_time?.split(':')[0] || '0') * 60
    const marginMin = service.margin_time || 0
    const totalMin = execMin + marginMin

    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const currentMin = now.getHours() * 60 + now.getMinutes()

    dayAvails.forEach((av) => {
      let current = parse(av.hora_inicio, 'HH:mm:ss', date)
      const end = parse(av.hora_fim, 'HH:mm:ss', date)
      const interval = av.intervalo_minutos || 30

      while (addMinutes(current, totalMin) <= end) {
        const slotTimeStr = format(current, 'HH:mm')
        const slotMin = current.getHours() * 60 + current.getMinutes()

        if (isToday && slotMin <= currentMin) {
          current = addMinutes(current, interval)
          continue
        }

        let overlap = false
        for (const app of appointments) {
          const appStartMin =
            parseInt(app.start_time.split(':')[0]) * 60 + parseInt(app.start_time.split(':')[1])
          const appEndMin = appStartMin + app.duracao_minutos

          const proposedStart = slotMin
          const proposedEnd = slotMin + totalMin

          if (
            (proposedStart >= appStartMin && proposedStart < appEndMin) ||
            (proposedEnd > appStartMin && proposedEnd <= appEndMin) ||
            (proposedStart <= appStartMin && proposedEnd >= appEndMin)
          ) {
            overlap = true
            break
          }
        }

        if (!overlap) slots.push(slotTimeStr)
        current = addMinutes(current, interval)
      }
    })

    return Array.from(new Set(slots)).sort()
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const execMin =
      parseInt(service.exec_time?.split(':')[1] || '0') +
      parseInt(service.exec_time?.split(':')[0] || '0') * 60
    const endDateTime = addMinutes(parse(time, 'HH:mm', date!), execMin)

    const payload = {
      date: format(date!, 'yyyy-MM-dd'),
      start_time: `${time}:00`,
      end_time: format(endDateTime, 'HH:mm:00'),
      service_name: service.title,
      client_name: formData['nome_completo'] || formData['nome'] || 'Cliente Web',
      status: 'Pendente',
      dados_coleta: formData,
      duracao_minutos: execMin + (service.margin_time || 0),
    }

    const { data, error } = await supabase.from('appointments').insert([payload]).select().single()

    setIsSubmitting(false)

    if (error) {
      toast({
        title: 'Erro ao agendar',
        description: 'O horário pode não estar mais disponível.',
        variant: 'destructive',
      })
      loadAppointmentsForDate(date!)
    } else {
      setConfirmedAppt(data)
      setStep(3)
      sendConfirmationEmail(data)
    }
  }

  const generateICSContent = (appt: any) => {
    const start = new Date(`${appt.date}T${appt.start_time}`)
    const end = new Date(`${appt.date}T${appt.end_time}`)
    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Speedwork//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${appt.id}@speedwork.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${service.title}
DESCRIPTION:Agendamento de ${service.title}\\n\\nPara cancelar, acesse: ${window.location.origin}/agendar/cancelar/${appt.id}
END:VEVENT
END:VCALENDAR`
  }

  const sendConfirmationEmail = async (appt: any) => {
    const emailField = fields.find((f) => f.tipo_campo === 'email')?.nome_campo
    const email = emailField ? formData[emailField] : null

    if (!email) return

    const icsContent = generateICSContent(appt)
    const base64Ics = btoa(unescape(encodeURIComponent(icsContent)))

    await supabase.functions.invoke('send-email', {
      body: {
        type: 'custom',
        email: email,
        name: appt.client_name,
        subject: `Confirmação de Agendamento - ${service.title}`,
        html: `<h2>Agendamento Confirmado!</h2><p>Você tem um horário marcado para <strong>${service.title}</strong> no dia <strong>${format(new Date(appt.date), 'dd/MM/yyyy')}</strong> às <strong>${appt.start_time.substring(0, 5)}</strong>.</p><p>Em anexo o arquivo de calendário.</p><p>Para cancelar, clique <a href="${window.location.origin}/agendar/cancelar/${appt.id}">aqui</a>.</p>`,
        attachments: [
          {
            filename: 'agendamento.ics',
            content: base64Ics,
            mimetype: 'text/calendar',
          },
        ],
      },
    })
  }

  const downloadICS = () => {
    if (!confirmedAppt) return
    const ics = generateICSContent(confirmedAppt)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'agendamento.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!service)
    return <div className="flex h-screen items-center justify-center">Carregando...</div>

  const availableSlots = getAvailableSlots()

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">{service.title}</h1>
          <p className="text-muted-foreground">{service.description}</p>
        </div>

        {step === 1 && (
          <Card className="animate-fade-in-up border-none shadow-lg">
            <CardHeader className="bg-primary/5 pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CalendarDays className="w-6 h-6 text-primary" /> 1. Escolha a Data e Horário
              </CardTitle>
              <CardDescription>Selecione o melhor momento para o seu atendimento.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 -mt-4 bg-card rounded-b-xl">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="flex flex-col items-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={ptBR}
                    disabled={{ before: new Date() }}
                    className="border rounded-xl shadow-sm p-4 bg-background"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Horários Disponíveis
                  </Label>
                  {!date ? (
                    <div className="p-8 text-center border border-dashed rounded-xl bg-muted/50 text-muted-foreground">
                      Selecione uma data no calendário
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-xl bg-orange-50 text-orange-600">
                      Nenhum horário disponível para esta data.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {availableSlots.map((s) => (
                        <Button
                          key={s}
                          variant={time === s ? 'default' : 'outline'}
                          className={
                            time === s
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'hover:border-primary/50'
                          }
                          onClick={() => setTime(s)}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-8 pt-6 border-t flex justify-end">
                <Button
                  size="lg"
                  disabled={!date || !time}
                  onClick={() => setStep(2)}
                  className="px-8 shadow-md"
                >
                  Continuar <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="animate-fade-in-up border-none shadow-lg">
            <CardHeader className="bg-primary/5 pb-8">
              <CardTitle className="text-2xl">2. Seus Dados</CardTitle>
              <CardDescription>Preencha as informações necessárias para o serviço.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 -mt-4 bg-card rounded-b-xl">
              <form onSubmit={handleBook} className="space-y-6">
                {fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-base">
                      {field.label}{' '}
                      {field.obrigatorio && <span className="text-destructive">*</span>}
                    </Label>

                    {field.tipo_campo === 'textarea' ? (
                      <Textarea
                        required={field.obrigatorio}
                        placeholder={field.placeholder}
                        value={formData[field.nome_campo] || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, [field.nome_campo]: e.target.value })
                        }
                        className="bg-background"
                      />
                    ) : field.tipo_campo === 'select' ? (
                      <Select
                        required={field.obrigatorio}
                        value={formData[field.nome_campo] || ''}
                        onValueChange={(v) => setFormData({ ...formData, [field.nome_campo]: v })}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder={field.placeholder || 'Selecione...'} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.opcoes.map((op: string) => (
                            <SelectItem key={op} value={op}>
                              {op}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={
                          field.tipo_campo === 'email'
                            ? 'email'
                            : field.tipo_campo === 'numero'
                              ? 'number'
                              : field.tipo_campo === 'data'
                                ? 'date'
                                : 'text'
                        }
                        required={field.obrigatorio}
                        placeholder={field.placeholder}
                        value={formData[field.nome_campo] || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, [field.nome_campo]: e.target.value })
                        }
                        className="bg-background h-12"
                      />
                    )}
                  </div>
                ))}

                <div className="bg-muted/30 p-4 rounded-xl border flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold block text-primary">{service.title}</span>
                    <span className="text-muted-foreground">
                      {format(date!, 'dd/MM/yyyy')} às {time}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">R$ {service.sale_value?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} size="lg">
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="px-8 shadow-md"
                  >
                    {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && confirmedAppt && (
          <Card className="animate-fade-in-up border-none shadow-lg text-center overflow-hidden">
            <div className="bg-green-500 p-8 flex flex-col items-center justify-center text-white">
              <CheckCircle2 className="w-20 h-20 mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold">Agendamento Confirmado!</h2>
            </div>
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground mb-6">
                Sua reserva foi concluída com sucesso. Enviamos os detalhes para o seu e-mail.
              </p>

              <div className="bg-muted/30 border rounded-xl p-6 mb-8 text-left space-y-3 inline-block min-w-full md:min-w-[400px]">
                <p>
                  <span className="text-muted-foreground">Serviço:</span>{' '}
                  <strong className="float-right">{service.title}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Data:</span>{' '}
                  <strong className="float-right">
                    {format(new Date(confirmedAppt.date), 'dd/MM/yyyy')}
                  </strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Horário:</span>{' '}
                  <strong className="float-right">
                    {confirmedAppt.start_time.substring(0, 5)}
                  </strong>
                </p>
                {service.sale_value > 0 && (
                  <p>
                    <span className="text-muted-foreground">Valor:</span>{' '}
                    <strong className="float-right">R$ {service.sale_value.toFixed(2)}</strong>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onClick={downloadICS}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                >
                  <Download className="w-5 h-5 mr-2" /> Adicionar ao Calendário
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/')}>
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
