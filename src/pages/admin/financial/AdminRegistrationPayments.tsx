import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2, RefreshCw, CreditCard, QrCode } from 'lucide-react'
import { format } from 'date-fns'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell } from 'recharts'

export default function AdminRegistrationPayments() {
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('registration_payments' as any)
        .select('*')
        .order('data_criacao', { ascending: false })

      if (error) throw error
      setPayments(data || [])
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Erro ao carregar pagamentos', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReprocess = async (id: string, paymentIntentId: string) => {
    setIsProcessing(id)
    try {
      await new Promise((r) => setTimeout(r, 1000))

      const { error } = await supabase
        .from('registration_payments' as any)
        .update({ status: 'succeeded', data_pagamento: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      toast({ title: 'Pagamento reprocessado com sucesso' })
      fetchPayments()
    } catch (err: any) {
      toast({ title: 'Erro ao reprocessar', variant: 'destructive' })
    } finally {
      setIsProcessing(null)
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (typeFilter !== 'all' && p.entity_type !== typeFilter) return false
    return true
  })

  const successCount = payments.filter((p) => p.status === 'succeeded').length
  const pendingCount = payments.filter((p) => p.status === 'pending').length
  const failedCount = payments.filter((p) => p.status === 'failed').length

  const chartData = [
    { name: 'Sucesso', value: successCount, fill: 'hsl(var(--primary))' },
    { name: 'Pendente', value: pendingCount, fill: '#F59E0B' },
    { name: 'Falha', value: failedCount, fill: '#EF4444' },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-500">Pago</Badge>
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>
      case 'pending':
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            Pendente
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pagamentos de Inscrição</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe o histórico financeiro dos novos cadastros na plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="succeeded">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="failed">Falha</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de Inscrição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="athlete">Atletas</SelectItem>
                  <SelectItem value="club">Clubes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhum pagamento encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(new Date(payment.data_criacao), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            {payment.entity_type === 'athlete' ? 'Atleta' : 'Clube'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {payment.metodo_pagamento === 'card' ? (
                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <QrCode className="w-4 h-4 text-muted-foreground" />
                              )}
                              {payment.metodo_pagamento === 'card' ? 'Cartão' : 'Pix'}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.valor)}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-right">
                            {payment.status === 'failed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleReprocess(payment.id, payment.payment_intent_id)
                                }
                                disabled={isProcessing === payment.id}
                              >
                                {isProcessing === payment.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                )}
                                Reprocessar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Taxa de sucesso de inscrições</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="h-[250px] w-full">
                <ChartContainer
                  config={{
                    succeeded: { label: 'Sucesso', color: 'hsl(var(--primary))' },
                    pending: { label: 'Pendente', color: '#F59E0B' },
                    failed: { label: 'Falha', color: '#EF4444' },
                  }}
                  className="mx-auto aspect-square h-[250px]"
                >
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                Sem dados
              </div>
            )}

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Processado</span>
                <span className="font-medium">{payments.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sucesso</span>
                <span className="font-medium text-green-600">{successCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pendentes</span>
                <span className="font-medium text-orange-500">{pendingCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
