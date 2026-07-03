import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CashFlowGrid } from './components/CashFlowGrid'
import { getMasterStatus, formatCurrency } from '@/lib/financial-utils'
import { Search } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminFinancialDashboard() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

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
    return records.filter((r) => {
      if (search) {
        const q = search.toLowerCase()
        if (!r.client_name?.toLowerCase().includes(q) && !r.description?.toLowerCase().includes(q))
          return false
      }
      if (typeFilter !== 'all' && r.type !== typeFilter) return false
      if (statusFilter !== 'all') {
        const status = getMasterStatus(r.financial_charges || [])
        if (status.label.toLowerCase() !== statusFilter) return false
      }
      return true
    })
  }, [records, search, typeFilter, statusFilter])

  const stats = useMemo(() => {
    let income = 0
    let expense = 0
    let realized = 0
    records.forEach((r) => {
      const charges = r.financial_charges || []
      const total = charges.reduce((s, c) => s + (Number(c.amount) || 0), 0)
      const real = charges.reduce((s, c) => s + (Number(c.realized_amount) || 0), 0)
      if (r.type === 'receivable') income += total
      else expense += total
      realized += real
    })
    return { income, expense, balance: income - expense, realized }
  }, [records])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
        <p className="text-muted-foreground">
          Acompanhe valores previstos vs realizados e gerencie parcelas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="py-2">
          <CardHeader className="py-2 px-4 pb-1">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div className="text-xl font-bold text-green-600">{formatCurrency(stats.income)}</div>
          </CardContent>
        </Card>
        <Card className="py-2">
          <CardHeader className="py-2 px-4 pb-1">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div className="text-xl font-bold text-red-600">{formatCurrency(stats.expense)}</div>
          </CardContent>
        </Card>
        <Card className="py-2">
          <CardHeader className="py-2 px-4 pb-1">
            <CardTitle className="text-sm font-medium">Realizado</CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div className="text-xl font-bold text-blue-600">{formatCurrency(stats.realized)}</div>
          </CardContent>
        </Card>
        <Card className="py-2">
          <CardHeader className="py-2 px-4 pb-1">
            <CardTitle className="text-sm font-medium">Saldo Previsto</CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div className="text-xl font-bold text-amber-600">{formatCurrency(stats.balance)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="w-full sm:w-[180px]">
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
        <div className="w-full sm:w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="em dia">Em dia</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CashFlowGrid records={filteredRecords} loading={loading} onRefresh={fetchData} />
    </div>
  )
}
