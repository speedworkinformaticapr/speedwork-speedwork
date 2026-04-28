import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Download, Search, CreditCard, QrCode } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AdminStripePayments() {
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('stripe_payments' as any)
        .select('*, athletes(name)')
        .order('data_criacao', { ascending: false })

      if (error) throw error
      setPayments(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let result = payments
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter)
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      result = result.filter(
        (p) =>
          p.payment_intent_id?.toLowerCase().includes(lower) ||
          p.athletes?.name?.toLowerCase().includes(lower),
      )
    }
    return result
  }, [payments, searchTerm, statusFilter])

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Atleta,Valor,Metodo,Status,Data Criacao,Data Pagamento\n' +
      filtered
        .map(
          (e) =>
            `${e.payment_intent_id},${e.athletes?.name || '-'},${e.valor},${e.metodo_pagamento},${e.status},${e.data_criacao},${e.data_pagamento || ''}`,
        )
        .join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'historico_pagamentos.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('pt-BR')
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Pagamentos</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe as transações processadas via Cartão e Pix.
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Processado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                payments
                  .filter((p) => p.status === 'succeeded')
                  .reduce((acc, curr) => acc + curr.valor, 0),
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transações Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {payments.filter((p) => p.status === 'succeeded').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transações Pendentes/Falhas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {payments.filter((p) => p.status !== 'succeeded').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <CardTitle>Transações</CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="succeeded">Concluído</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="failed">Falha</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por atleta ou ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atleta</TableHead>
                <TableHead>ID da Transação</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Data Pagamento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.athletes?.name || '-'}</TableCell>
                    <TableCell className="text-xs font-mono">{payment.payment_intent_id}</TableCell>
                    <TableCell>
                      {payment.metodo_pagamento === 'card' ? (
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" /> Cartão
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <QrCode className="w-4 h-4 mr-2" /> Pix
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.valor)}</TableCell>
                    <TableCell className="text-sm">{formatDate(payment.data_criacao)}</TableCell>
                    <TableCell className="text-sm">{formatDate(payment.data_pagamento)}</TableCell>
                    <TableCell>
                      {payment.status === 'succeeded' ? (
                        <Badge className="bg-green-500">Concluído</Badge>
                      ) : payment.status === 'failed' ? (
                        <Badge variant="destructive">Falhou</Badge>
                      ) : (
                        <Badge className="bg-yellow-500 text-black">Pendente</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
