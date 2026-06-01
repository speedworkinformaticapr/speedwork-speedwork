import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useDataTable } from '@/hooks/use-data-table'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Edit,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Calendar as CalendarIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertCircle,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

export default function AdminFinancialPayments() {
  const {
    search,
    setSearch,
    debouncedSearch,
    status,
    setStatus,
    dateRange,
    setDateRange,
    sortConfig,
    handleSort,
  } = useDataTable()

  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    receitasPrevistas: 0,
    receitasRealizadas: 0,
    despesasPrevistas: 0,
    despesasRealizadas: 0,
    atrasadosPrevistos: 0,
  })

  const fetchData = async () => {
    setLoading(true)
    let query = supabase.from('financial_charges').select('*')

    if (debouncedSearch) {
      query = query.ilike('description', `%${debouncedSearch}%`)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (typeFilter !== 'all') {
      query = query.eq('type', typeFilter)
    }

    if (dateRange?.from) {
      query = query.gte('due_date', format(dateRange.from, 'yyyy-MM-dd'))
    }
    if (dateRange?.to) {
      query = query.lte('due_date', format(dateRange.to, 'yyyy-MM-dd'))
    }

    if (sortConfig) {
      query = query.order(sortConfig.column, { ascending: sortConfig.direction === 'asc' })
    } else {
      query = query.order('due_date', { ascending: false })
    }

    const { data: result, error } = await query

    if (!error && result) {
      setData(result)

      let recPrev = 0,
        recReal = 0,
        desPrev = 0,
        desReal = 0,
        atrPrev = 0
      result.forEach((item) => {
        const amt = Number(item.amount) || 0
        const real = Number(item.realized_amount) || 0

        if (item.type === 'receita' || item.type === 'receivable') {
          recPrev += amt
          recReal += real
        } else {
          desPrev += amt
          desReal += real
        }

        const isOverdue =
          item.status === 'atrasado' ||
          (item.status === 'pendente' && new Date(item.due_date) < new Date())
        if (isOverdue) {
          atrPrev += amt
        }
      })

      setSummary({
        receitasPrevistas: recPrev,
        receitasRealizadas: recReal,
        despesasPrevistas: desPrev,
        despesasRealizadas: desReal,
        atrasadosPrevistos: atrPrev,
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [debouncedSearch, status, typeFilter, dateRange, sortConfig])

  const renderSortableHead = (label: string, column: string) => {
    const isSorted = sortConfig?.column === column
    return (
      <TableHead
        className="cursor-pointer select-none sticky top-0 bg-background z-10 before:absolute before:inset-x-0 before:bottom-0 before:border-b"
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center gap-1">
          {label}
          {isSorted ? (
            sortConfig.direction === 'asc' ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-30" />
          )}
        </div>
      </TableHead>
    )
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('T')[0].split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div className="p-6 max-w-full overflow-hidden flex flex-col h-full gap-6">
      <h1 className="text-2xl font-bold">Fluxo de Caixa</h1>

      {/* Indicadores Reduzidos em 50% da altura padrão */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="h-20 flex flex-col justify-center px-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <ArrowUpCircle className="w-4 h-4 mr-1 text-green-500" />
                Receitas
              </p>
              <p className="text-xl font-bold">
                R$ {summary.receitasPrevistas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs text-muted-foreground">Realizado</p>
              <p className="text-sm font-semibold text-green-600">
                R${' '}
                {summary.receitasRealizadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="h-20 flex flex-col justify-center px-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <ArrowDownCircle className="w-4 h-4 mr-1 text-red-500" />
                Despesas
              </p>
              <p className="text-xl font-bold">
                R$ {summary.despesasPrevistas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs text-muted-foreground">Realizado</p>
              <p className="text-sm font-semibold text-red-600">
                R${' '}
                {summary.despesasRealizadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="h-20 flex flex-col justify-center px-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <AlertCircle className="w-4 h-4 mr-1 text-orange-500" />
                Atrasados
              </p>
              <p className="text-xl font-bold text-orange-600">
                R${' '}
                {summary.atrasadosPrevistos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Barra de Filtros (Ordem Estrita) */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-[280px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                      {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                  )
                ) : (
                  <span>Período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-full sm:w-[200px]">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Lançamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="receivable">Receitas</SelectItem>
              <SelectItem value="payable">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[200px]">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full flex-1">
          <Input
            placeholder="Descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Dados - 50vh height */}
      <div className="h-[50vh] overflow-auto border rounded-md relative bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              {renderSortableHead('Descrição', 'description')}
              {renderSortableHead('Cliente', 'client_name')}
              {renderSortableHead('Vencimento', 'due_date')}
              {renderSortableHead('Valor', 'amount')}
              {renderSortableHead('Tipo', 'type')}
              {renderSortableHead('Status', 'status')}
              <TableHead className="sticky top-0 bg-background z-10 before:absolute before:inset-x-0 before:bottom-0 before:border-b w-[120px]">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Carregando dados...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.client_name}</TableCell>
                  <TableCell>{formatDate(item.due_date)}</TableCell>
                  <TableCell>
                    R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        item.type === 'receivable' || item.type === 'receita'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800',
                      )}
                    >
                      {item.type === 'receivable' || item.type === 'receita'
                        ? 'Receita'
                        : 'Despesa'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        item.status === 'pago'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'atrasado'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800',
                      )}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
