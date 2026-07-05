import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CashFlowGrid } from './components/CashFlowGrid'
import { DateRangeFilter } from './components/DateRangeFilter'
import { getMasterStatus, formatCurrency } from '@/lib/financial-utils'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Search, Plus, Calendar, TrendingUp, TrendingDown, X, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { NewFinancialEntryModal } from '@/components/financial/NewFinancialEntryModal'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'

export default function AdminFinancialDashboard() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('financial_master_records')
      .select('*, financial_charges(*)')
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Erro ao carregar dados financeiros')
    } else {
      setRecords(data || [])
    }
    setLoading(false)
  }

  const filteredRecords = useMemo(() => {
    const dateFrom = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''
    const dateTo = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''
    return records
      .map((r) => {
        const charges = (r.financial_charges || []).filter((c: any) => {
          if (!dateFrom && !dateTo) return true
          const due = c.due_date
          if (!due) return false
          if (dateFrom && due < dateFrom) return false
          if (dateTo && due > dateTo) return false
          return true
        })
        return { ...r, financial_charges: charges }
      })
      .filter((r) => {
        if ((dateFrom || dateTo) && (r.financial_charges || []).length === 0) return false
        if (search) {
          const q = search.toLowerCase()
          if (
            !r.client_name?.toLowerCase().includes(q) &&
            !r.description?.toLowerCase().includes(q)
          )
            return false
        }
        if (typeFilter !== 'all' && r.type !== typeFilter) return false
        if (statusFilter !== 'all') {
          const status = getMasterStatus(r.financial_charges || [])
          if (status.label.toLowerCase() !== statusFilter) return false
        }
        return true
      })
  }, [records, search, typeFilter, statusFilter, dateRange])

  const stats = useMemo(() => {
    let receivablePrevisto = 0
    let receivableRealizado = 0
    let payablePrevisto = 0
    let payableRealizado = 0

    filteredRecords.forEach((r) => {
      const charges = r.financial_charges || []
      charges.forEach((c: any) => {
        const amount = Number(c.amount) || 0
        const realized = Number(c.realized_amount) || 0
        if (r.type === 'receivable') {
          receivablePrevisto += amount
          receivableRealizado += realized
        } else {
          payablePrevisto += amount
          payableRealizado += realized
        }
      })
    })

    const saldoAtual = receivableRealizado - payableRealizado
    return {
      receivablePrevisto,
      receivableRealizado,
      payablePrevisto,
      payableRealizado,
      saldoAtual,
    }
  }, [filteredRecords])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Acompanhe valores previstos vs realizados e gerencie parcelas.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditId(null)
            setShowNewModal(true)
          }}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border-emerald-200 dark:border-emerald-900">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 dark:bg-emerald-950/40">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/15">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                A Receber
              </span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="px-5 py-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Previsto</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(stats.receivablePrevisto)}
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Realizado</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(stats.receivableRealizado)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-rose-200 dark:border-rose-900">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 px-5 py-3 bg-rose-50 dark:bg-rose-950/40">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-rose-500/15">
                <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="font-semibold text-rose-700 dark:text-rose-300">A Pagar</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="px-5 py-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Previsto</p>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(stats.payablePrevisto)}
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Realizado</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(stats.payableRealizado)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-950/40">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-500/15">
                <Wallet className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Saldo Atual</span>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Valor Atual</p>
              <p
                className={cn(
                  'text-xl font-bold',
                  stats.saldoAtual >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400',
                )}
              >
                {formatCurrency(stats.saldoAtual)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Período:</span>
          </div>
          <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>

        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="w-full lg:w-[180px]">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="receivable">Receber</SelectItem>
              <SelectItem value="payable">Pagar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full lg:w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
              <SelectItem value="a vencer">A Vencer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CashFlowGrid
        records={filteredRecords}
        loading={loading}
        onRefresh={fetchData}
        onEdit={(id) => {
          setEditId(id)
          setShowNewModal(true)
        }}
      />
      <NewFinancialEntryModal
        open={showNewModal}
        onOpenChange={(v) => {
          setShowNewModal(v)
          if (!v) setEditId(null)
        }}
        onSuccess={fetchData}
        editId={editId}
      />
    </div>
  )
}
