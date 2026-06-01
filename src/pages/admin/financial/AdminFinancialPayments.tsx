import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/use-translation'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminFinancialPayments() {
  const { t } = useTranslation()

  const [masterRecords, setMasterRecords] = useState<any[]>([])
  const [masterTotal, setMasterTotal] = useState(0)
  const [masterPage, setMasterPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loadingMaster, setLoadingMaster] = useState(false)

  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null)

  const [detailRecords, setDetailRecords] = useState<any[]>([])
  const [detailTotal, setDetailTotal] = useState(0)
  const [detailPage, setDetailPage] = useState(0)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [indicators, setIndicators] = useState({
    receitas: 0,
    despesas: 0,
    pendente: 0,
    atrasado: 0,
  })

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setMasterPage(0)
    }, 500)
    return () => clearTimeout(handler)
  }, [search])

  useEffect(() => {
    fetchMasterRecords()
  }, [debouncedSearch, masterPage])

  useEffect(() => {
    if (selectedMasterId) {
      setDetailPage(0)
      fetchDetailRecords(selectedMasterId, 0)
    } else {
      setDetailRecords([])
      setDetailTotal(0)
    }
  }, [selectedMasterId])

  useEffect(() => {
    if (selectedMasterId) {
      fetchDetailRecords(selectedMasterId, detailPage)
    }
  }, [detailPage])

  useEffect(() => {
    fetchIndicators()
  }, [])

  const fetchMasterRecords = async () => {
    setLoadingMaster(true)
    try {
      let query = supabase.from('financial_master_records').select('*', { count: 'exact' })

      if (debouncedSearch) {
        query = query.or(
          `description.ilike.%${debouncedSearch}%,client_name.ilike.%${debouncedSearch}%`,
        )
      }

      query = query
        .order('created_at', { ascending: false })
        .range(masterPage * ITEMS_PER_PAGE, (masterPage + 1) * ITEMS_PER_PAGE - 1)

      const { data, count, error } = await query
      if (error) throw error

      setMasterRecords(data || [])
      setMasterTotal(count || 0)
    } catch (error) {
      console.error('Error fetching master records:', error)
    } finally {
      setLoadingMaster(false)
    }
  }

  const fetchDetailRecords = async (masterId: string, page: number) => {
    setLoadingDetail(true)
    try {
      const { data, count, error } = await supabase
        .from('financial_charges')
        .select('*', { count: 'exact' })
        .eq('master_record_id', masterId)
        .order('due_date', { ascending: true })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)

      if (error) throw error

      setDetailRecords(data || [])
      setDetailTotal(count || 0)
    } catch (error) {
      console.error('Error fetching detail records:', error)
    } finally {
      setLoadingDetail(false)
    }
  }

  const fetchIndicators = async () => {
    try {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

      const { data, error } = await supabase
        .from('financial_master_records')
        .select('total_amount, paid_amount, status, type')
        .gte('created_at', startOfMonth)

      if (error) throw error

      const ind = { receitas: 0, despesas: 0, pendente: 0, atrasado: 0 }

      data?.forEach((record) => {
        const val = Number(record.total_amount || 0)
        if (record.type === 'receivable') ind.receitas += val
        if (record.type === 'payable') ind.despesas += val
        if (record.status === 'pendente') ind.pendente += val
        if (record.status === 'atrasado') ind.atrasado += val
      })

      setIndicators(ind)
    } catch (error) {
      console.error('Error fetching indicators:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('pt-BR').format(
      new Date(date.getTime() + date.getTimezoneOffset() * 60000),
    )
  }

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || ''
    if (s === 'pago' || s === 'recebido')
      return (
        <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/30">
          {t('status.paid', 'Pago')}
        </Badge>
      )
    if (s === 'pendente' || s === 'aberto')
      return (
        <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 hover:bg-amber-500/30">
          {t('status.pending', 'Pendente')}
        </Badge>
      )
    if (s === 'atrasado')
      return (
        <Badge className="bg-rose-500/20 text-rose-500 border-rose-500/30 hover:bg-rose-500/30">
          {t('status.overdue', 'Atrasado')}
        </Badge>
      )
    if (s === 'parcial')
      return (
        <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 hover:bg-blue-500/30">
          {t('status.partial', 'Parcial')}
        </Badge>
      )
    return (
      <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-slate-500/30">
        {status}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('financial.cashFlow', 'Fluxo de Caixa')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('financial.cashFlowDesc', 'Gerencie registros mestres e suas parcelas.')}
          </p>
        </div>
        <Link to="/admin/financial/payments/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            {t('financial.newRecord', 'Novo Registro')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border-border/50 p-4 flex flex-col justify-center gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs uppercase tracking-wider font-semibold">
              {t('financial.revenue', 'Receitas')}
            </span>
          </div>
          <span className="text-lg font-bold text-emerald-500">
            {formatCurrency(indicators.receitas)}
          </span>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-border/50 p-4 flex flex-col justify-center gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span className="text-xs uppercase tracking-wider font-semibold">
              {t('financial.expenses', 'Despesas')}
            </span>
          </div>
          <span className="text-lg font-bold text-rose-500">
            {formatCurrency(indicators.despesas)}
          </span>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-border/50 p-4 flex flex-col justify-center gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs uppercase tracking-wider font-semibold">
              {t('financial.pending', 'Pendente')}
            </span>
          </div>
          <span className="text-lg font-bold text-amber-500">
            {formatCurrency(indicators.pendente)}
          </span>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-border/50 p-4 flex flex-col justify-center gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="text-xs uppercase tracking-wider font-semibold">
              {t('financial.overdue', 'Atrasado')}
            </span>
          </div>
          <span className="text-lg font-bold text-rose-500">
            {formatCurrency(indicators.atrasado)}
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
        {/* Master Grid */}
        <Card className="xl:col-span-7 flex flex-col bg-card/40 backdrop-blur-md border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="p-4 border-b border-border/50 bg-muted/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('financial.masterRecords', 'Registros Mestres')}
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.search', 'Buscar...')}
                  className="pl-8 h-9 bg-background/50 border-border/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <div className="flex-1 overflow-auto relative">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur shadow-sm border-b border-border/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                    {t('common.description', 'Descrição')}
                  </TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                    {t('common.client', 'Cliente')}
                  </TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground text-right">
                    {t('common.amount', 'Valor')}
                  </TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground text-center">
                    {t('common.status', 'Status')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingMaster ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      {t('common.loading', 'Carregando...')}
                    </TableCell>
                  </TableRow>
                ) : masterRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      {t('common.noData', 'Nenhum registro encontrado')}
                    </TableCell>
                  </TableRow>
                ) : (
                  masterRecords.map((row) => (
                    <TableRow
                      key={row.id}
                      onClick={() => setSelectedMasterId(row.id)}
                      className={cn(
                        'cursor-pointer transition-colors border-border/30',
                        selectedMasterId === row.id
                          ? 'bg-primary/10 hover:bg-primary/15'
                          : 'hover:bg-muted/40',
                      )}
                    >
                      <TableCell className="font-medium">
                        <div className="truncate max-w-[200px]" title={row.description}>
                          {row.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="truncate max-w-[150px]" title={row.client_name}>
                          {row.client_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(row.total_amount)}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(row.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between p-3 border-t border-border/50 bg-muted/10">
            <div className="text-xs text-muted-foreground">
              {t('common.showing', 'Mostrando')}{' '}
              {masterRecords.length > 0 ? masterPage * ITEMS_PER_PAGE + 1 : 0} {t('common.to', 'a')}{' '}
              {Math.min((masterPage + 1) * ITEMS_PER_PAGE, masterTotal)} {t('common.of', 'de')}{' '}
              {masterTotal}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-background/50"
                onClick={() => setMasterPage((p) => Math.max(0, p - 1))}
                disabled={masterPage === 0 || loadingMaster}
              >
                {t('common.previous', 'Anterior')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-background/50"
                onClick={() =>
                  setMasterPage((p) => Math.min(Math.ceil(masterTotal / ITEMS_PER_PAGE) - 1, p + 1))
                }
                disabled={
                  masterPage >= Math.ceil(masterTotal / ITEMS_PER_PAGE) - 1 || loadingMaster
                }
              >
                {t('common.next', 'Próxima')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Detail Grid */}
        <Card className="xl:col-span-5 flex flex-col bg-card/40 backdrop-blur-md border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="p-4 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t('financial.installments', 'Parcelas & Cobranças')}
            </CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-auto relative bg-background/30">
            {!selectedMasterId ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70 p-6 text-center">
                <ArrowRight className="w-12 h-12 mb-4 text-muted-foreground/30" />
                <p>
                  {t(
                    'financial.selectMasterToViewDetails',
                    'Selecione um registro mestre na tabela ao lado para visualizar suas parcelas.',
                  )}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur shadow-sm border-b border-border/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                      {t('common.dueDate', 'Vencimento')}
                    </TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground text-right">
                      {t('common.amount', 'Valor')}
                    </TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground text-center">
                      {t('common.status', 'Status')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingDetail ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                        {t('common.loading', 'Carregando...')}
                      </TableCell>
                    </TableRow>
                  ) : detailRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                        {t('common.noData', 'Nenhum detalhe encontrado')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    detailRecords.map((row) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-muted/30 border-border/30 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {formatDate(row.due_date)}
                          {row.description && (
                            <div
                              className="text-xs text-muted-foreground mt-0.5 truncate max-w-[120px]"
                              title={row.description}
                            >
                              {row.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(row.amount)}
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(row.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          {selectedMasterId && (
            <div className="flex items-center justify-between p-3 border-t border-border/50 bg-muted/10">
              <div className="text-xs text-muted-foreground">
                {detailRecords.length > 0 ? detailPage * ITEMS_PER_PAGE + 1 : 0} -{' '}
                {Math.min((detailPage + 1) * ITEMS_PER_PAGE, detailTotal)} / {detailTotal}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 bg-background/50"
                  onClick={() => setDetailPage((p) => Math.max(0, p - 1))}
                  disabled={detailPage === 0 || loadingDetail}
                >
                  {t('common.prev', '<')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 bg-background/50"
                  onClick={() =>
                    setDetailPage((p) =>
                      Math.min(Math.ceil(detailTotal / ITEMS_PER_PAGE) - 1, p + 1),
                    )
                  }
                  disabled={
                    detailPage >= Math.ceil(detailTotal / ITEMS_PER_PAGE) - 1 || loadingDetail
                  }
                >
                  {t('common.next', '>')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
