import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ArrowRight } from 'lucide-react'

export function StepSlotSelection({ data, onChange, onNext }: any) {
  const [date, setDate] = useState<Date>(data.date || new Date())
  const [slots, setSlots] = useState<{ time: string; available: boolean; endTime: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadSlots() {
      setLoading(true)
      const dateStr = date.toISOString().split('T')[0]
      const [{ data: sys }, { data: apps }] = await Promise.all([
        supabase
          .from('system_data')
          .select('scheduling_interval_minutes')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .single(),
        supabase.from('appointments').select('start_time, end_time').eq('date', dateStr),
      ])

      const interval = sys?.scheduling_interval_minutes || 30
      const generated = []

      for (let h = 8; h <= 18; h++) {
        for (let m = 0; m < 60; m += interval) {
          if (h === 18 && m > 0) continue
          const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`

          let endM = m + interval
          let endH = h
          if (endM >= 60) {
            endH += Math.floor(endM / 60)
            endM = endM % 60
          }
          const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`

          const isAvailable = !apps?.some((app) => {
            const s = app.start_time.substring(0, 5)
            const e = app.end_time.substring(0, 5)
            return time >= s && time < e
          })

          generated.push({ time, endTime, available: isAvailable })
        }
      }
      setSlots(generated)
      setLoading(false)
      onChange({ ...data, date, startTime: '', endTime: '' })
    }
    loadSlots()
  }, [date])

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col lg:flex-row gap-10 mb-8">
        <div className="shrink-0 flex flex-col w-full lg:w-auto mx-auto lg:mx-0">
          <p className="font-semibold text-foreground mb-4 w-full text-center lg:text-left text-lg">
            1. Escolha a Data
          </p>
          <div className="border rounded-2xl bg-card p-3 shadow-sm mx-auto">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              locale={ptBR}
            />
          </div>
        </div>

        <div className="flex-1">
          <p className="font-semibold text-foreground mb-4 text-center lg:text-left text-lg capitalize">
            2. Horários para {format(date, "d 'de' MMMM", { locale: ptBR })}
          </p>
          <div className="border rounded-2xl bg-card p-6 shadow-sm min-h-[340px]">
            {loading ? (
              <div className="flex items-center justify-center h-full min-h-[250px]">
                <p className="text-muted-foreground animate-pulse text-lg">
                  Buscando disponibilidade...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {slots.map((s) => (
                  <Button
                    key={s.time}
                    variant={data.startTime === s.time ? 'default' : 'outline'}
                    disabled={!s.available}
                    className={cn(
                      'w-full h-14 text-base font-medium transition-all',
                      !s.available && 'opacity-30 grayscale cursor-not-allowed',
                      data.startTime === s.time &&
                        'shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 z-10',
                    )}
                    onClick={() => onChange({ ...data, startTime: s.time, endTime: s.endTime })}
                  >
                    {s.time}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t flex justify-end">
        <Button
          size="lg"
          disabled={!data.startTime}
          onClick={onNext}
          className="w-full sm:w-auto shadow-sm"
        >
          Continuar <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
