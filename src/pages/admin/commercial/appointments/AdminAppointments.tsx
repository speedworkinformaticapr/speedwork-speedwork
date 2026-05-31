import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LayoutGrid, List, Pencil, Trash2, XCircle, Play, ArrowUpDown, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getAppointments, updateAppointment, deleteAppointment } from '@/services/appointments'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'card' | 'grid'>('grid')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })

  const navigate = useNavigate()
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAppointments()
      setAppointments(data || [])
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      let match = true
      if (statusFilter !== 'all' && app.status !== statusFilter) match = false
      if (dateFrom && app.date < dateFrom) match = false
      if (dateTo && app.date > dateTo) match = false
      return match
    })
  }, [appointments, dateFrom, dateTo, statusFilter])

  const sortedAppointments = useMemo(() => {
    const sorted = [...filteredAppointments]
    sorted.sort((a, b) => {
      let valA = a[sortConfig.key]
      let valB = b[sortConfig.key]
      if (sortConfig.key === 'client') {
        valA = a.client_name
        valB = b.client_name
      }
      if (sortConfig.key === 'vehicle') {
        valA = a.vehicle_plate
        valB = b.vehicle_plate
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredAppointments, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handleCancel = async (id: string) => {
    try {
      await updateAppointment(id, { status: 'Cancelado' })
      toast({ title: 'Sucesso', description: 'Agendamento cancelado.' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: 'Erro ao cancelar.', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este agendamento?')) return
    try {
      await deleteAppointment(id)
      toast({ title: 'Sucesso', description: 'Agendamento excluído.' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' })
    }
  }

  const handleStart = (app: any) => {
    const params = new URLSearchParams()
    params.set('appointment_id', app.id)
    if (app.cliente_id) params.set('cliente_id', app.cliente_id)
    if (app.vehicle_id) params.set('vehicle_id', app.vehicle_id)
    if (app.vehicle_plate) params.set('plate', app.vehicle_plate)
    if (app.problema_descricao) params.set('obs', app.problema_descricao)
    navigate(`/admin/commercial/quotes/new?${params.toString()}`)
  }

  const handleEdit = (id: string) => {
    toast({ title: 'Aviso', description: 'A edição rápida está em desenvolvimento.' })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-500 hover:bg-yellow-600'
      case 'confirmado':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'concluído':
        return 'bg-green-500 hover:bg-green-600'
      case 'cancelado':
        return 'bg-red-500 hover:bg-red-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('grid')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'card' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('card')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button onClick={() => window.open('/scheduling', '_blank')} className="gap-2 ml-2">
            <Plus className="w-4 h-4" /> Novo Agendamento
          </Button>
        </div>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-end sm:items-center bg-muted/20">
          <div className="space-y-1 flex-1 w-full">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Data Inicial
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-1 flex-1 w-full">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Data Final
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-1 flex-1 w-full">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Confirmado">Confirmado</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Carregando agendamentos...</p>
        </div>
      ) : view === 'grid' ? (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('client')}
                  >
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      Cliente <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      Data/Hora <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('vehicle')}
                  >
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      Veículo <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">Problema</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      Status <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAppointments.map((app) => (
                  <TableRow key={app.id} className="group hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-primary">{app.client_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {app.profiles?.cpf_cnpj || 'Sem CPF'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {app.date ? format(parseISO(app.date), 'dd/MM/yyyy') : ''}
                      </div>
                      <div className="text-sm text-muted-foreground">{app.start_time}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {app.vehicle_model || 'Não informado'}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {app.vehicle_plate}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={app.problema_descricao}>
                      {app.problema_descricao || (
                        <span className="text-muted-foreground italic">Sem descrição</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(app.status)} text-white border-none shadow-sm`}
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          title="Editar"
                          onClick={() => handleEdit(app.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                          title="Cancelar"
                          onClick={() => handleCancel(app.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          title="Excluir"
                          onClick={() => handleDelete(app.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1 ml-2 shadow-sm"
                          onClick={() => handleStart(app)}
                        >
                          <Play className="w-3 h-3" /> Iniciar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedAppointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Nenhum agendamento encontrado para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedAppointments.map((app) => (
            <Card
              key={app.id}
              className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300 border-primary/10 overflow-hidden group"
            >
              <CardHeader className="pb-3 bg-muted/10 border-b border-border/50">
                <div className="flex justify-between items-start gap-4">
                  <div className="truncate">
                    <CardTitle className="text-lg text-primary truncate" title={app.client_name}>
                      {app.client_name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {app.profiles?.cpf_cnpj || 'Sem CPF'}
                    </p>
                  </div>
                  <Badge
                    className={`${getStatusColor(app.status)} text-white border-none shadow-sm whitespace-nowrap shrink-0`}
                  >
                    {app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 space-y-4">
                <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border/50 shadow-sm">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Data e Hora
                    </span>
                    <span className="font-semibold text-foreground block">
                      {app.date ? format(parseISO(app.date), 'dd/MM/yyyy') : ''} às {app.start_time}
                    </span>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Veículo
                    </span>
                    <span className="font-semibold text-foreground block uppercase">
                      {app.vehicle_plate || 'N/A'}
                    </span>
                    <span className="text-xs text-muted-foreground block truncate max-w-[100px]">
                      {app.vehicle_model}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Problema Relatado
                  </span>
                  <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed bg-muted/30 p-3 rounded-md border border-border/50 min-h-[4.5rem]">
                    {app.problema_descricao || (
                      <span className="italic opacity-50">
                        Nenhuma descrição fornecida pelo cliente.
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-4 pb-4 bg-muted/10 border-t border-border/50 flex justify-between items-center gap-2">
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                    title="Editar"
                    onClick={() => handleEdit(app.id)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 text-orange-500 hover:bg-orange-50 hover:border-orange-200"
                    title="Cancelar"
                    onClick={() => handleCancel(app.id)}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 text-red-500 hover:bg-red-50 hover:border-red-200"
                    title="Excluir"
                    onClick={() => handleDelete(app.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  className="gap-2 flex-1 shadow-sm font-semibold"
                  onClick={() => handleStart(app)}
                >
                  <Play className="w-4 h-4 fill-current" /> Iniciar Cotação
                </Button>
              </CardFooter>
            </Card>
          ))}
          {sortedAppointments.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground bg-card border rounded-xl shadow-sm">
              Nenhum agendamento encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
