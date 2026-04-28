import { useEffect, useState, useMemo } from 'react'
import {
  Eye,
  Filter,
  Search,
  Package,
  MapPin,
  CreditCard,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useSystemData } from '@/hooks/use-system-data'
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { toast } from '@/hooks/use-toast'

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null,
  )
  const [page, setPage] = useState(1)

  const { data: systemData } = useSystemData()
  const itemsPerPage = systemData?.records_per_page || 50

  const updateOrderStatus = async (id: string, newStatus: string, orderData: any) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)
      if (error) throw error

      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso!' })

      if (orderData.user_id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('autoriza_whatsapp, telefone_whatsapp')
          .eq('id', orderData.user_id)
          .single()
        if (prof?.autoriza_whatsapp && prof?.telefone_whatsapp) {
          await supabase.functions.invoke('enviar_whatsapp', {
            body: {
              cliente_id: orderData.user_id,
              telefone_destino: prof.telefone_whatsapp,
              tipo_mensagem: 'pedido_status',
              variaveis: {
                cliente_nome: orderData.athletes?.name || 'Cliente',
                numero_pedido: id.slice(0, 8).toUpperCase(),
                novo_status: newStatus,
                data_atualizacao: new Date().toLocaleDateString(),
              },
            },
          })
          await supabase.from('orders').update({ whatsapp_enviado: true }).eq('id', id)
          toast({ title: 'WhatsApp', description: 'Cliente notificado via WhatsApp.' })
        }
      }

      fetchOrders()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleResendWhatsapp = async (orderData: any) => {
    try {
      if (!orderData.user_id) throw new Error('Cliente sem ID')
      const { data: prof } = await supabase
        .from('profiles')
        .select('autoriza_whatsapp, telefone_whatsapp')
        .eq('id', orderData.user_id)
        .single()
      if (!prof?.autoriza_whatsapp || !prof?.telefone_whatsapp)
        throw new Error('Cliente não possui WhatsApp configurado/autorizado')

      const { error } = await supabase.functions.invoke('enviar_whatsapp', {
        body: {
          cliente_id: orderData.user_id,
          telefone_destino: prof.telefone_whatsapp,
          tipo_mensagem: 'pedido_status',
          variaveis: {
            cliente_nome: orderData.athletes?.name || 'Cliente',
            numero_pedido: orderData.id.slice(0, 8).toUpperCase(),
            novo_status: orderData.status,
            data_atualizacao: new Date().toLocaleDateString(),
          },
        },
      })
      if (error) throw error

      await supabase.from('orders').update({ whatsapp_enviado: true }).eq('id', orderData.id)
      toast({ title: 'WhatsApp', description: 'Mensagem reenviada com sucesso!' })
      fetchOrders()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('orders').select('*, athletes(name, email)')

    if (!error && data) setOrders(data)
    setLoading(false)
  }

  const filteredItems = useMemo(() => {
    return orders
      .filter((o) => {
        const matchSearch =
          o.id.toLowerCase().includes(search.toLowerCase()) ||
          o.athletes?.name?.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'all' || o.status === statusFilter
        let matchPeriod = true
        if (periodFilter !== 'all') {
          const days = parseInt(periodFilter)
          const dateLimit = new Date()
          dateLimit.setDate(dateLimit.getDate() - days)
          matchPeriod = new Date(o.created_at) >= dateLimit
        }
        return matchSearch && matchStatus && matchPeriod
      })
      .sort((a, b) => {
        if (!sortConfig) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]
        if (sortConfig.key === 'athletes.name') {
          aVal = a.athletes?.name || ''
          bVal = b.athletes?.name || ''
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
  }, [orders, search, statusFilter, periodFilter, sortConfig])

  const paginatedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, periodFilter, itemsPerPage])

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const SortHead = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label} <ArrowUpDown className="w-3 h-3 opacity-50" />
      </div>
    </TableHead>
  )

  const getStatusVisuals = (status: string) => {
    switch (status) {
      case 'paid':
        return { color: 'bg-green-100 text-green-800 border-green-300', label: 'Pago / Preparando' }
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          label: 'Aguard. Pagamento',
        }
      case 'delivered':
        return { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Concluído / Entregue' }
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800 border-red-300', label: 'Cancelado' }
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Novo' }
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central de Pedidos</h1>
          <p className="text-muted-foreground">
            Controle de ponta a ponta do faturamento e expedição.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-background p-2 rounded-md border sticky top-[var(--header-height,0)] z-20 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código de pedido ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] border-0 sm:border-l rounded-none px-4 focus:ring-0">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Preparando</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-full sm:w-[160px] border-0 sm:border-l rounded-none px-4 focus:ring-0">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Historico Completo</SelectItem>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md bg-card shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead label="Pedido & Data" sortKey="created_at" />
                <SortHead label="Cliente" sortKey="athletes.name" />
                <SortHead label="Financeiro" sortKey="total_price" />
                <SortHead label="Status Operacional" sortKey="status" />
                <TableHead>WhatsApp</TableHead>
                <TableHead className="text-right">Painel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Carregando dados logísticos...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((order) => {
                  const visual = getStatusVisuals(order.status)
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-mono text-sm font-semibold">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(order.created_at), 'dd/MM/yyyy • HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.athletes?.name || 'Cliente Avulso'}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        R$ {Number(order.total_price || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status || 'pending'}
                          onValueChange={(v) => updateOrderStatus(order.id, v, order)}
                        >
                          <SelectTrigger
                            className={`h-8 w-[160px] text-xs font-semibold ${visual.color}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="processing">Processando</SelectItem>
                            <SelectItem value="paid">Preparando</SelectItem>
                            <SelectItem value="delivered">Entregue</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {order.whatsapp_enviado ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-green-600 font-medium text-xs flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500" /> Enviado
                            </span>
                            <button
                              onClick={() => handleResendWhatsapp(order)}
                              className="text-[10px] text-blue-600 hover:underline"
                            >
                              Reenviar
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-muted-foreground" /> Não
                            </span>
                            <button
                              onClick={() => handleResendWhatsapp(order)}
                              className="text-[10px] text-blue-600 hover:underline"
                            >
                              Enviar Msg
                            </button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-2" /> Gerir Pedido
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 0 && (
          <div className="p-4 border-t flex items-center justify-between bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {paginatedItems.length} de {filteredItems.length} registros
            </span>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm px-2">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="sm:max-w-lg border-l shadow-2xl overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Pedido #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </SheetTitle>
            <SheetDescription>
              Realizado em{' '}
              {selectedOrder &&
                format(new Date(selectedOrder.created_at), "dd 'de' MMMM 'às' HH:mm")}
            </SheetDescription>
          </SheetHeader>

          {selectedOrder && (
            <div className="py-6 space-y-8">
              <div className="space-y-3">
                <h3 className="font-bold tracking-tight flex items-center gap-2 text-sm uppercase text-muted-foreground">
                  <CreditCard className="w-4 h-4" /> Dados do Comprador
                </h3>
                <div className="p-4 bg-muted/30 border rounded-lg">
                  <p className="font-semibold text-lg">
                    {selectedOrder.athletes?.name || 'Não identificado'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedOrder.athletes?.email || 'Sem e-mail cadastrado'}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Badge variant="secondary">
                      Pagamento: {selectedOrder.payment_method || 'PIX'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold tracking-tight flex items-center gap-2 text-sm uppercase text-muted-foreground">
                  <MapPin className="w-4 h-4" /> Logística de Entrega
                </h3>
                <div className="p-4 border rounded-lg bg-blue-500/5 border-blue-500/20">
                  <p className="text-sm leading-relaxed">
                    {selectedOrder.delivery_address ||
                      'Retirada na sede administrativa confirmada no ato da compra.'}
                  </p>
                  <div className="mt-4 pt-4 border-t border-blue-500/20 flex flex-col gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-blue-600/80 mb-1">
                        Código de Rastreamento Correios
                      </p>
                      <Input
                        defaultValue="BR901827462BR"
                        readOnly
                        className="bg-background font-mono h-9"
                      />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Avançar Status para "Enviado"
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
