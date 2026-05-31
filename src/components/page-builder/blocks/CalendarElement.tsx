import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ptBR } from 'date-fns/locale'

export function CalendarElement() {
  const [dates, setDates] = useState<Date[]>([])

  useEffect(() => {
    supabase
      .from('appointments')
      .select('date')
      .then(({ data }) => {
        if (data) {
          const uniqueDates = Array.from(new Set(data.map((d) => d.date))).map((d) => new Date(d))
          setDates(uniqueDates)
        }
      })
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-center">Disponibilidade da Oficina</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <Calendar
          mode="multiple"
          selected={dates}
          locale={ptBR}
          className="rounded-md border shadow-sm"
          modifiers={{ booked: dates }}
          modifiersStyles={{
            booked: { fontWeight: 'bold', backgroundColor: 'var(--primary)', color: 'white' },
          }}
        />
      </CardContent>
    </Card>
  )
}
