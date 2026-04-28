import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

const daysOfWeek = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const

export function BusinessHoursTab({ form }: { form: any }) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <CardTitle>Horários de Funcionamento</CardTitle>
        </div>
        <CardDescription>
          Configure os horários de abertura, fechamento e intervalo de almoço para cada dia da
          semana. Estes horários serão utilizados para validar os agendamentos no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {daysOfWeek.map((day) => {
            const isOpenPath = `business_hours.${day.key}.is_open`
            const isOpen = form.watch(isOpenPath)

            return (
              <div
                key={day.key}
                className="p-4 border rounded-lg bg-card/50 transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                  <div className="min-w-[150px]">
                    <FormField
                      control={form.control}
                      name={isOpenPath}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="text-base font-medium m-0 cursor-pointer">
                            {day.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {isOpen ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 animate-fade-in">
                      <FormField
                        control={form.control}
                        name={`business_hours.${day.key}.open_time`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">
                              Abertura
                            </FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`business_hours.${day.key}.close_time`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">
                              Fechamento
                            </FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`business_hours.${day.key}.lunch_start`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">
                              Início Almoço
                            </FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`business_hours.${day.key}.lunch_end`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">
                              Fim Almoço
                            </FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center text-sm text-muted-foreground italic">
                      Fechado neste dia
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
