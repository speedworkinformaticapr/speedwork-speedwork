import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const MOCK_CATALOG_SERVICES = [
  { id: 'srv-1', name: 'Consultoria Financeira', base_price: 1500 },
  { id: 'srv-2', name: 'Auditoria Contábil', base_price: 3000 },
  { id: 'srv-3', name: 'Planejamento Tributário', base_price: 2000 },
]

export const MOCK_CATALOG_PRODUCTS = [
  { id: 'prod-1', name: 'Sistema ERP', price: 5000 },
  { id: 'prod-2', name: 'Licença Anual', price: 1200 },
  { id: 'prod-3', name: 'Treinamento Equipe', price: 800 },
]

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const loadData = async () => {
    setLoading(true)
    let query = supabase
      .from('orcamentos')
      .select(`*, profiles:cliente_id(name)`)
      .order('data_emissao', { ascending: false })

    if (dateRange?.from) {
      query = query.gte('data_emissao', format(dateRange.from, 'yyyy-MM-dd'))
    }
    if (dateRange?.to) {
      query = query.lte('data_emissao', format(dateRange.to, 'yyyy-MM-dd'))
    }

    const { data } = await query
    setQuotes(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [dateRange])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <DateRangePicker date={dateRange} setDate={setDateRange} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum orçamento encontrado para o período.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Data Emissão</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.numero_orcamento}</TableCell>
                      <TableCell>
                        {format(new Date(q.data_emissao), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{q.profiles?.name || '-'}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(q.total || 0)}
                      </TableCell>
                      <TableCell>{q.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
