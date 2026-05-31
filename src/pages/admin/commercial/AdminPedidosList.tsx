import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'

type Pedido = {
  id: string
  numero_pedido: string | null
  data_pedido: string | null
  valor_total: number | null
  status: string | null
  cliente: {
    name: string | null
  } | null
}

export default function AdminPedidosList() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pedido | 'cliente_name'
    direction: 'asc' | 'desc'
  } | null>({
    key: 'data_pedido',
    direction: 'desc',
  })

  useEffect(() => {
    fetchPedidos()
  }, [])

  async function fetchPedidos() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('pedidos').select(`
          id,
          numero_pedido,
          data_pedido,
          valor_total,
          status,
          cliente:profiles!pedidos_cliente_id_fkey(name)
        `)

      if (error) throw error

      setPedidos((data as any) || [])
    } catch (error) {
      console.error('Error fetching pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key: keyof Pedido | 'cliente_name') => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: keyof Pedido | 'cliente_name') => {
    if (sortConfig?.key !== key)
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    )
  }

  const filteredAndSortedPedidos = useMemo(() => {
    let filtered = [...pedidos]

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.numero_pedido?.toLowerCase().includes(lowerSearch) ||
          p.cliente?.name?.toLowerCase().includes(lowerSearch),
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    if (dateRange.from) {
      filtered = filtered.filter((p) => {
        if (!p.data_pedido) return false
        const pDate = new Date(p.data_pedido + 'T00:00:00')
        pDate.setHours(0, 0, 0, 0)
        return pDate >= dateRange.from!
      })
    }
    if (dateRange.to) {
      filtered = filtered.filter((p) => {
        if (!p.data_pedido) return false
        const pDate = new Date(p.data_pedido + 'T00:00:00')
        pDate.setHours(0, 0, 0, 0)
        return pDate <= dateRange.to!
      })
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Pedido]
        let bValue: any = b[sortConfig.key as keyof Pedido]

        if (sortConfig.key === 'cliente_name') {
          aValue = a.cliente?.name || ''
          bValue = b.cliente?.name || ''
        }

        if (aValue === bValue) return 0

        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [pedidos, searchTerm, statusFilter, dateRange, sortConfig])

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'entregue':
        return <Badge className="bg-green-500 hover:bg-green-600">Entregue</Badge>
      case 'confirmado':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Confirmado</Badge>
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      case 'rascunho':
        return <Badge variant="secondary">Rascunho</Badge>
      default:
        return <Badge variant="outline">{status || 'Desconhecido'}</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pedidos Comerciais</h2>
        <Button asChild>
          <Link to="/admin/commercial/orders/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Pedido
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border">
        <div className="flex flex-col md:flex-row flex-1 w-full gap-4 items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full md:w-[280px] justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'P', { locale: ptBR })} -{' '}
                      {format(dateRange.to, 'P', { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, 'P', { locale: ptBR })
                  )
                ) : (
                  <span>Filtrar por Período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          {(statusFilter !== 'all' || dateRange.from || searchTerm) && (
            <Button
              variant="ghost"
              className="w-full md:w-auto"
              onClick={() => {
                setStatusFilter('all')
                setDateRange({ from: undefined, to: undefined })
                setSearchTerm('')
              }}
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-card [&>div]:max-h-[600px] [&>div]:overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10 shadow-sm border-b">
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => handleSort('numero_pedido')}
              >
                <div className="flex items-center">Nº Pedido {getSortIcon('numero_pedido')}</div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => handleSort('cliente_name')}
              >
                <div className="flex items-center">Cliente {getSortIcon('cliente_name')}</div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => handleSort('data_pedido')}
              >
                <div className="flex items-center">Data {getSortIcon('data_pedido')}</div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => handleSort('valor_total')}
              >
                <div className="flex items-center">Total {getSortIcon('valor_total')}</div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">Status {getSortIcon('status')}</div>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Carregando pedidos...
                </TableCell>
              </TableRow>
            ) : filteredAndSortedPedidos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedPedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell className="font-medium">{pedido.numero_pedido}</TableCell>
                  <TableCell>{pedido.cliente?.name || 'Cliente não encontrado'}</TableCell>
                  <TableCell>
                    {pedido.data_pedido
                      ? format(new Date(pedido.data_pedido + 'T00:00:00'), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })
                      : '-'}
                  </TableCell>
                  <TableCell>{formatCurrency(pedido.valor_total)}</TableCell>
                  <TableCell>{getStatusBadge(pedido.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/commercial/orders/${pedido.id}`}>Ver Detalhes</Link>
                    </Button>
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
