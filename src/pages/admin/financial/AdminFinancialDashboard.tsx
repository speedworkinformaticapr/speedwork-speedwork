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
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, Edit, Eye, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

export default function AdminFinancialDashboard() {
  const [charges, setCharges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [sortConfig, setSortConfig] = useState<{
    column: string
    direction: 'asc' | 'desc'
  } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('financial_charges')
      .select('*')
      .order('due_date', { ascending: false })

    if (data) {
      setCharges(data)
    }
    setLoading(false)
  }

  const handleSort = (column: string) => {
    setSortConfig((current) => {
      if (current?.column === column) {
        if (current.direction === 'asc') return { column, direction: 'desc' }
        return null
      }
      return { column, direction: 'asc' }
    })
  }

  const filteredAndSortedCharges = useMemo(() => {
    let result = [...charges]

    if (dateRange?.from) {
      result = result.filter((c) => new Date(c.due_date) >= dateRange.from!)
    }
    if (dateRange?.to) {
      result = result.filter((c) => new Date(c.due_date) <= dateRange.to!)
    }

    if (typeFilter !== 'all') {
      result = result.filter((c) =>
        typeFilter === 'receitas' ? c.type === 'receivable' : c.type === 'payable',
      )
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'atrasado') {
        result = result.filter(
          (c) =>
            c.status === 'atrasado' ||
            (c.status === 'pendente' && new Date(c.due_date) < new Date()),
        )
      } else if (statusFilter === 'pendente') {
        result = result.filter((c) => c.status === 'pendente' && new Date(c.due_date) >= new Date())
      } else {
        result = result.filter((c) => c.status === statusFilter)
      }
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) => c.description?.toLowerCase().includes(q) || c.client_name?.toLowerCase().includes(q),
      )
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.column]
        let bVal = b[sortConfig.column]

        if (typeof aVal === 'string') aVal = aVal.toLowerCase()
        if (typeof bVal === 'string') bVal = bVal.toLowerCase()

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [charges, dateRange, typeFilter, statusFilter, search, sortConfig])

  const stats = useMemo(() => {
    let income = 0
    let expense = 0
    let overdue = 0

    filteredAndSortedCharges.forEach((c) => {
      if (c.type === 'receivable') {
        income += Number(c.amount || 0)
      } else if (c.type === 'payable') {
        expense += Number(c.amount || 0)
      }

      if (
        c.status === 'atrasado' ||
        (c.status === 'pendente' && new Date(c.due_date) < new Date())
      ) {
        if (c.type === 'receivable') overdue += Number(c.amount || 0)
        else overdue -= Number(c.amount || 0)
      }
    })

    return { income, expense, overdue: Math.abs(overdue) }
  }, [filteredAndSortedCharges])

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.column !== column)
      return (
        <ArrowUp className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
      )
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    )
  }

  return (
    <div className="p-6 space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">
          Acompanhe seus lançamentos de forma compacta e rápida.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="py-2">
          <CardHeader className="py-2 px-4 flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div className="text-xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                stats.income,
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="py-2">
          <CardHeader className="py-2 px-4 flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div className="text-xl font-bold text-red-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                stats.expense,
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="py-2">
          <CardHeader className="py-2 px-4 flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div className="text-xl font-bold text-amber-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                stats.overdue,
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-[260px]">
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
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-full sm:w-[180px]">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo Lançamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="receitas">Receitas</SelectItem>
              <SelectItem value="despesas">Despesas</SelectItem>
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
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full flex-1">
          <Input
            placeholder="Buscar por descrição ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md shadow-sm h-[50vh] overflow-auto relative bg-background">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur z-10 shadow-sm">
            <TableRow>
              <TableHead
                className="cursor-pointer group whitespace-nowrap select-none"
                onClick={() => handleSort('due_date')}
              >
                <div className="flex items-center">
                  Vencimento <SortIcon column="due_date" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer group whitespace-nowrap select-none"
                onClick={() => handleSort('client_name')}
              >
                <div className="flex items-center">
                  Cliente/Fornecedor <SortIcon column="client_name" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer group select-none"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center">
                  Descrição <SortIcon column="description" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer group whitespace-nowrap select-none"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center">
                  Tipo <SortIcon column="type" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer group whitespace-nowrap select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status <SortIcon column="status" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer group whitespace-nowrap text-right select-none"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end">
                  Valor <SortIcon column="amount" />
                </div>
              </TableHead>
              <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredAndSortedCharges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedCharges.map((charge) => {
                const isOverdue =
                  charge.status === 'atrasado' ||
                  (charge.status === 'pendente' && new Date(charge.due_date) < new Date())
                const displayStatus = isOverdue
                  ? 'Atrasado'
                  : charge.status?.charAt(0).toUpperCase() + charge.status?.slice(1)

                return (
                  <TableRow key={charge.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(charge.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">{charge.client_name}</TableCell>
                    <TableCell>{charge.description || '-'}</TableCell>
                    <TableCell>
                      {charge.type === 'receivable' ? (
                        <span className="text-green-600 font-medium">Receita</span>
                      ) : (
                        <span className="text-red-600 font-medium">Despesa</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          charge.status === 'pago'
                            ? 'bg-green-100 text-green-800'
                            : isOverdue
                              ? 'bg-amber-100 text-amber-800'
                              : charge.status === 'cancelado'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800',
                        )}
                      >
                        {displayStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(charge.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
