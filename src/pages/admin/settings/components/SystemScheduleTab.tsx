import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

const DAYS = [
  { id: 'monday', label: 'Segunda-feira' },
  { id: 'tuesday', label: 'Terça-feira' },
  { id: 'wednesday', label: 'Quarta-feira' },
  { id: 'thursday', label: 'Quinta-feira' },
  { id: 'friday', label: 'Sexta-feira' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
]

const DEFAULT_DAY = {
  active: false,
  open: '08:00',
  close: '18:00',
  has_lunch_break: false,
  lunch_start: '12:00',
  lunch_end: '13:00',
}

export function SystemScheduleTab({ form }: { form: UseFormReturn<any> }) {
  const businessHoursStr = form.watch('business_hours')

  let schedule: Record<string, typeof DEFAULT_DAY & { day?: string }> = {}
  try {
    schedule = JSON.parse(businessHoursStr || '{}')
  } catch (e) {
    // ignore
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const updateDay = (dayId: string, field: string, value: any) => {
    const newSchedule = { ...schedule }
    if (!newSchedule[dayId]) {
      newSchedule[dayId] = {
        ...DEFAULT_DAY,
        day: capitalize(dayId),
      }
    }

    newSchedule[dayId] = { ...newSchedule[dayId], [field]: value }
    form.setValue('business_hours', JSON.stringify(newSchedule, null, 2), { shouldDirty: true })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Agendamento</CardTitle>
          <CardDescription>
            Defina os parâmetros gerais para agendamentos no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="scheduling_interval_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intervalo de Agendamento (minutos)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Duração padrão dos blocos de horário para agendamento.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horários de Funcionamento</CardTitle>
          <CardDescription>
            Configure os dias, horários e intervalos de almoço em que o negócio está aberto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {DAYS.map((day) => {
            const dayData = schedule[day.id] || { ...DEFAULT_DAY, day: capitalize(day.id) }
            const active = dayData.active ?? false
            const hasLunch = dayData.has_lunch_break ?? false

            let timeError = ''
            if (active) {
              if (dayData.open >= dayData.close)
                timeError = 'O fechamento deve ser após a abertura.'
              else if (hasLunch) {
                if (dayData.lunch_start < dayData.open)
                  timeError = 'O almoço não pode começar antes da abertura.'
                else if (dayData.lunch_end > dayData.close)
                  timeError = 'O almoço não pode terminar após o fechamento.'
                else if (dayData.lunch_start >= dayData.lunch_end)
                  timeError = 'O fim do almoço deve ser após o início.'
              }
            }

            return (
              <div key={day.id} className="flex flex-col space-y-3">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-4 w-full md:w-1/4 mt-2 md:mt-0">
                    <Switch
                      checked={active}
                      onCheckedChange={(val) => updateDay(day.id, 'active', val)}
                    />
                    <span className="font-medium">{day.label}</span>
                  </div>

                  {active ? (
                    <div className="flex flex-col flex-1 gap-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground w-16">Abertura</span>
                          <Input
                            type="time"
                            className="w-32"
                            value={dayData.open || '08:00'}
                            onChange={(e) => updateDay(day.id, 'open', e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground w-16 text-right md:text-left">
                            Fechamento
                          </span>
                          <Input
                            type="time"
                            className="w-32"
                            value={dayData.close || '18:00'}
                            onChange={(e) => updateDay(day.id, 'close', e.target.value)}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={hasLunch}
                            onCheckedChange={(val) => updateDay(day.id, 'has_lunch_break', val)}
                          />
                          <span className="text-sm font-medium">Intervalo de Almoço</span>
                        </div>

                        {hasLunch && (
                          <div className="flex flex-wrap items-center gap-4 md:pl-12">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground w-16">Início</span>
                              <Input
                                type="time"
                                className="w-32"
                                value={dayData.lunch_start || '12:00'}
                                onChange={(e) => updateDay(day.id, 'lunch_start', e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground w-16 text-right md:text-left">
                                Fim
                              </span>
                              <Input
                                type="time"
                                className="w-32"
                                value={dayData.lunch_end || '13:00'}
                                onChange={(e) => updateDay(day.id, 'lunch_end', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {timeError && (
                        <p className="text-sm text-destructive font-medium">{timeError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 text-sm text-muted-foreground mt-2 md:mt-0">Fechado</div>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <FormField
        control={form.control}
        name="business_hours"
        render={({ field }) => (
          <FormItem className="hidden">
            <FormControl>
              <Input {...field} value={field.value || ''} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}
