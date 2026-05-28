import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { format, addDays, startOfDay, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

export function SchedulingCalendarBlock({ data }: { data: any }) {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const [availabilities, setAvailabilities] = useState<any[]>([])

  const title = data?.title || 'Agende seu Reparo'
  const subtitle =
    data?.subtitle ||
    'Escolha o melhor horário para você e deixe o resto com nossa equipe especializada.'
  const primaryColor = data?.primaryColor || 'hsl(var(--primary))'
  const instructionText =
    data?.instructionText || 'Selecione uma data e horário para iniciar o agendamento.'

  useEffect(() => {
    const fetchAvail = async () => {
      const { data: svcs } = await supabase.from('services').select('id').limit(1)
      if (svcs && svcs.length > 0) {
        const { data: avails } = await supabase
          .from('disponibilidade_servicos')
          .select('*')
          .eq('servico_id', svcs[0].id)
          .eq('ativo', true)
        setAvailabilities(avails || [])
      }
    }
    fetchAvail()
  }, [])

  const availableTimeSlots = useMemo(() => {
    const dayOfWeek = selectedDate.getDay()
    const dayConfig = availabilities.find((a) => a.dia_semana === dayOfWeek)

    const startHourStr = dayConfig?.hora_inicio || '08:00'
    const endHourStr = dayConfig?.hora_fim || '18:00'
    const intervalMinutes = dayConfig?.intervalo_minutos || 60

    const slots = []
    const start = new Date(selectedDate)
    const [sh, sm] = startHourStr.split(':')
    start.setHours(parseInt(sh, 10), parseInt(sm, 10), 0)

    const end = new Date(selectedDate)
    const [eh, em] = endHourStr.split(':')
    end.setHours(parseInt(eh, 10), parseInt(em, 10), 0)

    let current = start
    while (current < end) {
      slots.push(format(current, 'HH:mm'))
      current = new Date(current.getTime() + intervalMinutes * 60000)
    }
    return slots
  }, [selectedDate, availabilities])

  const handleTimeClick = (time: string) => {
    navigate(`/scheduling?date=${selectedDate.toISOString()}&time=${time}`)
  }

  return (
    <section className="py-16 md:py-24 bg-background w-full">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: primaryColor }}>
            {title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start bg-card rounded-2xl p-6 md:p-8 shadow-sm border">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-xl flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" style={{ color: primaryColor }} />
                Escolha a Data
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                  const date = addDays(startOfDay(new Date()), offset)
                  const isSelected = isSameDay(date, selectedDate)
                  return (
                    <button
                      key={offset}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        'p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1',
                        isSelected ? 'ring-2 ring-offset-2' : 'hover:bg-muted',
                      )}
                      style={
                        isSelected
                          ? {
                              borderColor: primaryColor,
                              backgroundColor: primaryColor,
                              color: '#fff',
                            }
                          : {}
                      }
                    >
                      <span className="text-xs font-medium uppercase">
                        {format(date, 'EEE', { locale: ptBR })}
                      </span>
                      <span className="text-lg font-bold">{format(date, 'dd')}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">{instructionText}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-xl flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" style={{ color: primaryColor }} />
              Horários Disponíveis
            </h3>
            {availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableTimeSlots.map((time) => (
                  <Button
                    key={time}
                    variant="outline"
                    className="hover:border-primary hover:text-primary transition-colors"
                    onClick={() => handleTimeClick(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-muted rounded-lg border border-dashed">
                <p className="text-muted-foreground">Nenhum horário disponível para esta data.</p>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => navigate('/scheduling')}
                variant="ghost"
                className="gap-2 text-primary"
              >
                Ver todos os horários <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
