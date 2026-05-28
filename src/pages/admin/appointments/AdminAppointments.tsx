import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { format, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Calendar as CalendarIcon, Clock, Car, User, Plus, PlayCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { useSystemData } from '@/hooks/use-system-data'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [startDate, setStartDate] = useState<Date>(startOfDay(new Date()))
  const [endDate, setEndDate] = useState<Date>(
    endOfDay(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  )
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const [clients, setClients] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: systemData } = useSystemData()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    cliente_id: '',
    vehicle_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    problema_descricao: '',
  })
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  useEffect(() => {
    loadAppointments()
  }, [startDate, endDate])

  useEffect(() => {
    if (isModalOpen) {
      loadClients()
      loadVehicles()
    }
  }, [isModalOpen])

  useEffect(() => {
    if (formData.date && isModalOpen) {
      generateTimeSlots(formData.date)
    }
  }, [formData.date, isModalOpen, systemData])

  const loadAppointments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (!error) {
      setAppointments(data || [])
    }
    setLoading(false)
  }

  const loadClients = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('is_client', true)
      .order('name')
    if (data && data.length > 0) {
      setClients(data)
    } else {
      const { data: all } = await supabase.from('profiles').select('id, name, email').order('name')
      setClients(all || [])
    }
  }

  const loadVehicles = async () => {
    const { data } = await supabase
      .from('vehicles')
      .select('id, plate, vehicle_brands(name), vehicle_models(name)')
      .order('plate')
    setVehicles(data || [])
  }

  const generateTimeSlots = async (selectedDate: string) => {
    const intervalMins = systemData?.scheduling_interval_minutes || 30
    const slots = []
    let start = 8 * 60 // 8:00
    const end = 18 * 60 // 18:00

    const { data: existing } = await supabase
      .from('appointments')
      .select('start_time')
      .eq('date', selectedDate)
    const booked = existing?.map((a) => a.start_time.substring(0, 5)) || []

    while (start < end) {
      const h = Math.floor(start / 60)
        .toString()
        .padStart(2, '0')
      const m = (start % 60).toString().padStart(2, '0')
      const timeStr = `${h}:${m}`
      if (!booked.includes(timeStr)) slots.push(timeStr)
      start += intervalMins
    }
    setAvailableSlots(slots)
  }

  const handleStartOS = (apt: any) => {
    const params = new URLSearchParams()
    if (apt.cliente_id) params.append('cliente_id', apt.cliente_id)
    if (apt.vehicle_plate) params.append('vehicle_plate', apt.vehicle_plate)
    if (apt.problema_descricao) params.append('problema_descricao', apt.problema_descricao)

    navigate(`/admin/quotes/new?${params.toString()}`)
  }

  const handleCreateAppointment = async () => {
    if (!formData.cliente_id || !formData.date || !formData.time) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }

    const client = clients.find((c) => c.id === formData.cliente_id)
    const vehicle = vehicles.find((v) => v.id === formData.vehicle_id)

    const newApt = {
      cliente_id: formData.cliente_id,
      client_name: client?.name || 'Cliente não identificado',
      vehicle_id: formData.vehicle_id === 'none' ? null : formData.vehicle_id || null,
      vehicle_plate: vehicle?.plate || null,
      vehicle_brand: vehicle?.vehicle_brands?.name || null,
      vehicle_model: vehicle?.vehicle_models?.name || null,
      date: formData.date,
      start_time: formData.time,
      end_time: formData.time,
      service_name: 'Agendamento Manual',
      problema_descricao: formData.problema_descricao,
      status: 'Pendente',
    }

    const { error } = await supabase.from('appointments').insert(newApt)
    if (error) {
      toast({ title: 'Erro ao agendar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Agendamento criado com sucesso' })
      setIsModalOpen(false)
      loadAppointments()
      setFormData({
        cliente_id: '',
        vehicle_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '',
        problema_descricao: '',
      })
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Gestão de Agendamentos</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Agendamento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Cliente *</Label>
                <Select
                  value={formData.cliente_id}
                  onValueChange={(val) => setFormData({ ...formData, cliente_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.email ? `(${c.email})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Veículo</Label>
                <Select
                  value={formData.vehicle_id}
                  onValueChange={(val) => setFormData({ ...formData, vehicle_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo (Opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum veículo</SelectItem>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.plate} - {v.vehicle_brands?.name} {v.vehicle_models?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'justify-start text-left font-normal',
                          !formData.date && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? (
                          format(new Date(formData.date + 'T12:00:00'), 'dd/MM/yyyy')
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date ? new Date(formData.date + 'T12:00:00') : undefined}
                        onSelect={(date) => {
                          if (date) setFormData({ ...formData, date: format(date, 'yyyy-MM-dd') })
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Horário *</Label>
                  <Select
                    value={formData.time}
                    onValueChange={(val) => setFormData({ ...formData, time: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.length > 0 ? (
                        availableSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Nenhum horário disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Descreva o(s) Problema(s)</Label>
                <Textarea
                  rows={4}
                  placeholder="Relato do cliente sobre o problema..."
                  value={formData.problema_descricao}
                  onChange={(e) => setFormData({ ...formData, problema_descricao: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAppointment}>Salvar Agendamento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-8 border-primary/10 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end md:items-center bg-primary/5 rounded-lg">
          <div className="grid gap-2 flex-1 w-full">
            <Label>Data Inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal bg-background"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(startDate, 'dd/MM/yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(d) => d && setStartDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2 flex-1 w-full">
            <Label>Data Final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal bg-background"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(endDate, 'dd/MM/yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(d) => d && setEndDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center p-12 bg-muted/20 rounded-lg border border-dashed">
          <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum agendamento encontrado</h3>
          <p className="text-muted-foreground">
            Tente alterar o filtro de datas ou crie um novo agendamento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((apt) => (
            <Card key={apt.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    {apt.client_name}
                  </CardTitle>
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap',
                      apt.status === 'Pendente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : apt.status === 'Confirmado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800',
                    )}
                  >
                    {apt.status}
                  </span>
                </div>
                <CardDescription className="flex items-center gap-2 mt-1 font-medium text-foreground">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  {format(new Date(apt.date + 'T12:00:00'), 'dd/MM/yyyy')}
                  <Clock className="w-4 h-4 ml-2 text-primary" />
                  {apt.start_time.substring(0, 5)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                {(apt.vehicle_plate || apt.vehicle_brand) && (
                  <div className="flex items-center gap-2 text-sm bg-muted p-2 rounded-md mb-3 border">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold uppercase tracking-wider">{apt.vehicle_plate}</span>
                    <span className="text-muted-foreground">
                      - {apt.vehicle_brand} {apt.vehicle_model}
                    </span>
                  </div>
                )}
                {apt.problema_descricao && (
                  <div className="text-sm bg-primary/5 p-3 rounded-md">
                    <p className="font-medium text-primary mb-1">Problema relatado:</p>
                    <p className="line-clamp-3 text-muted-foreground">{apt.problema_descricao}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 mt-auto">
                <Button
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStartOS(apt)}
                >
                  <PlayCircle className="w-4 h-4 mr-2" /> Iniciar (Gerar OS)
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
