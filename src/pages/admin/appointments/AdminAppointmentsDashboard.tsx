import { useState, useEffect, useMemo } from 'react'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'
import { CalendarDays, User, Filter, LayoutDashboard } from 'lucide-react'
import { Appointment, getAppointments, getServices } from '@/services/appointments'
import { AppointmentCard } from './components/AppointmentCard'
import { AppointmentEditModal } from './components/AppointmentEditModal'
import { AppointmentDelayModal } from './components/AppointmentDelayModal'
import { useAppointmentActions } from '@/hooks/use-appointment-actions'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AdminAppointmentsDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()

  const [filterClient, setFilterClient] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterStartDate, setFilterStartDate] = useState(
    format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  )
  const [filterEndDate, setFilterEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))

  const [editApp, setEditApp] = useState<Appointment | null>(null)
  const [delayApp, setDelayApp] = useState<Appointment | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const dStr = format(new Date(2020, 0, 1), 'yyyy-MM-dd')
      const [data, srvs] = await Promise.all([getAppointments(dStr, '2099-12-31'), getServices()])
      setAppointments(data)
      setServices(srvs)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const actions = useAppointmentActions(loadData)

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appId)
      if (error) throw error
      toast({
        title: 'Status Atualizado',
        description: `O agendamento foi alterado para ${newStatus}.`,
      })
      loadData()
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao atualizar o status.', variant: 'destructive' })
    }
  }

  const uniqueClients = useMemo(() => {
    return Array.from(new Set(appointments.map((a) => a.client_name))).sort()
  }, [appointments])

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(appointments.map((a) => a.status))).sort()
  }, [appointments])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      if (filterClient !== 'all' && app.client_name !== filterClient) return false
      if (filterStatus !== 'all' && app.status !== filterStatus) return false
      if (filterStartDate && app.date < filterStartDate) return false
      if (filterEndDate && app.date > filterEndDate) return false
      return true
    })
  }, [appointments, filterClient, filterStatus, filterStartDate, filterEndDate])

  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort(
      (a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time),
    )
  }, [filteredAppointments])

  const filteredUniqueClientsCount = useMemo(() => {
    return new Set(filteredAppointments.map((a) => a.client_name)).size
  }, [filteredAppointments])

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Dashboard de Agendamentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral e controle rápido de todos os agendamentos organizados por cliente e
            período.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-card/40 backdrop-blur-md p-6 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,243,255,0.05)] border border-border dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-end">
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-1.5 text-foreground font-medium">
              <User className="w-4 h-4 text-primary" /> Cliente
            </Label>
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger className="bg-background/50 border-white/10">
                <SelectValue placeholder="Todos os Clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Clientes</SelectItem>
                {uniqueClients.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-1.5 text-foreground font-medium">
              <Filter className="w-4 h-4 text-primary" /> Status
            </Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-background/50 border-white/10">
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {uniqueStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-1.5 text-foreground font-medium">
              <CalendarDays className="w-4 h-4 text-primary" /> Data Inicial
            </Label>
            <Input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-1.5 text-foreground font-medium">
              <CalendarDays className="w-4 h-4 text-primary" /> Data Final
            </Label>
            <Input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-card/40 backdrop-blur-md p-6 rounded-2xl border border-border dark:border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,243,255,0.05)] flex flex-col justify-center gap-2 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
            <div className="flex items-center gap-4 mb-1 relative z-10">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                <CalendarDays className="w-6 h-6" />
              </div>
              <p className="text-sm text-muted-foreground font-semibold leading-tight">
                Total Serviços
                <br />
                no Período
              </p>
            </div>
            <p className="text-4xl font-black text-foreground pl-16 relative z-10">
              {filteredAppointments.length}
            </p>
          </div>
          <div className="bg-card/40 backdrop-blur-md p-6 rounded-2xl border border-border dark:border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,243,255,0.05)] flex flex-col justify-center gap-2 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-500"></div>
            <div className="flex items-center gap-4 mb-1 relative z-10">
              <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <p className="text-sm text-muted-foreground font-semibold leading-tight">
                Clientes
                <br />
                Atendidos
              </p>
            </div>
            <p className="text-4xl font-black text-foreground pl-16 relative z-10">
              {filteredUniqueClientsCount}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-12 text-muted-foreground bg-card/40 backdrop-blur-md rounded-2xl border border-border dark:border-white/10 shadow-sm animate-pulse">
          Carregando informações do dashboard...
        </div>
      ) : sortedAppointments.length === 0 ? (
        <div className="bg-card/40 backdrop-blur-md p-16 text-center rounded-2xl border border-border dark:border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,243,255,0.05)] flex flex-col items-center">
          <Filter className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold text-foreground">Nenhum agendamento encontrado</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Não há serviços agendados para os filtros selecionados. Tente ampliar o período ou
            selecionar outro cliente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAppointments.map((a) => (
            <AppointmentCard
              key={a.id}
              app={a}
              isDashboard={true}
              onStatusChange={handleStatusChange}
              onStart={actions.handleStart}
              onPause={actions.handlePause}
              onComplete={actions.handleComplete}
              onCommunicateDelay={(app) => setDelayApp(app)}
              onEdit={(app) => setEditApp(app)}
              onDelete={(app) => setDeleteId(app.id)}
            />
          ))}
        </div>
      )}

      <AppointmentEditModal
        app={editApp}
        isOpen={!!editApp}
        onClose={() => setEditApp(null)}
        onSuccess={loadData}
        services={services}
      />
      <AppointmentDelayModal
        app={delayApp}
        isOpen={!!delayApp}
        onClose={() => setDelayApp(null)}
        onConfirm={actions.handleDelayCommunicate}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento da grade? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteId) {
                  actions.handleConfirmDelete(deleteId)
                  setDeleteId(null)
                }
              }}
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
