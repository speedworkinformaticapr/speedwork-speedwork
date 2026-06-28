import { useEffect, useState } from 'react'
import { Download, TrendingUp, AlertCircle, FilePlus2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { downloadCSV } from '@/lib/utils'

export default function AdminContractReports() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeValue: 450000.0,
    expiringIn30Days: 12,
    totalAddendums: 0,
  })

  const distributionData = [
    { status: 'Ativo', value: 45 },
    { status: 'Em Revisão', value: 12 },
    { status: 'Cancelado', value: 5 },
    { status: 'Expirado', value: 8 },
  ]

  const clientData = [
    { client: 'Acme Corp', amount: 120000 },
    { client: 'Globex', amount: 85000 },
    { client: 'Initech', amount: 64000 },
    { client: 'Soylent', amount: 45000 },
    { client: 'Umbrella', amount: 32000 },
  ]

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { count: addendumsCount, error } = await supabase
        .from('contract_additives')
        .select('*', { count: 'exact', head: true })

      if (error) throw error

      setStats((prev) => ({
        ...prev,
        totalAddendums: addendumsCount || 0,
      }))
    } catch (error) {
      console.error('Error fetching report data:', error)
      setStats((prev) => ({ ...prev, totalAddendums: 0 }))
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    try {
      const csvData = distributionData.map((d) => ({
        Status: d.status,
        Quantidade: d.value,
      }))
      downloadCSV(csvData, 'relatorio_contratos.csv')
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios de Contratos</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho e a saúde dos contratos da empresa.
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Ativo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                stats.activeValue,
              )}
            </div>
            <p className="text-xs text-muted-foreground">+2.5% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencendo em 30 Dias</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringIn30Days}</div>
            <p className="text-xs text-muted-foreground">Contratos que requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aditivos Emitidos</CardTitle>
            <FilePlus2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalAddendums}</div>
            <p className="text-xs text-muted-foreground">No histórico total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="status"
                    label
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top 5 Clientes por Volume (R$)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full pt-4">
              <ChartContainer
                config={{
                  amount: {
                    label: 'Volume',
                    color: 'hsl(var(--primary))',
                  },
                }}
                className="h-full w-full"
              >
                <BarChart data={clientData} margin={{ left: 20, right: 20, bottom: 20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="client" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `R$ ${val / 1000}k`}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
