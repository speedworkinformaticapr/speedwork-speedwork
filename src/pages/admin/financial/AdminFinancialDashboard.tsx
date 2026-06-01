import React, { useState, useEffect, useMemo } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Calendar as CalendarIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  amount: number
  realized_amount: number
  status: string
  parcela_numero: number
  parcela_total: number
}

type DateRange = { from?: Date; to?: Date }

export default function AdminFinancialDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [masterRecords, setMasterRecords] = useState<MasterRecord[]>([])
  const [selectedMaster, setSelectedMaster] = useState<MasterRecord | null>(null)
  const [detailRecords, setDetailRecords] = useState<ChargeRecord[]>([])

  const [sortConfig, setSortConfig] = useState<{
    key: keyof MasterRecord
    direction: 'asc' | 'desc'
  }>({
    key: 'created_at',
    direction: 'desc',
  })

  const fetchMasterRecords = async () => {
    let q = supabase.from('financial_master_records').select('*')
    if (dateRange?.from) {
      q = q.gte('created_at', dateRange.from.toISOString())
    }
    if (dateRange?.to) {
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)
      q = q.lte('created_at', toDate.toISOString())
    }
    if (typeFilter && typeFilter !== 'all') {
      q = q.eq('type', typeFilter)
    }
    if (statusFilter && statusFilter !== 'all') {
      q = q.eq('status', statusFilter)
    }
    if (searchQuery) {
      q = q.ilike('description', `%${searchQuery}%`)
    }

    const { data } = await q
    if (data) {
      setMasterRecords(data as MasterRecord[])
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMasterRecords()
    }, 300)
    return () => clearTimeout(timer)
  }, [dateRange, typeFilter, statusFilter, searchQuery])

  useEffect(() => {
    if (!selectedMaster) {
      setDetailRecords([])
      return
    }
    const fetchDetails = async () => {
      const { data } = await supabase
        .from('financial_charges')
        .select('*')
        .eq('master_record_id', selectedMaster.id)
        .order('due_date', { ascending: true })

      if (data) {
        setDetailRecords(data as ChargeRecord[])
      }
    }
    fetchDetails()
  }, [selectedMaster])

  const indicators = useMemo(() => {
    let recPrev = 0,
      recReal = 0
    let desPrev = 0,
      desReal = 0
    let atrPrev = 0

    masterRecords.forEach((m) => {
      if (m.type === 'receivable') {
        recPrev += m.total_amount || 0
        recReal += m.paid_amount || 0
        if (m.status === 'atrasado') {
          atrPrev += (m.total_amount || 0) - (m.paid_amount || 0)
        }
      } else if (m.type === 'payable') {
        desPrev += m.total_amount || 0
        desReal += m.paid_amount || 0
        if (m.status === 'atrasado') {
          atrPrev += (m.total_amount || 0) - (m.paid_amount || 0)
        }
      }
    })

    return { recPrev, recReal, desPrev, desReal, atrPrev }
  }, [masterRecords])

  const handleSort = (key: keyof MasterRecord) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const renderSortIcon = (key: keyof MasterRecord) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="inline-block ml-1 h-3 w-3 text-muted-foreground" />
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="inline-block ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="inline-block ml-1 h-3 w-3" />
    )
  }

  const sortedMasterRecords = useMemo(() => {
    const sorted = [...masterRecords]
    sorted.sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]

      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [masterRecords, sortConfig])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pago':
      case 'recebido':
        return (
          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
            Pago
          </Badge>
        )
      case 'pendente':
      case 'aberto':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pendente
          </Badge>
        )
      case 'atrasado':
        return <Badge variant="destructive">Atrasado</Badge>
      case 'parcial':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Parcial
          </Badge>
        )
      case 'cancelado':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    if (type === 'receivable') return 'Receita'
    if (type === 'payable') return 'Despesa'
    return type
  }

  return (
    <div className="p-6 max-w-full overflow-hidden flex flex-col h-full animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Fluxo de Caixa</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os registros financeiros masters e suas parcelas.
          </p>
        </div>
      </div>

      {/* Indicadores */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(indicators.recPrev)}</p>
                <p className="text-sm text-muted-foreground">Previsto</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(indicators.recReal)}
                </p>
                <p className="text-sm text-muted-foreground">Realizado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(indicators.desPrev)}</p>
                <p className="text-sm text-muted-foreground">Previsto</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(indicators.desReal)}
                </p>
                <p className="text-sm text-muted-foreground">Realizado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atrasados - Adjusted height to be compact (approx 50%) */}
        <Card className="flex-1 h-[68px] md:h-auto md:min-h-[68px] border-red-200 bg-red-50/30">
          <CardContent className="p-4 flex items-center justify-between h-full">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600" />
              <p className="text-sm font-medium text-red-800 uppercase tracking-wider">Atrasados</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-red-700">{formatCurrency(indicators.atrPrev)}</p>
              <p className="text-xs text-red-600/80 font-medium">Total Previsto</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros em ordem especificada: 1. Período, 2. Tipo, 3. Status, 4. Descrição */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full lg:w-[240px] justify-start text-left font-normal bg-card',
                !dateRange && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                  </>
                ) : (
                  format(dateRange.from, 'dd/MM/yyyy')
                )
              ) : (
                <span>Selecione o período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange as any}
              onSelect={setDateRange as any}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full lg:w-[180px] bg-card">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="receivable">Receitas</SelectItem>
            <SelectItem value="payable">Despesas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-[180px] bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
            <SelectItem value="parcial">Parcial</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por descrição..."
            className="pl-8 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grids Split Horizontal (50% - 50%) */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[500px]">
        {/* Master Grid (50%) */}
        <Card className="w-full lg:w-1/2 flex flex-col h-full overflow-hidden shadow-sm">
          <CardHeader className="pb-3 flex-shrink-0 bg-muted/20 border-b border-border/50">
            <CardTitle className="text-base font-semibold">Registros Principais</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden relative">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10 shadow-sm outline outline-1 outline-border">
                  <TableRow>
                    <TableHead
                      onClick={() => handleSort('created_at')}
                      className="cursor-pointer whitespace-nowrap"
                    >
                      Data {renderSortIcon('created_at')}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort('description')}
                      className="cursor-pointer min-w-[150px]"
                    >
                      Descrição {renderSortIcon('description')}
                    </TableHead>
                    <TableHead onClick={() => handleSort('client_name')} className="cursor-pointer">
                      Cliente {renderSortIcon('client_name')}
                    </TableHead>
                    <TableHead onClick={() => handleSort('type')} className="cursor-pointer">
                      Tipo {renderSortIcon('type')}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort('total_amount')}
                      className="cursor-pointer text-right whitespace-nowrap"
                    >
                      Total {renderSortIcon('total_amount')}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort('status')}
                      className="cursor-pointer text-center"
                    >
                      Status {renderSortIcon('status')}
                    </TableHead>
                    <TableHead className="text-center min-w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMasterRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Nenhum registro encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedMasterRecords.map((record) => (
                      <TableRow
                        key={record.id}
                        className={cn(
                          'cursor-pointer transition-colors hover:bg-muted/50',
                          selectedMaster?.id === record.id && 'bg-muted/80',
                        )}
                        onClick={() => setSelectedMaster(record)}
                      >
                        <TableCell className="whitespace-nowrap">
                          {record.created_at
                            ? format(new Date(record.created_at), 'dd/MM/yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell
                          className="font-medium truncate max-w-[180px]"
                          title={record.description}
                        >
                          {record.description}
                        </TableCell>
                        <TableCell className="truncate max-w-[150px]" title={record.client_name}>
                          {record.client_name}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap',
                              record.type === 'receivable'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800',
                            )}
                          >
                            {getTypeLabel(record.type)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(record.total_amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(record.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          {/* Permanent Visible Actions */}
                          <div className="flex items-center justify-center gap-1 opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedMaster(record)
                              }}
                              title="Visualizar Detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detail Grid (50%) */}
        <Card className="w-full lg:w-1/2 flex flex-col h-full overflow-hidden shadow-sm">
          <CardHeader className="pb-3 flex-shrink-0 bg-muted/10 border-b border-border/50">
            <CardTitle className="text-base font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="truncate">
                {selectedMaster
                  ? `Detalhes: ${selectedMaster.description}`
                  : 'Detalhes das Parcelas'}
              </span>
              {selectedMaster && (
                <Badge
                  variant="outline"
                  className="font-normal text-xs whitespace-nowrap bg-background"
                >
                  {selectedMaster.client_name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden relative">
            {!selectedMaster ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center bg-slate-50/50">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
                  <Eye className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-700">Nenhum registro selecionado</p>
                <p className="text-sm mt-1 max-w-sm">
                  Clique em um lançamento na tabela principal para visualizar os detalhes das
                  parcelas associadas.
                </p>
              </div>
            ) : detailRecords.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground bg-slate-50/50">
                <p>Nenhuma parcela encontrada para este registro.</p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10 shadow-sm outline outline-1 outline-border">
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Vencimento</TableHead>
                      <TableHead>Parcela</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Realizado</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailRecords.map((detail) => (
                      <TableRow key={detail.id} className="hover:bg-muted/30">
                        <TableCell className="whitespace-nowrap">
                          {detail.due_date ? format(new Date(detail.due_date), 'dd/MM/yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {detail.parcela_numero
                            ? `${detail.parcela_numero}/${detail.parcela_total || detail.parcela_numero}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-700">
                          {formatCurrency(detail.amount)}
                        </TableCell>
                        <TableCell className="text-right text-slate-500">
                          {formatCurrency(detail.realized_amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(detail.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
