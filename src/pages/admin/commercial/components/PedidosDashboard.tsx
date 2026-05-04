import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPedidosMetrics } from '@/services/commercial-analytics'
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

const COLORS = ['#eab308', '#3b82f6', '#a855f7', '#6366f1', '#22c55e', '#ef4444']

export default function PedidosDashboard() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    getPedidosMetrics().then(setMetrics)
  }, [])

  if (!metrics) return <div className="h-64 flex items-center justify-center">Carregando...</div>

  const statusData = [
    { name: 'Pendente', value: metrics.pedidos.filter((o: any) => o.status === 'pendente').length },
    {
      name: 'Confirmado',
      value: metrics.pedidos.filter((o: any) => o.status === 'confirmado').length,
    },
    { name: 'Produção', value: metrics.pedidos.filter((o: any) => o.status === 'producao').length },
    { name: 'Enviado', value: metrics.pedidos.filter((o: any) => o.status === 'enviado').length },
    { name: 'Entregue', value: metrics.pedidos.filter((o: any) => o.status === 'entregue').length },
    {
      name: 'Cancelado',
      value: metrics.pedidos.filter((o: any) => o.status === 'cancelado').length,
    },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
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
            <CardTitle className="text-sm font-medium">Entrega no Prazo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.taxaEntrega.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.atrasados}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Status</CardTitle>
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
            <CardTitle>Últimos Pedidos</CardTitle>
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
                {metrics.pedidos.slice(0, 5).map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.numero_pedido}</TableCell>
                    <TableCell>{o.clientes?.nome}</TableCell>
                    <TableCell>R$ {(o.valor_total || 0).toFixed(2)}</TableCell>
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
