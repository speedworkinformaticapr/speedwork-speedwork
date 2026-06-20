import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { PageHero } from '@/components/PageHero'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { format } from 'date-fns'
import { Search, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatSLA, getPriorityColor } from '@/lib/utils/tickets'
import { DateRange } from 'react-day-picker'

type Ticket = {
  id: string
  ticket_number: number
  title: string
  status: string
  priority: string
  module: string
  created_at: string
  sla_started_at: string
  sla_paused_at: string
  total_paused_time_ms: number
  client?: {
    name: string | null
    cpf_cnpj: string | null
    tipo_usuario: string | null
  } | null
  technician?: {
    name: string | null
  } | null
}

type SortConfig = {
  key: string
  direction: 'asc' | 'desc'
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [slaConfigs, setSlaConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ticketsResponse, slaResponse] = await Promise.all([
        fetchTickets(),
        supabase.from('ticket_sla_configs').select('*'),
      ])

      if (ticketsResponse.error) throw ticketsResponse.error
      if (slaResponse.error) throw slaResponse.error

      setTickets(ticketsResponse.data || [])
      setSlaConfigs(slaResponse.data || [])
    } catch (error: any) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os tickets.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTickets = async () => {
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        client:profiles!support_tickets_client_id_fkey(name, cpf_cnpj, tipo_usuario),
        technician:profiles!support_tickets_technician_id_fkey(name)
      `)
      .order('created_at', { ascending: false })

    if (dateRange?.from) {
      query = query.gte('created_at', dateRange.from.toISOString())
    }
    if (dateRange?.to) {
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)
      query = query.lte('created_at', toDate.toISOString())
    }

    return query
  }

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground inline-block" />
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4 inline-block" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 inline-block" />
    )
  }

  const filteredAndSortedTickets = useMemo(() => {
    let result = [...tickets]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(search) ||
          t.ticket_number?.toString().includes(search) ||
          t.client?.name?.toLowerCase().includes(search) ||
          t.client?.cpf_cnpj?.includes(search),
      )
    }

    result.sort((a, b) => {
      let aValue: any = ''
      let bValue: any = ''

      switch (sortConfig.key) {
        case 'created_at':
          aValue = a.created_at ? new Date(a.created_at).getTime() : 0
          bValue = b.created_at ? new Date(b.created_at).getTime() : 0
          break
        case 'ticket_number':
          aValue = a.ticket_number
          bValue = b.ticket_number
          break
        case 'client_name':
          aValue = a.client?.name || ''
          bValue = b.client?.name || ''
          break
        case 'cpf_cnpj':
          aValue = a.client?.cpf_cnpj || ''
          bValue = b.client?.cpf_cnpj || ''
          break
        case 'tipo_usuario':
          aValue = a.client?.tipo_usuario || ''
          bValue = b.client?.tipo_usuario || ''
          break
        default:
          aValue = (a as any)[sortConfig.key]
          bValue = (b as any)[sortConfig.key]
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [tickets, searchTerm, sortConfig])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto':
        return 'bg-blue-100 text-blue-800'
      case 'Em Andamento':
        return 'bg-yellow-100 text-yellow-800'
      case 'Aguardando Cliente':
        return 'bg-orange-100 text-orange-800'
      case 'Resolvido':
        return 'bg-green-100 text-green-800'
      case 'Fechado':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const safeFormatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy')
    } catch {
      return '-'
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Tickets de Suporte"
        description="Gerencie os tickets de suporte e chamados dos clientes."
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-end md:items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, número, cliente ou CPF/CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full md:w-auto flex gap-2">
              <div className="w-full md:w-[300px]">
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>
              {dateRange && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDateRange(undefined)}
                  title="Limpar período"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border relative h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-border">
                <TableRow>
                  <TableHead
                    className="cursor-pointer whitespace-nowrap hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('ticket_number')}
                  >
                    Número {getSortIcon('ticket_number')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer whitespace-nowrap hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('created_at')}
                  >
                    Data {getSortIcon('created_at')}
                  </TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead
                    className="cursor-pointer whitespace-nowrap hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('client_name')}
                  >
                    Cliente {getSortIcon('client_name')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer whitespace-nowrap hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('cpf_cnpj')}
                  >
                    CPF/CNPJ {getSortIcon('cpf_cnpj')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer whitespace-nowrap hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('tipo_usuario')}
                  >
                    Tipo de Cliente {getSortIcon('tipo_usuario')}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>SLA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Carregando tickets...
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum ticket encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedTickets.map((ticket) => {
                    const sla = formatSLA(ticket, slaConfigs)
                    return (
                      <TableRow key={ticket.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {safeFormatDate(ticket.created_at)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={ticket.title}>
                          {ticket.title}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {ticket.client?.name || '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {ticket.client?.cpf_cnpj || '-'}
                        </TableCell>
                        <TableCell className="capitalize whitespace-nowrap">
                          {ticket.client?.tipo_usuario || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(ticket.status)}>
                            {ticket.status || 'Aberto'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority || 'P4'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sla.expired ? 'destructive' : 'secondary'}>
                            {sla.text}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
