import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

export default function AdminFinancialDashboard() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
  })

  const [metrics, setMetrics] = useState({
    entradasPrevistas: 0,
    saidasPrevistas: 0,
    entradasRealizadas: 0,
    saidasRealizadas: 0,
    saldoPrevisto: 0,
    saldoRealizado: 0,
    chartData: [] as any[],
  })

  useEffect(() => {
    load()
  }, [startDate, endDate])

  const load = async () => {
    const { data } = await supabase
      .from('financial_charges')
      .select('*')
      .or(
        `and(due_date.gte.${startDate},due_date.lte.${endDate}),and(payment_date.gte.${startDate},payment_date.lte.${endDate})`,
      )

    if (!data) return

    let ep = 0,
      sp = 0,
      er = 0,
      sr = 0
    const daily: Record<string, any> = {}

    const initDay = (dateStr: string) => {
      if (!daily[dateStr]) {
        daily[dateStr] = {
          name: dateStr.split('-').reverse().join('/'),
          rawDate: dateStr,
          entradasPrevistas: 0,
          saidasPrevistas: 0,
          entradasRealizadas: 0,
          saidasRealizadas: 0,
        }
      }
    }

    data.forEach((c) => {
      const type = c.type === 'receivable' ? 'entrada' : 'saida'
      const amount = Number(c.amount) || 0
      const realized = Number(c.realized_amount) || 0

      // Check Forecasted
      if (c.due_date >= startDate && c.due_date <= endDate) {
        initDay(c.due_date)
        if (type === 'entrada') {
          ep += amount
          daily[c.due_date].entradasPrevistas += amount
        } else {
          sp += amount
          daily[c.due_date].saidasPrevistas += amount
        }
      }

      // Check Realized
      if (
        (c.status === 'pago' || c.status === 'recebido') &&
        c.payment_date &&
        c.payment_date >= startDate &&
        c.payment_date <= endDate
      ) {
        initDay(c.payment_date)
        if (type === 'entrada') {
          er += realized
          daily[c.payment_date].entradasRealizadas += realized
        } else {
          sr += realized
          daily[c.payment_date].saidasRealizadas += realized
        }
      }
    })

    const chartData = Object.values(daily).sort((a, b) => a.rawDate.localeCompare(b.rawDate))

    setMetrics({
      entradasPrevistas: ep,
      saidasPrevistas: sp,
      entradasRealizadas: er,
      saidasRealizadas: sr,
      saldoPrevisto: ep - sp,
      saldoRealizado: er - sr,
      chartData,
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
          <p className="text-muted-foreground mt-1">
            Visão consolidada de fluxo de caixa (Previsto vs. Realizado).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Data Inicial</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Data Final</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entradas (Receitas)
            </CardTitle>
            <ArrowUpCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Previsto</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {metrics.entradasPrevistas.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Efetivado</p>
                <p className="text-xl font-bold text-green-600">
                  R$ {metrics.entradasRealizadas.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saídas (Despesas)
            </CardTitle>
            <ArrowDownCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Previsto</p>
                <p className="text-2xl font-bold text-orange-500">
                  R$ {metrics.saidasPrevistas.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Efetivado</p>
                <p className="text-xl font-bold text-red-600">
                  R$ {metrics.saidasRealizadas.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Líquido
            </CardTitle>
            <Wallet className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Previsto</p>
                <p
                  className={`text-2xl font-bold ${metrics.saldoPrevisto >= 0 ? 'text-primary' : 'text-red-600'}`}
                >
                  R$ {metrics.saldoPrevisto.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Efetivado</p>
                <p
                  className={`text-xl font-bold ${metrics.saldoRealizado >= 0 ? 'text-primary' : 'text-red-600'}`}
                >
                  R$ {metrics.saldoRealizado.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa Diário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ChartContainer
              config={{
                entradasPrevistas: { label: 'Entradas Previstas', color: '#3b82f6' },
                entradasRealizadas: { label: 'Entradas Realizadas', color: '#22c55e' },
                saidasPrevistas: { label: 'Saídas Previstas', color: '#f97316' },
                saidasRealizadas: { label: 'Saídas Realizadas', color: '#ef4444' },
              }}
            >
              <BarChart data={metrics.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="entradasPrevistas"
                  fill="var(--color-entradasPrevistas)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="entradasRealizadas"
                  fill="var(--color-entradasRealizadas)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="saidasPrevistas"
                  fill="var(--color-saidasPrevistas)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="saidasRealizadas"
                  fill="var(--color-saidasRealizadas)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
