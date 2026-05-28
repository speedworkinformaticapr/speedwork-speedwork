import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Appointment } from '@/services/appointments'
import { Plus, Search, UserPlus } from 'lucide-react'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [open, setOpen] = useState(false)

  // New Appointment State
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [clientProfile, setClientProfile] = useState<any>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  const [appointmentData, setAppointmentData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    service_name: '',
    notes: '',
  })

  // New Client State
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('appointments' as any)
      .select('*')
      .order('date', { ascending: false })
      .order('start_time', { ascending: false })
      .limit(50)

    if (data) setAppointments(data as Appointment[])
    setLoading(false)
  }

  const handleSearchClient = async () => {
    if (!cpfCnpj) {
      toast({ title: 'Atenção', description: 'Digite o CPF/CNPJ', variant: 'destructive' })
      return
    }

    setSearchLoading(true)
    setShowNewClientForm(false)
    setClientProfile(null)

    // Remove non-numeric characters for search flexibility
    const cleanDoc = cpfCnpj.replace(/\D/g, '')

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, phone, cpf_cnpj')
      .or(`cpf_cnpj.eq.${cpfCnpj},cpf_cnpj.eq.${cleanDoc}`)
      .maybeSingle()

    setSearchLoading(false)

    if (data) {
      setClientProfile(data)
      toast({ title: 'Cliente Encontrado', description: `Nome: ${data.name}` })
    } else {
      setShowNewClientForm(true)
      toast({
        title: 'Cliente não encontrado',
        description: 'Por favor, cadastre o novo cliente preenchendo os dados abaixo.',
        variant: 'default',
      })
    }
  }

  const handleRegisterClient = async () => {
    if (!newClientData.name) {
      toast({ title: 'Atenção', description: 'O nome é obrigatório.', variant: 'destructive' })
      return
    }

    setSearchLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        cpf_cnpj: cpfCnpj,
        is_client: true,
      })
      .select('id, name, email, phone')
      .single()

    setSearchLoading(false)

    if (error) {
      toast({ title: 'Erro ao cadastrar', description: error.message, variant: 'destructive' })
    } else {
      setClientProfile(data)
      setShowNewClientForm(false)
      toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso!' })
    }
  }

  const handleCreateAppointment = async () => {
    if (
      !clientProfile ||
      !appointmentData.date ||
      !appointmentData.start_time ||
      !appointmentData.service_name
    ) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos obrigatórios do agendamento.',
        variant: 'destructive',
      })
      return
    }

    const { error } = await supabase.from('appointments' as any).insert({
      cliente_id: clientProfile.id,
      client_name: clientProfile.name,
      date: appointmentData.date,
      start_time: appointmentData.start_time,
      end_time: appointmentData.end_time || appointmentData.start_time,
      service_name: appointmentData.service_name,
      notes: appointmentData.notes,
      status: 'Pendente',
    })

    if (error) {
      toast({
        title: 'Erro ao criar agendamento',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Agendamento Confirmado', description: 'O agendamento foi salvo no sistema.' })
      setOpen(false)
      loadAppointments()

      setCpfCnpj('')
      setClientProfile(null)
      setShowNewClientForm(false)
      setAppointmentData({ date: '', start_time: '', end_time: '', service_name: '', notes: '' })
      setNewClientData({ name: '', email: '', phone: '' })
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Agendamentos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Criar Novo Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                <Label className="text-base font-semibold">Identificação do Cliente</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite o CPF ou CNPJ"
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchClient()}
                  />
                  <Button onClick={handleSearchClient} disabled={searchLoading} variant="secondary">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>

                {clientProfile && (
                  <div className="bg-green-50 p-3 rounded-md border border-green-200 mt-2">
                    <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-1">
                      Cliente Selecionado
                    </p>
                    <p className="text-lg font-bold text-green-900">{clientProfile.name}</p>
                    <p className="text-sm text-green-800">
                      {clientProfile.email || 'Sem e-mail'} |{' '}
                      {clientProfile.phone || 'Sem telefone'}
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="px-0 h-auto text-green-700 mt-2"
                      onClick={() => {
                        setClientProfile(null)
                        setCpfCnpj('')
                      }}
                    >
                      Alterar cliente
                    </Button>
                  </div>
                )}

                {showNewClientForm && !clientProfile && (
                  <div className="mt-4 p-4 border border-orange-200 bg-orange-50/50 rounded-lg space-y-4">
                    <div className="flex items-center gap-2 text-orange-800 mb-2">
                      <UserPlus className="w-5 h-5" />
                      <h4 className="font-semibold">Cadastrar Novo Cliente</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Nome Completo *</Label>
                        <Input
                          value={newClientData.name}
                          onChange={(e) =>
                            setNewClientData({ ...newClientData, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newClientData.email}
                            onChange={(e) =>
                              setNewClientData({ ...newClientData, email: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Telefone / WhatsApp</Label>
                          <Input
                            value={newClientData.phone}
                            onChange={(e) =>
                              setNewClientData({ ...newClientData, phone: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handleRegisterClient}
                        disabled={searchLoading}
                        className="w-full mt-2"
                      >
                        Salvar e Continuar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Detalhes do Serviço</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <Input
                      type="date"
                      value={appointmentData.date}
                      onChange={(e) =>
                        setAppointmentData({ ...appointmentData, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora Início *</Label>
                    <Input
                      type="time"
                      value={appointmentData.start_time}
                      onChange={(e) =>
                        setAppointmentData({ ...appointmentData, start_time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Serviço *</Label>
                  <Input
                    placeholder="Ex: Manutenção, Avaliação, etc."
                    value={appointmentData.service_name}
                    onChange={(e) =>
                      setAppointmentData({ ...appointmentData, service_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Input
                    placeholder="Informações adicionais..."
                    value={appointmentData.notes}
                    onChange={(e) =>
                      setAppointmentData({ ...appointmentData, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateAppointment}
                  disabled={!clientProfile || searchLoading}
                >
                  Confirmar Agendamento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Carregando agendamentos...
                  </TableCell>
                </TableRow>
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum agendamento encontrado no sistema.
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">
                      {new Date(apt.date + 'T12:00:00Z').toLocaleDateString('pt-BR', {
                        timeZone: 'UTC',
                      })}
                    </TableCell>
                    <TableCell>{apt.start_time.substring(0, 5)}</TableCell>
                    <TableCell>{apt.client_name}</TableCell>
                    <TableCell>{apt.service_name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          apt.status === 'Concluído'
                            ? 'bg-green-100 text-green-800'
                            : apt.status === 'Cancelado'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
