import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContractsNav } from './ContractsNav'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']

export default function AdminContractReports() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('contratos')
      .select('*, profiles!contratos_cliente_id_fkey(name)')
      .then(({ data: res }) => setData(res || []))
  }, [])

  const statusData = [
    { name: 'Ativo', value: data.filter((d) => d.status === 'ativo').length },
    { name: 'Rascunho', value: data.filter((d) => d.status === 'rascunho').length },
    { name: 'Em Assinatura', value: data.filter((d) => d.status === 'Em Assinatura').length },
    { name: 'Expirado', value: data.filter((d) => d.status === 'expirado').length },
  ].filter((d) => d.value > 0)

  const chartConfig = {
    value: { label: 'Quantidade', color: 'hsl(var(--primary))' },
  }

  const monthlyData = data
    .reduce((acc, curr) => {
      if (!curr.created_at) return acc
      const month = new Date(curr.created_at).toLocaleString('pt-BR', {
        month: 'short',
        year: 'numeric',
      })
      const existing = acc.find((a: any) => a.month === month)
      if (existing) existing.count += 1
      else acc.push({ month, count: 1 })
      return acc
    }, [])
    .slice(-6)

  return (
    <div className="space-y-6">
      <ContractsNav />

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios Gerenciais</h2>
        <Button onClick={() => window.print()} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 print:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
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
            <CardTitle>Contratos Criados (Últimos Meses)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{ count: { label: 'Contratos', color: 'hsl(var(--primary))' } }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Clientes (Por Volume de Contratos)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente/Entidade</TableHead>
                <TableHead className="text-right">Qtd. Contratos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(
                data.reduce(
                  (acc, curr) => {
                    const name = curr.profiles?.name || 'Desconhecido'
                    acc[name] = (acc[name] || 0) + 1
                    return acc
                  },
                  {} as Record<string, number>,
                ),
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell className="text-right font-medium">{count as number}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
