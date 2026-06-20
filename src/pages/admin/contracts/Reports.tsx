import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Printer } from 'lucide-react'

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#94a3b8']

export default function Reports() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('contratos')
      .select('*, profiles:cliente_id(name)')
      .then(({ data }) => setData(data || []))
  }, [])

  const statusCount = data.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.keys(statusCount).map((k) => ({
    name: k.toUpperCase(),
    value: statusCount[k],
  }))

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="print:hidden flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Relatórios Jurídicos</h1>
        <Button onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="print:shadow-none print:border-black">
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((_, i) => (
                    <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-black">
          <CardHeader>
            <CardTitle>Total Cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary">{data.length}</div>
              <div className="text-xl text-muted-foreground mt-2">Contratos na Base</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Vencendo em 30 dias', days: 30, color: 'text-red-600' },
          { label: 'Vencendo em 60 dias', days: 60, color: 'text-orange-600' },
          { label: 'Vencendo em 90 dias', days: 90, color: 'text-yellow-600' },
        ].map((block) => {
          const expiring = data.filter((c) => {
            if (!c.data_fim) return false
            const d = Math.ceil(
              (new Date(c.data_fim).getTime() - new Date().getTime()) / (1000 * 3600 * 24),
            )
            return d > block.days - 30 && d <= block.days
          })

          return (
            <Card key={block.days} className="print:shadow-none print:border-black">
              <CardHeader>
                <CardTitle className={`text-lg ${block.color}`}>{block.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiring.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum contrato neste período.</p>
                  ) : (
                    expiring.map((c) => (
                      <div
                        key={c.id}
                        className="flex justify-between items-center border-b pb-2 text-sm"
                      >
                        <div>
                          <p className="font-medium">{c.numero_contrato}</p>
                          <p className="text-xs text-muted-foreground">{c.profiles?.name}</p>
                        </div>
                        <div className="font-bold">{new Date(c.data_fim).toLocaleDateString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="print:shadow-none print:border-black">
        <CardHeader>
          <CardTitle>Listagem Consolidada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 font-bold border-b pb-2 mb-2">
            <div>Número</div>
            <div>Entidade</div>
            <div>Vencimento</div>
            <div>Status</div>
          </div>
          {data.slice(0, 10).map((c) => (
            <div key={c.id} className="grid grid-cols-4 py-2 border-b text-sm">
              <div>{c.numero_contrato}</div>
              <div>{c.profiles?.name}</div>
              <div>{c.data_fim ? new Date(c.data_fim).toLocaleDateString() : '-'}</div>
              <div className="capitalize">{c.status}</div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Exibindo os 10 mais recentes...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
