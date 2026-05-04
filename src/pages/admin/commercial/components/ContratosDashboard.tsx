import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getContratosMetrics } from '@/services/commercial-analytics'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const chartConfig = {
  value: { label: 'Quantidade', color: 'hsl(var(--primary))' },
}

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#f97316', '#94a3b8']

export default function ContratosDashboard() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    getContratosMetrics().then(setMetrics)
  }, [])

  if (!metrics) return <div className="h-64 flex items-center justify-center">Carregando...</div>

  const statusData = [
    { name: 'Ativo', value: metrics.contratos.filter((o: any) => o.status === 'ativo').length },
    { name: 'Pausado', value: metrics.contratos.filter((o: any) => o.status === 'pausado').length },
    {
      name: 'Cancelado',
      value: metrics.contratos.filter((o: any) => o.status === 'cancelado').length,
    },
    {
      name: 'Expirado',
      value: metrics.contratos.filter((o: any) => o.status === 'expirado').length,
    },
    {
      name: 'Rascunho',
      value: metrics.contratos.filter((o: any) => o.status === 'rascunho').length,
    },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.ativos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {metrics.mrr.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Retenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.retencao.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Próximos a Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{metrics.proximosVencer}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contratos por Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximas Cobranças</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Próxima</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.contratos
                  .filter((o: any) => o.status === 'ativo')
                  .sort(
                    (a: any, b: any) =>
                      new Date(a.data_proxima_cobranca).getTime() -
                      new Date(b.data_proxima_cobranca).getTime(),
                  )
                  .slice(0, 5)
                  .map((o: any) => (
                    <TableRow key={o.id}>
                      <TableCell>{o.numero_contrato}</TableCell>
                      <TableCell>
                        {o.data_proxima_cobranca?.split('-').reverse().join('/')}
                      </TableCell>
                      <TableCell>R$ {(o.valor_ciclo || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
