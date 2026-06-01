import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  Edit,
  CheckCircle,
  Bell,
  Printer,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type MasterRecord = {
  id: string
  created_at: string
  description: string
  client_name: string
  total_amount: number
  paid_amount: number
  status: string
  type: string
}

type ChargeRecord = {
  id: string
  due_date: string
  description: string
  amount: number
  status: string
  parcela_numero: number | null
  parcela_total: number | null
}

export default function AdminFinancialPayments() {
  const [masterRecords, setMasterRecords] = useState<MasterRecord[]>([])
  const [charges, setCharges] = useState<ChargeRecord[]>([])
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [detailPage, setDetailPage] = useState(1)
  const itemsPerPage = 10

  const { toast } = useToast()

  useEffect(() => {
    fetchMasterRecords()
  }, [startDate, endDate])

  useEffect(() => {
    if (selectedMasterId) {
      fetchCharges(selectedMasterId)
      setDetailPage(1)
    } else {
      setCharges([])
    }
  }, [selectedMasterId])

  const fetchMasterRecords = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('financial_master_records')
        .select('*')
        .order('created_at', { ascending: false })

      if (startDate) {
        query = query.gte('created_at', `${startDate}T00:00:00Z`)
      }
      if (endDate) {
        query = query.lte('created_at', `${endDate}T23:59:59Z`)
      }

      const { data, error } = await query
      if (error) throw error
      setMasterRecords(data || [])
      setPage(1)
      setSelectedMasterId(null)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar registros',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCharges = async (masterId: string) => {
    try {
      const { data, error } = await supabase
        .from('financial_charges')
        .select('*')
        .eq('master_record_id', masterId)
        .order('due_date', { ascending: true })

      if (error) throw error
      setCharges(data || [])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar parcelas',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteMaster = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro e todas as suas parcelas?')) return

    try {
      const { error } = await supabase.from('financial_master_records').delete().eq('id', id)
      if (error) throw error

      toast({ title: 'Registro excluído com sucesso!' })
      if (selectedMasterId === id) setSelectedMasterId(null)
      fetchMasterRecords()
    } catch (error: any) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
    }
  }

  const receitas = masterRecords.filter((r) => r.type === 'receivable')
  const despesas = masterRecords.filter((r) => r.type === 'payable' || r.type === 'despesa')
  const atrasados = masterRecords.filter(
    (r) =>
      r.status === 'atrasado' || (r.status === 'pendente' && new Date(r.created_at) < new Date()),
  )

  const receitasPrevisto = receitas.reduce((sum, r) => sum + Number(r.total_amount || 0), 0)
  const receitasRealizado = receitas.reduce((sum, r) => sum + Number(r.paid_amount || 0), 0)

  const despesasPrevisto = despesas.reduce((sum, r) => sum + Number(r.total_amount || 0), 0)
  const despesasRealizado = despesas.reduce((sum, r) => sum + Number(r.paid_amount || 0), 0)

  const atrasadosPrevisto = atrasados.reduce((sum, r) => sum + Number(r.total_amount || 0), 0)
  const atrasadosRealizado = atrasados.reduce((sum, r) => sum + Number(r.paid_amount || 0), 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pago':
      case 'recebido':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
            Pago
          </Badge>
        )
      case 'pendente':
      case 'aberto':
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600/20 bg-yellow-600/10"
          >
            Pendente
          </Badge>
        )
      case 'atrasado':
        return <Badge variant="destructive">Atrasado</Badge>
      case 'parcial':
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/10">
            Parcial
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status || 'Desconhecido'}</Badge>
    }
  }

  const paginatedMasterRecords = masterRecords.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalMasterPages = Math.max(1, Math.ceil(masterRecords.length / itemsPerPage))

  const paginatedCharges = charges.slice((detailPage - 1) * itemsPerPage, detailPage * itemsPerPage)
  const totalDetailPages = Math.max(1, Math.ceil(charges.length / itemsPerPage))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-primary dark:text-emerald-500">Fluxo de Caixa</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <ArrowUpCircle className="mr-2 h-4 w-4 text-emerald-500" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 text-center">
                <div className="text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(receitasPrevisto)}
                </div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                  Previsto
                </div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex-1 text-center">
                <div className="text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(receitasRealizado)}
                </div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                  Realizado
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <ArrowDownCircle className="mr-2 h-4 w-4 text-orange-500" />
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 text-center">
                <div className="text-xl lg:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(despesasPrevisto)}
                </div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                  Previsto
                </div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex-1 text-center">
                <div className="text-xl lg:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(despesasRealizado)}
                </div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                  Realizado
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
              Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 text-center">
                <div className="text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(atrasadosPrevisto)}
                </div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                  Previsto
                </div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex-1 text-center">
                <div className="text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(atrasadosRealizado)}
                </div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                  Realizado
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 w-full sm:w-auto flex-1 max-w-[200px]">
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 w-full sm:w-auto flex-1 max-w-[200px]">
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto pb-0.5">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
                className="w-full sm:w-auto"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg">Registros Mestres</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background">
                <TableRow>
                  <TableHead className="w-[120px]">Lançamento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cliente/Parceiro</TableHead>
                  <TableHead className="text-right w-[140px]">Valor Total</TableHead>
                  <TableHead className="text-right w-[140px]">Valor Pago</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-center w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Carregando registros...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedMasterRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Nenhum registro encontrado para o período selecionado.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMasterRecords.map((record) => (
                    <TableRow
                      key={record.id}
                      onClick={() => setSelectedMasterId(record.id)}
                      className={cn(
                        'cursor-pointer transition-colors',
                        selectedMasterId === record.id
                          ? 'bg-primary/5 dark:bg-primary/10'
                          : 'hover:bg-muted/50',
                      )}
                    >
                      <TableCell className="whitespace-nowrap font-medium text-muted-foreground">
                        {formatDate(record.created_at)}
                      </TableCell>
                      <TableCell
                        className="font-medium max-w-[200px] truncate"
                        title={record.description}
                      >
                        {record.description}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate" title={record.client_name}>
                        {record.client_name || '-'}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <span
                          className={cn(
                            'font-semibold',
                            record.type === 'receivable'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-orange-600 dark:text-orange-400',
                          )}
                        >
                          {formatCurrency(record.total_amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                        {formatCurrency(record.paid_amount || 0)}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-muted"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="sr-only">Abrir menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                toast({ title: 'Editar' })
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                toast({ title: 'Validar' })
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Validar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                toast({ title: 'Notificar' })
                              }}
                            >
                              <Bell className="mr-2 h-4 w-4" /> Notificar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                toast({ title: 'Imprimir' })
                              }}
                            >
                              <Printer className="mr-2 h-4 w-4" /> Imprimir
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteMaster(record.id)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalMasterPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalMasterPages}
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalMasterPages, p + 1))}
                  disabled={page === totalMasterPages}
                >
                  Próxima <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMasterId && (
        <Card className="shadow-sm animate-fade-in-up overflow-hidden border-primary/20">
          <CardHeader className="bg-primary/5 py-4">
            <CardTitle className="text-lg flex items-center">Parcelas / Encargos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-background">
                  <TableRow>
                    <TableHead className="w-[120px]">Vencimento</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[100px]">Parcela</TableHead>
                    <TableHead className="text-right w-[140px]">Valor</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCharges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhuma parcela encontrada para este registro.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCharges.map((charge) => (
                      <TableRow key={charge.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(charge.due_date)}
                        </TableCell>
                        <TableCell
                          className="font-medium max-w-[250px] truncate"
                          title={charge.description}
                        >
                          {charge.description}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {charge.parcela_numero && charge.parcela_total
                            ? `${charge.parcela_numero} de ${charge.parcela_total}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          {formatCurrency(charge.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(charge.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {totalDetailPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                <span className="text-sm text-muted-foreground">
                  Página {detailPage} de {totalDetailPages}
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailPage((p) => Math.max(1, p - 1))}
                    disabled={detailPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailPage((p) => Math.min(totalDetailPages, p + 1))}
                    disabled={detailPage === totalDetailPages}
                  >
                    Próxima <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
