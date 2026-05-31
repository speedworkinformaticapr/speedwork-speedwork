import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { LayoutGrid, List, Play, Calendar, Clock, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Appointment = any

const COLUMNS = [
  {
    id: 'agendamentos',
    label: 'Agendamentos',
    statuses: ['Pendente Confirmação', 'Solicitar Confirmação', 'Confirmado pelo Cliente'],
  },
  { id: 'recepcao', label: 'Recepção', statuses: ['Recebido no Horário', 'Recebido c/ Atraso'] },
  {
    id: 'orcamentos',
    label: 'Orçamentos',
    statuses: ['OS Rascunho', 'Aguardando Aprovação', 'Aprovado', 'Não Aprovado'],
  },
  {
    id: 'servico',
    label: 'Em Serviço',
    statuses: ['Solicitado Ajustes', 'Em Ajustes', 'Pré-Fechada'],
  },
  { id: 'concluido', label: 'Concluído', statuses: ['Fechada'] },
]

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'kanban' | 'grid'>('kanban')
  const { toast } = useToast()
  const navigate = useNavigate()

  const loadData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select('*, vehicles(brand_id, model_id, chassis, version)')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
    if (!error && data) setAppointments(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Status Atualizado', description: `O status foi alterado para ${newStatus}.` })
      loadData()
    }
  }

  const handleStartOS = async (app: Appointment) => {
    try {
      const { data: os, error } = await supabase
        .from('orcamentos')
        .insert({
          cliente_id: app.cliente_id,
          veiculo_placa: app.vehicle_plate || '',
          veiculo_brand_id: app.vehicles?.brand_id || null,
          veiculo_model_id: app.vehicles?.model_id || null,
          veiculo_modelo: app.vehicle_model || '',
          veiculo_km: '0',
          status: 'rascunho',
          data_emissao: new Date().toISOString().split('T')[0],
          observacoes: app.problema_descricao,
        })
        .select()
        .single()

      if (error) throw error

      await supabase
        .from('appointments')
        .update({
          orcamento_id: os.id,
          status: 'OS Rascunho',
          last_started_at: new Date().toISOString(),
        })
        .eq('id', app.id)

      toast({ title: 'OS Iniciada', description: 'Orçamento criado com sucesso.' })
      navigate(`/admin/commercial/quotes/${os.id}/edit`)
    } catch (err: any) {
      toast({ title: 'Erro ao Iniciar OS', description: err.message, variant: 'destructive' })
    }
  }

  const handleRequestConfirmation = async (app: Appointment) => {
    try {
      await updateStatus(app.id, 'Solicitar Confirmação')
      await supabase.functions.invoke('enviar_whatsapp', {
        body: {
          empresa_id: '00000000-0000-0000-0000-000000000001',
          tipo_mensagem: 'confirmacao_agendamento',
          telefone_destino: '5541999999999',
          mensagem_customizada: `Olá ${app.client_name}, confirme seu agendamento para ${format(new Date(app.date), 'dd/MM/yyyy')} às ${app.start_time.substring(0, 5)} acessando: ${window.location.origin}/agendar/${app.id}`,
        },
      })
      toast({ title: 'Solicitação Enviada', description: 'Mensagem enviada ao cliente.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const KanbanCard = ({ app }: { app: Appointment }) => (
    <Card className="mb-3 shadow-sm border-l-4 border-l-primary hover:shadow-md transition-shadow">
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-start">
          <span className="font-semibold text-sm">{app.client_name}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleRequestConfirmation(app)}>
                Solicitar Confirmação (WhatsApp)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus(app.id, 'Recebido no Horário')}>
                Marcar como Recebido
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus(app.id, 'Recebido c/ Atraso')}>
                Recebido c/ Atraso
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {format(new Date(app.date), 'dd/MM/yyyy')}
          <Clock className="w-3 h-3 ml-2" /> {app.start_time.substring(0, 5)}
        </div>
        <div className="text-xs">
          <strong>Veículo:</strong> {app.vehicle_plate} - {app.vehicle_model}
        </div>
        <Badge variant="secondary" className="text-[10px]">
          {app.status}
        </Badge>

        {['Confirmado pelo Cliente', 'Recebido no Horário', 'Recebido c/ Atraso'].includes(
          app.status,
        ) && (
          <Button size="sm" className="w-full mt-2" onClick={() => handleStartOS(app)}>
            <Play className="w-4 h-4 mr-2" /> Iniciar OS
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos & Oficina</h1>
          <p className="text-muted-foreground">
            Gerencie o fluxo de serviços do agendamento à entrega.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="w-4 h-4 mr-2" /> Kanban
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <List className="w-4 h-4 mr-2" /> Lista
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start">
          {COLUMNS.map((col) => {
            const colApps = appointments.filter((a) => col.statuses.includes(a.status))
            return (
              <div
                key={col.id}
                className="flex-shrink-0 w-80 bg-muted/30 rounded-xl p-4 border flex flex-col max-h-[80vh]"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">{col.label}</h3>
                  <Badge variant="secondary">{colApps.length}</Badge>
                </div>
                <div className="overflow-y-auto flex-1 pr-1">
                  {colApps.map((app) => (
                    <KanbanCard key={app.id} app={app} />
                  ))}
                  {colApps.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                      Vazio
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="font-medium">{format(new Date(app.date), 'dd/MM/yyyy')}</div>
                    <div className="text-xs text-muted-foreground">
                      {app.start_time.substring(0, 5)}
                    </div>
                  </TableCell>
                  <TableCell>{app.client_name}</TableCell>
                  <TableCell>
                    <div className="uppercase">{app.vehicle_plate}</div>
                    <div className="text-xs text-muted-foreground">{app.vehicle_model}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{app.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Ações
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {[
                          'Confirmado pelo Cliente',
                          'Recebido no Horário',
                          'Recebido c/ Atraso',
                        ].includes(app.status) && (
                          <DropdownMenuItem onClick={() => handleStartOS(app)}>
                            Iniciar OS
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleRequestConfirmation(app)}>
                          Solicitar Confirmação
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(app.id, 'Recebido no Horário')}
                        >
                          Marcar como Recebido
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
