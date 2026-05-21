import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOrcamentosMetrics } from '@/services/commercial-analytics'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const chartConfig = {
  value: { label: 'Quantidade', color: 'hsl(var(--primary))' },
}

const COLORS = ['#94a3b8', '#3b82f6', '#22c55e', '#ef4444', '#a855f7']

export default function OrcamentosDashboard() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    getOrcamentosMetrics().then(setMetrics)
  }, [])

  if (!metrics) return <div className="h-64 flex items-center justify-center">Carregando...</div>

  const statusData = [
    {
      name: 'Rascunho',
      value: metrics.orcamentos.filter((o: any) => o.status === 'rascunho').length,
    },
    {
      name: 'Aguardando',
      value: metrics.orcamentos.filter((o: any) => o.status === 'aguardando aprovação').length,
    },
    {
      name: 'Alterações',
      value: metrics.orcamentos.filter((o: any) => o.status === 'cliente solicita alterações')
        .length,
    },
    {
      name: 'Aprovado',
      value: metrics.orcamentos.filter((o: any) => o.status === 'aprovado').length,
    },
    {
      name: 'Pré-fechada',
      value: metrics.orcamentos.filter((o: any) => o.status === 'pré-fechada').length,
    },
    {
      name: 'Fechada',
      value: metrics.orcamentos.filter((o: any) => o.status === 'fechado').length,
    },
    {
      name: 'Rejeitado',
      value: metrics.orcamentos.filter((o: any) => o.status === 'rejeitado').length,
    },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {metrics.valor.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.taxa.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.vencidos}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos por Status</CardTitle>
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
            <CardTitle>Últimos Orçamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.orcamentos.slice(0, 5).map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.numero_orcamento}</TableCell>
                    <TableCell>{o.profiles?.name || o.clientes?.nome}</TableCell>
                    <TableCell>R$ {(o.total || 0).toFixed(2)}</TableCell>
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
