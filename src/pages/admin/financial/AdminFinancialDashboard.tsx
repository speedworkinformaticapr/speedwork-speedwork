import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

export default function AdminFinancialDashboard() {
  const [metrics, setMetrics] = useState({
    entradas: 0,
    saidas: 0,
    saldo: 0,
    chartData: [] as any[],
  })

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase.from('lancamentos_financeiros').select('*')
    if (!data) return

    let entradas = 0
    let saidas = 0
    const monthly: Record<string, any> = {}

    data.forEach((l) => {
      const val = Number(l.valor) || 0
      const date = new Date(l.data_lancamento || l.created_at || new Date())
      const monthYear = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`

      if (!monthly[monthYear]) monthly[monthYear] = { name: monthYear, entradas: 0, saidas: 0 }

      if (l.tipo === 'entrada') {
        entradas += val
        monthly[monthYear].entradas += val
      } else {
        saidas += val
        monthly[monthYear].saidas += val
      }
    })

    const chartData = Object.values(monthly).sort((a, b) => a.name.localeCompare(b.name))

    setMetrics({
      entradas,
      saidas,
      saldo: entradas - saidas,
      chartData,
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">
          Visão consolidada de fluxo de caixa (entradas vs. saídas).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Entradas
            </CardTitle>
            <ArrowUpCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {metrics.entradas.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Saídas
            </CardTitle>
            <ArrowDownCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {metrics.saidas.toFixed(2).replace('.', ',')}
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
            <div
              className={`text-2xl font-bold ${metrics.saldo >= 0 ? 'text-primary' : 'text-red-600'}`}
            >
              R$ {metrics.saldo.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa (Mensal)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ChartContainer
              config={{
                entradas: { label: 'Entradas', color: 'hsl(var(--primary))' },
                saidas: { label: 'Saídas', color: 'hsl(var(--destructive))' },
              }}
            >
              <BarChart data={metrics.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="entradas" fill="var(--color-entradas)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saidas" fill="var(--color-saidas)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
