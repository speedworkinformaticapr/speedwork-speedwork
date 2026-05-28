import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { useSystemData } from '@/hooks/use-system-data'
import { CalendarIcon, LayoutGrid, List, Plus, Clock, Wrench, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { data: systemData } = useSystemData()

  const [clientName, setClientName] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState('')
  const [problemDesc, setProblemDesc] = useState('')
  const [plate, setPlate] = useState('')

  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false })
      .order('start_time', { ascending: false })
      .limit(100)
    if (data) setAppointments(data)
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    if (date) {
      loadSlots(format(date, 'yyyy-MM-dd'))
    }
  }, [date, appointments, systemData?.scheduling_interval_minutes])

  const loadSlots = async (selectedDate: string) => {
    const interval = systemData?.scheduling_interval_minutes || 30
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
      start += interval
    }
    setAvailableSlots(slots)
  }

  const handleCreate = async () => {
    if (!clientName || !serviceName || !date || !time) {
      toast({
        title: 'Atenção',
        description: 'Preencha os campos obrigatórios',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    const { error } = await supabase.from('appointments').insert({
      client_name: clientName,
      service_name: serviceName,
      date: format(date, 'yyyy-MM-dd'),
      start_time: time,
      end_time: time,
      problema_descricao: problemDesc,
      vehicle_plate: plate,
      status: 'Pendente Confirmação',
    })
    setLoading(false)

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Agendamento criado com sucesso!' })
      setIsDialogOpen(false)
      setClientName('')
      setServiceName('')
      setTime('')
      setProblemDesc('')
      setPlate('')
      fetchAppointments()
    }
  }

  const formatDateSafe = (dateStr: string) => {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-')
    return format(new Date(Number(y), Number(m) - 1, Number(d)), 'dd/MM/yyyy')
  }

  return (
    <div className="container py-8 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Agendamentos</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe e gerencie todos os serviços e compromissos marcados.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-muted rounded-lg p-1 shrink-0">
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="icon"
              className="w-8 h-8 rounded-md"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="w-8 h-8 rounded-md"
              onClick={() => setViewMode('grid')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Agendamento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="space-y-2">
                  <Label>Nome do Cliente *</Label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Maria da Silva"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Serviço *</Label>
                    <Input
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="Ex: Revisão Geral"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Placa do Veículo</Label>
                    <Input
                      value={plate}
                      onChange={(e) => setPlate(e.target.value)}
                      placeholder="ABC-1234"
                      className="uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !date && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, 'dd/MM/yyyy') : <span>Selecione a data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => {
                            setDate(d)
                            setTime('')
                          }}
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Horário *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {time || <span className="text-muted-foreground">Escolher horário</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-4">
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.length > 0 ? (
                            availableSlots.map((slot) => (
                              <Button
                                key={slot}
                                type="button"
                                variant={time === slot ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTime(slot)}
                              >
                                {slot}
                              </Button>
                            ))
                          ) : (
                            <div className="col-span-3 text-center text-sm text-muted-foreground py-2">
                              Sem horários nesta data
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descreva o(s) Problema(s)</Label>
                  <Textarea
                    rows={4}
                    value={problemDesc}
                    onChange={(e) => setProblemDesc(e.target.value)}
                    placeholder="Forneça detalhes que ajudem no diagnóstico..."
                    className="resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={loading}>
                  Salvar Agendamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {appointments.length === 0 ? (
            <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
              Nenhum agendamento encontrado no sistema.
            </div>
          ) : (
            appointments.map((app) => (
              <Card
                key={app.id}
                className="shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <CardHeader className="pb-4 border-b bg-muted/30">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-base font-semibold leading-tight line-clamp-2 pr-2">
                      {app.client_name}
                    </CardTitle>
                    <span className="text-[11px] font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full shrink-0">
                      {app.status}
                    </span>
                  </div>
                  <CardDescription className="flex items-center text-foreground font-medium text-sm">
                    <Wrench className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
                    <span className="truncate">{app.service_name}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="w-4 h-4 mr-2.5 shrink-0" />
                    {formatDateSafe(app.date)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2.5 shrink-0" />
                    {app.start_time.substring(0, 5)}
                  </div>
                  {app.vehicle_plate && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="font-mono bg-background border px-1.5 py-0.5 rounded text-xs mr-2 shrink-0">
                        {app.vehicle_plate}
                      </span>
                      Placa do Veículo
                    </div>
                  )}
                  {app.problema_descricao && (
                    <div className="pt-3 border-t mt-4">
                      <div className="flex items-center text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">
                        <FileText className="w-3 h-3 mr-1" />
                        Descrição do Problema
                      </div>
                      <p className="text-sm line-clamp-3 leading-relaxed text-foreground/80">
                        {app.problema_descricao}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card className="shadow-sm">
          <div className="overflow-x-auto rounded-lg">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[120px]">Data</TableHead>
                  <TableHead className="w-[80px]">Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Nenhum agendamento encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((app) => (
                    <TableRow key={app.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDateSafe(app.date)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {app.start_time.substring(0, 5)}
                      </TableCell>
                      <TableCell className="font-medium">{app.client_name}</TableCell>
                      <TableCell>{app.service_name}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs border rounded px-1.5 py-0.5 bg-muted/20">
                          {app.vehicle_plate || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium whitespace-nowrap">
                          {app.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
