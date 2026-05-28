import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Play, Pause, Check, Trash2, Clock, Plus, Edit, User, Wrench } from 'lucide-react'
import { useAppointmentActions } from '@/hooks/use-appointment-actions'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Appointment } from '@/services/appointments'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [currentAppointment, setCurrentAppointment] = useState<Partial<Appointment> | null>(null)

  const loadAppointments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar agendamentos.',
        variant: 'destructive',
      })
    } else {
      setAppointments(data as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const { handleStart, handlePause, handleComplete, handleConfirmDelete, handleDelayCommunicate } =
    useAppointmentActions(loadAppointments)

  const handleOpenManage = (app?: Appointment) => {
    if (app) {
      setCurrentAppointment(app)
    } else {
      setCurrentAppointment({
        client_name: '',
        service_name: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        status: 'Pendente',
      } as Partial<Appointment>)
    }
    setIsSheetOpen(true)
  }

  const handleSave = async () => {
    if (
      !currentAppointment?.client_name ||
      !currentAppointment?.service_name ||
      !currentAppointment?.date ||
      !currentAppointment?.start_time ||
      !currentAppointment?.end_time
    ) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    try {
      if (currentAppointment.id) {
        const { error } = await supabase
          .from('appointments')
          .update({
            client_name: currentAppointment.client_name,
            service_name: currentAppointment.service_name,
            date: currentAppointment.date,
            start_time: currentAppointment.start_time,
            end_time: currentAppointment.end_time,
          })
          .eq('id', currentAppointment.id)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Agendamento atualizado.' })
      } else {
        const { error } = await supabase.from('appointments').insert([
          {
            client_name: currentAppointment.client_name,
            service_name: currentAppointment.service_name,
            date: currentAppointment.date,
            start_time: currentAppointment.start_time,
            end_time: currentAppointment.end_time,
            status: 'Pendente',
          },
        ])
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Agendamento criado.' })
      }
      setIsSheetOpen(false)
      loadAppointments()
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar o agendamento.', variant: 'destructive' })
    }
  }

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return ''
    return timeStr.substring(0, 5)
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os agendamentos e serviços unificados.
          </p>
        </div>
        <Button
          onClick={() => handleOpenManage()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/20 border-b border-border/50">
          <CardTitle className="text-lg">Lista de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10 hover:bg-muted/10">
                  <TableHead className="font-semibold whitespace-nowrap">Data</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Horário</TableHead>
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Serviço</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Carregando agendamentos...
                    </TableCell>
                  </TableRow>
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Nenhum agendamento encontrado no sistema.
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((app) => (
                    <TableRow key={app.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="whitespace-nowrap font-medium text-sm">
                        {formatDate(app.date)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatTime(app.start_time)} às {formatTime(app.end_time)}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{app.client_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {app.service_name}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary whitespace-nowrap">
                          {app.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {(app.status === 'Pendente' || app.status === 'Pausado') && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              onClick={() => handleStart(app)}
                              title="Iniciar"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}

                          {app.status === 'Em Andamento' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                              onClick={() => handlePause(app)}
                              title="Pausar"
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}

                          {(app.status === 'Em Andamento' || app.status === 'Pausado') && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                              onClick={() => handleComplete(app)}
                              title="Concluir"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                            onClick={() =>
                              handleDelayCommunicate(app, 'Atraso operacional identificado.')
                            }
                            title="Notificar Atraso"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleOpenManage(app)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                            onClick={() => handleConfirmDelete(app.id)}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[450px] flex flex-col h-full bg-background border-l border-border/50 shadow-2xl">
          <SheetHeader className="pb-4 border-b border-border/50">
            <SheetTitle className="text-xl font-bold tracking-tight">
              {currentAppointment?.id ? 'Editar Agendamento' : 'Novo Agendamento'}
            </SheetTitle>
            <SheetDescription className="text-sm">
              {currentAppointment?.id
                ? 'Atualize as informações do serviço agendado.'
                : 'Preencha os detalhes para inserir um novo agendamento.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-6">
            <div className="grid gap-6">
              <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border/30">
                <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase flex items-center gap-2">
                  <User className="w-4 h-4" /> Dados do Cliente
                </h3>
                <div className="grid gap-2">
                  <Label htmlFor="client_name" className="text-xs font-bold text-foreground">
                    Nome Completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="client_name"
                    value={currentAppointment?.client_name || ''}
                    onChange={(e) =>
                      setCurrentAppointment((prev) => ({ ...prev!, client_name: e.target.value }))
                    }
                    placeholder="Ex: João da Silva"
                    className="bg-background border-border/50 focus-visible:ring-primary h-10"
                  />
                </div>
              </div>

              <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border/30">
                <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase flex items-center gap-2">
                  <Wrench className="w-4 h-4" /> Detalhes do Serviço
                </h3>
                <div className="grid gap-2">
                  <Label htmlFor="service_name" className="text-xs font-bold text-foreground">
                    Serviço a ser realizado <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="service_name"
                    value={currentAppointment?.service_name || ''}
                    onChange={(e) =>
                      setCurrentAppointment((prev) => ({ ...prev!, service_name: e.target.value }))
                    }
                    placeholder="Ex: Troca de Óleo e Filtro"
                    className="bg-background border-border/50 focus-visible:ring-primary h-10"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="date" className="text-xs font-bold text-foreground">
                    Data <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={currentAppointment?.date || ''}
                    onChange={(e) =>
                      setCurrentAppointment((prev) => ({ ...prev!, date: e.target.value }))
                    }
                    className="bg-background border-border/50 focus-visible:ring-primary h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_time" className="text-xs font-bold text-foreground">
                      Horário Início <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={currentAppointment?.start_time || ''}
                      onChange={(e) =>
                        setCurrentAppointment((prev) => ({ ...prev!, start_time: e.target.value }))
                      }
                      className="bg-background border-border/50 focus-visible:ring-primary h-10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end_time" className="text-xs font-bold text-foreground">
                      Horário Fim <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={currentAppointment?.end_time || ''}
                      onChange={(e) =>
                        setCurrentAppointment((prev) => ({ ...prev!, end_time: e.target.value }))
                      }
                      className="bg-background border-border/50 focus-visible:ring-primary h-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 mt-auto flex justify-end gap-3 bg-background">
            <Button
              variant="outline"
              className="h-10 px-6 font-semibold border-border/50"
              onClick={() => setIsSheetOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="h-10 px-6 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              onClick={handleSave}
            >
              Salvar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
