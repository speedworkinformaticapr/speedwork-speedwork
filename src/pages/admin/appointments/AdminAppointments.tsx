import { useState, useMemo, useEffect } from 'react'
import { format, addDays, startOfDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarDays, Clock, Plus, ListTodo, User, CheckCircle2, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getAppointments,
  createAppointment,
  getServices,
  getClients,
  Appointment,
} from '@/services/appointments'
import { useSystemData } from '@/hooks/use-system-data'
import { formatTime, formatTimeShort, getValidSlotsForDate } from '@/lib/utils/appointments'
import { AppointmentCard } from './components/AppointmentCard'
import { AppointmentEditModal } from './components/AppointmentEditModal'
import { AppointmentDelayModal } from './components/AppointmentDelayModal'
import { useAppointmentActions } from '@/hooks/use-appointment-actions'

export default function AdminAppointments() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()
  const { data: systemData } = useSystemData()

  const [selClient, setSelClient] = useState('')
  const [selServices, setSelServices] = useState<string[]>([])

  const [newAppDetails, setNewAppDetails] = useState<{ startMin: number; dateStr: string } | null>(
    null,
  )
  const [obs, setObs] = useState('')

  const [editApp, setEditApp] = useState<Appointment | null>(null)
  const [delayApp, setDelayApp] = useState<Appointment | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [filterSearch, setFilterSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('today')

  const loadData = async () => {
    try {
      setLoading(true)
      const startStr = format(startOfDay(new Date()), 'yyyy-MM-dd')
      const endStr = format(addDays(new Date(), 60), 'yyyy-MM-dd')
      const [data, srvData, cliData] = await Promise.all([
        getAppointments(startStr, endStr),
        getServices(),
        getClients(),
      ])
      setAppointments(data)
      setServices(srvData)
      setClients(cliData)
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const actions = useAppointmentActions(loadData)

  const totalExecutionTime = useMemo(() => {
    return selServices.reduce(
      (acc, id) => acc + (services.find((s) => s.id === id)?.execution_time_minutes || 0),
      0,
    )
  }, [selServices, services])

  const validDays = useMemo(() => {
    if (selServices.length === 0 || !systemData?.business_hours) return []
    const requiredMins = totalExecutionTime || 30
    const days: Date[] = []
    let curr = startOfDay(new Date())
    const end = addDays(curr, 60)

    while (curr <= end && days.length < 14) {
      const slots = getValidSlotsForDate(
        curr,
        requiredMins,
        appointments,
        systemData.business_hours,
      )
      if (slots.length > 0) days.push(new Date(curr))
      curr = addDays(curr, 1)
    }
    return days
  }, [totalExecutionTime, appointments, systemData?.business_hours, selServices])

  useEffect(() => {
    if (validDays.length > 0) {
      const isSelectedValid =
        selectedDate && validDays.find((d) => d.toDateString() === selectedDate.toDateString())
      if (!isSelectedValid) {
        setSelectedDate(validDays[0])
      }
    } else {
      setSelectedDate(null)
    }
  }, [validDays])

  const availableSlots = useMemo(() => {
    if (!selectedDate || selServices.length === 0 || !systemData?.business_hours) return []
    return getValidSlotsForDate(
      selectedDate,
      totalExecutionTime || 30,
      appointments,
      systemData.business_hours,
    )
  }, [selectedDate, appointments, selServices, systemData?.business_hours, totalExecutionTime])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchSearch =
        a.client_name.toLowerCase().includes(filterSearch.toLowerCase()) ||
        a.service_name.toLowerCase().includes(filterSearch.toLowerCase())
      const matchStatus = filterStatus === 'all' || a.status === filterStatus
      let matchDate = true
      const today = format(new Date(), 'yyyy-MM-dd')
      if (filterDate === 'today') {
        matchDate = a.date === today
      } else if (filterDate === 'upcoming') {
        matchDate = a.date > today
      }
      return matchSearch && matchStatus && matchDate
    })
  }, [appointments, filterSearch, filterStatus, filterDate])

  const handleSlotClick = (startMin: number) => {
    if (!selectedDate) return
    setNewAppDetails({ startMin, dateStr: format(selectedDate, 'yyyy-MM-dd') })
    setObs('')
  }

  const confirmSave = async () => {
    const srvs = selServices.map((id) => services.find((s) => s.id === id)).filter(Boolean)
    const cli = clients.find((c) => c.id === selClient)
    if (srvs.length === 0 || !cli || !newAppDetails) return

    const payload = {
      date: newAppDetails.dateStr,
      start_time: formatTime(newAppDetails.startMin),
      end_time: formatTime(newAppDetails.startMin + totalExecutionTime),
      service_name: srvs.map((s) => s.name).join(', '),
      client_name: cli.name,
      status: 'Pendente',
      notes: obs,
    }

    try {
      await createAppointment(payload)
      toast({ title: 'Sucesso', description: 'Agendamento criado com sucesso!' })
      setNewAppDetails(null)
      setSelClient('')
      setSelServices([])
      setObs('')
      loadData()
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao criar agendamento.', variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in-up space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-primary" /> Painel de Agendamentos
        </h1>
        <p className="text-muted-foreground">
          Agende novos serviços e acompanhe sua agenda em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-border/50 flex items-center gap-4 transition-all hover:shadow-md hover:border-primary/30">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <ListTodo className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Total Serviços</p>
            <h3 className="text-2xl font-bold text-foreground">{appointments.length}</h3>
          </div>
        </div>
        <div className="bg-card/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-border/50 flex items-center gap-4 transition-all hover:shadow-md hover:border-primary/30">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Clientes Atendidos</p>
            <h3 className="text-2xl font-bold text-foreground">
              {new Set(appointments.map((a) => a.client_name)).size}
            </h3>
          </div>
        </div>
        <div className="bg-card/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-border/50 flex items-center gap-4 transition-all hover:shadow-md hover:border-primary/30">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Concluídos</p>
            <h3 className="text-2xl font-bold text-foreground">
              {appointments.filter((a) => a.status === 'Concluído').length}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-border/50 space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Novo Agendamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-primary">1. Selecione o Cliente</Label>
                <Select value={selClient} onValueChange={setSelClient}>
                  <SelectTrigger className="h-12 bg-background/50 border-border/50">
                    <SelectValue placeholder="Escolha um cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-primary">
                  2. Selecione os Serviços
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12 font-normal bg-background/50 border-border/50 hover:bg-background/80"
                    >
                      {selServices.length > 0
                        ? `${selServices.length} serviço(s) (${totalExecutionTime} min)`
                        : 'Escolha os serviços...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[300px] p-4 bg-card/95 backdrop-blur-xl border-border/50"
                    align="start"
                  >
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {services.map((s) => (
                        <div key={s.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`srv-${s.id}`}
                            checked={selServices.includes(s.id)}
                            onCheckedChange={(checked) => {
                              if (checked) setSelServices([...selServices, s.id])
                              else setSelServices(selServices.filter((id) => id !== s.id))
                            }}
                          />
                          <label
                            htmlFor={`srv-${s.id}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {s.name}{' '}
                            <span className="text-muted-foreground">
                              ({s.execution_time_minutes}m)
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {selServices.length > 0 && selClient && (
              <div className="space-y-6 pt-6 border-t border-border/30 animate-fade-in">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground">Datas Disponíveis</h3>
                    {validDays.length > 0 &&
                      selectedDate?.toDateString() === validDays[0].toDateString() && (
                        <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold animate-fade-in">
                          Próxima Data Livre Selecionada
                        </span>
                      )}
                  </div>
                  {validDays.length === 0 ? (
                    <div className="text-center p-6 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border/50">
                      <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      Nenhuma data com {totalExecutionTime} minutos livres.
                    </div>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                      {validDays.map((day) => {
                        const isSelected = selectedDate?.toDateString() === day.toDateString()
                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => setSelectedDate(day)}
                            className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all border shadow-sm min-w-[80px] shrink-0 ${
                              isSelected
                                ? 'bg-primary border-primary text-primary-foreground ring-2 ring-primary/20 scale-105'
                                : 'bg-background/50 border-border/50 hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold mb-1 opacity-80">
                              {format(day, 'EEEE', { locale: ptBR }).split('-')[0].substring(0, 3)}
                            </span>
                            <span className="text-2xl font-black">{format(day, 'd')}</span>
                            <span className="text-[10px] uppercase font-semibold mt-1 opacity-70">
                              {format(day, 'MMM', { locale: ptBR })}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                    <Clock className="w-4 h-4 text-primary" /> Horários Livres
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {availableSlots.length === 0 ? (
                      <div className="col-span-full text-center p-4 text-muted-foreground text-sm">
                        Selecione uma data acima.
                      </div>
                    ) : (
                      availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => handleSlotClick(slot)}
                          className="border border-border/50 bg-background/50 rounded-lg py-2 px-2 text-sm font-bold text-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors flex flex-col items-center gap-1 group"
                        >
                          {formatTimeShort(slot)}
                          <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card/40 backdrop-blur-md rounded-2xl shadow-sm border border-border/50 overflow-hidden flex flex-col h-[700px]">
            <div className="p-4 bg-muted/20 border-b border-border/50 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                <ListTodo className="w-5 h-5 text-primary" /> Lista de Agendamentos
              </h3>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente ou serviço..."
                    className="pl-9 h-9 bg-background/50 border-border/50 text-sm"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={filterDate} onValueChange={setFilterDate}>
                    <SelectTrigger className="h-9 bg-background/50 border-border/50 text-xs">
                      <SelectValue placeholder="Data" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as datas</SelectItem>
                      <SelectItem value="today">Apenas Hoje</SelectItem>
                      <SelectItem value="upcoming">Futuros</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-9 bg-background/50 border-border/50 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Confirmado">Confirmado</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3">
              {loading ? (
                <div className="text-center text-muted-foreground mt-10 text-sm">
                  Carregando dados...
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center text-muted-foreground mt-10 text-sm flex flex-col items-center gap-3">
                  <CalendarDays className="w-10 h-10 opacity-20" />
                  <p>Nenhum agendamento encontrado.</p>
                </div>
              ) : (
                filteredAppointments.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    app={a}
                    showDate={true}
                    onStart={actions.handleStart}
                    onPause={actions.handlePause}
                    onComplete={actions.handleComplete}
                    onCommunicateDelay={(app) => setDelayApp(app)}
                    onEdit={(app) => setEditApp(app)}
                    onDelete={(app) => setDeleteId(app.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!newAppDetails} onOpenChange={(o) => !o && setNewAppDetails(null)}>
        <DialogContent className="sm:max-w-[400px] bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              Confirmar Agendamento
            </DialogTitle>
          </DialogHeader>
          {newAppDetails && (
            <div className="py-4 space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm space-y-2">
                <p>
                  <strong className="text-foreground">Data:</strong>{' '}
                  {format(parseISO(newAppDetails.dateStr), 'dd/MM/yyyy')}
                </p>
                <p>
                  <strong className="text-foreground">Horário:</strong>{' '}
                  {formatTimeShort(newAppDetails.startMin)} às{' '}
                  {formatTimeShort(newAppDetails.startMin + totalExecutionTime)}
                </p>
                <p>
                  <strong className="text-foreground">Cliente:</strong>{' '}
                  {clients.find((c) => c.id === selClient)?.name}
                </p>
                <p>
                  <strong className="text-foreground">Tempo Total:</strong> {totalExecutionTime}{' '}
                  minutos
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Observações adicionais (opcional)</Label>
                <Textarea
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Detalhes..."
                  className="resize-none bg-background/50 border-border/50"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewAppDetails(null)}
              className="border-border/50 bg-background/50"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50 bg-background/50">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  actions.handleConfirmDelete(deleteId)
                  setDeleteId(null)
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
