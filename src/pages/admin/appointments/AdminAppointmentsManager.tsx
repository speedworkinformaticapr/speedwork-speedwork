import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { CalendarDays, RefreshCw } from 'lucide-react'

export default function AdminAppointmentsManager() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false })
    if (data) setAppointments(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const updateStatus = async (app: any, novoStatus: string) => {
    setIsUpdating(app.id)
    try {
      const isConcluido = novoStatus === 'Concluído'
      const linkPagamento = isConcluido
        ? `https://pagamento.exemplo.com/req_${app.id.slice(0, 5)}`
        : null

      const { error } = await supabase
        .from('appointments')
        .update({
          status: novoStatus,
          ...(linkPagamento && { link_pagamento: linkPagamento }),
        })
        .eq('id', app.id)

      if (error) throw error

      // Notificar cliente via WhatsApp
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, autoriza_whatsapp, telefone_whatsapp')
        .eq('name', app.client_name)
        .limit(1)
        .maybeSingle()

      if (prof?.autoriza_whatsapp && prof?.telefone_whatsapp) {
        await supabase.functions.invoke('enviar_whatsapp', {
          body: {
            cliente_id: prof.id,
            telefone_destino: prof.telefone_whatsapp,
            tipo_mensagem: isConcluido ? 'agendamento_conclusao' : 'agendamento_status',
            variaveis: {
              cliente_nome: app.client_name,
              novo_status: novoStatus,
              data_atualizacao: new Date().toLocaleDateString(),
              valor_servico: 'R$ 0,00', // Mock
              link_pagamento: linkPagamento || '',
              data_conclusao: new Date().toLocaleDateString(),
            },
          },
        })
        await supabase.from('appointments').update({ whatsapp_enviado: true }).eq('id', app.id)
        toast({ title: 'Sucesso', description: 'Status atualizado e WhatsApp enviado!' })
      } else {
        toast({
          title: 'Sucesso',
          description: 'Status atualizado. Cliente sem WhatsApp configurado/autorizado.',
        })
      }

      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Agendamentos</h1>
          <p className="text-muted-foreground">
            Listagem completa e controle de status de serviços.
          </p>
        </div>
      </div>

      <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Msg Enviada</TableHead>
                <TableHead>Link PGTO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{format(new Date(app.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-medium">{app.client_name}</TableCell>
                    <TableCell>{app.service_name}</TableCell>
                    <TableCell>
                      {app.start_time.substring(0, 5)} - {app.end_time.substring(0, 5)}
                    </TableCell>
                    <TableCell>
                      <Select
                        disabled={isUpdating === app.id}
                        value={app.status}
                        onValueChange={(v) => updateStatus(app, v)}
                      >
                        <SelectTrigger className="h-8 w-[140px] text-xs">
                          {isUpdating === app.id ? 'Atualizando...' : <SelectValue />}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Confirmado">Confirmado</SelectItem>
                          <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                          <SelectItem value="Concluído">Concluído</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {app.whatsapp_enviado ? (
                        <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                          ✓ Sim
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs flex items-center gap-1">
                          ✗ Não
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {app.link_pagamento ? (
                        <a
                          href={app.link_pagamento}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Ver Link
                        </a>
                      ) : (
                        '-'
                      )}
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
