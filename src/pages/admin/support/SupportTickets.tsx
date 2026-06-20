import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatSLA, getPriorityColor } from '@/lib/utils/tickets'
import { TicketForm } from './components/TicketForm'
import { TicketDetailPanel } from './components/TicketDetailPanel'
import { Plus } from 'lucide-react'

export default function SupportTickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const [configs, setConfigs] = useState<any[]>([])
  const [now, setNow] = useState(Date.now())
  const [openForm, setOpenForm] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')

  const loadData = async () => {
    const { data: c } = await supabase.from('ticket_sla_configs').select('*')
    if (c) setConfigs(c)
    const { data: t } = await supabase
      .from('support_tickets')
      .select('*, client:client_id(name), tech:technician_id(name)')
      .order('created_at', { ascending: false })
    if (t) setTickets(t)
  }

  useEffect(() => {
    loadData()
    const int = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(int)
  }, [])

  const filtered = tickets.filter((t) => {
    if (filter === 'open') return t.status !== 'Resolvido' && t.status !== 'Fechado'
    return true
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tickets de Suporte</h1>
          <p className="text-muted-foreground">Gerencie solicitações e SLAs.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Todos
          </Button>
          <Button
            variant={filter === 'open' ? 'default' : 'outline'}
            onClick={() => setFilter('open')}
          >
            Em Andamento
          </Button>
          <Button onClick={() => setOpenForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Novo Ticket
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>SLA (Resolução)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => {
              const sla = formatSLA(t, configs)
              return (
                <TableRow
                  key={t.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTicket(t.id)}
                >
                  <TableCell>#{t.ticket_number}</TableCell>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell>{t.client?.name}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(t.priority)}>{t.priority}</Badge>
                  </TableCell>
                  <TableCell>{t.status}</TableCell>
                  <TableCell>{t.tech?.name || 'Não atribuído'}</TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold ${sla.expired ? 'text-destructive' : sla.paused ? 'text-yellow-600' : 'text-green-600'}`}
                    >
                      {sla.text} {sla.paused && '(Pausado)'}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Nenhum ticket encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TicketForm open={openForm} onOpenChange={setOpenForm} onSuccess={loadData} />
      {selectedTicket && (
        <TicketDetailPanel
          ticketId={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  )
}
