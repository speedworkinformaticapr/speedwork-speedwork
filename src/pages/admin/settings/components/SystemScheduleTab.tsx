import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

const DAYS = [
  { id: '1', label: 'Segunda-feira' },
  { id: '2', label: 'Terça-feira' },
  { id: '3', label: 'Quarta-feira' },
  { id: '4', label: 'Quinta-feira' },
  { id: '5', label: 'Sexta-feira' },
  { id: '6', label: 'Sábado' },
  { id: '0', label: 'Domingo' },
]

export function SystemScheduleTab({ form }: { form: UseFormReturn<any> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários de Funcionamento</CardTitle>
        <CardDescription>Defina os dias e horários de abertura e fechamento.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="business_hours"
          render={({ field }) => {
            let schedule: Record<string, { isOpen: boolean; open: string; close: string }> = {}
            try {
              schedule = JSON.parse(field.value || '{}')
            } catch {
              /* intentionally ignored */
            }

            const updateDay = (
              dayId: string,
              data: Partial<{ isOpen: boolean; open: string; close: string }>,
            ) => {
              const current = schedule[dayId] || { isOpen: false, open: '08:00', close: '18:00' }
              const newSchedule = { ...schedule, [dayId]: { ...current, ...data } }
              field.onChange(JSON.stringify(newSchedule))
            }

            return (
              <div className="space-y-4">
                {DAYS.map((day) => {
                  const dayData = schedule[day.id] || {
                    isOpen: false,
                    open: '08:00',
                    close: '18:00',
                  }
                  return (
                    <div
                      key={day.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg bg-card transition-all"
                    >
                      <div className="flex items-center gap-3 w-48 shrink-0">
                        <Switch
                          checked={dayData.isOpen}
                          onCheckedChange={(c) => updateDay(day.id, { isOpen: !!c })}
                        />
                        <span className="font-medium">{day.label}</span>
                      </div>

                      {dayData.isOpen ? (
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-16">Abertura</span>
                            <Input
                              type="time"
                              value={dayData.open}
                              onChange={(e) => updateDay(day.id, { open: e.target.value })}
                              className="w-32"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-16 text-right">
                              Fecho
                            </span>
                            <Input
                              type="time"
                              value={dayData.close}
                              onChange={(e) => updateDay(day.id, { close: e.target.value })}
                              className="w-32"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic flex-1 pl-2">
                          Fechado
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t mt-6">
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value || 30}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
