import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

export function TicketDetailPanel({ ticketId, onClose, onUpdate }: any) {
  const { user } = useAuth()
  const [ticket, setTicket] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [techs, setTechs] = useState<any[]>([])
  const [note, setNote] = useState('')

  const load = async () => {
    if (!ticketId) return
    const { data: t } = await supabase
      .from('support_tickets')
      .select('*, client:client_id(name)')
      .eq('id', ticketId)
      .single()
    const { data: h } = await supabase
      .from('ticket_history')
      .select('*, user:created_by(name)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
    const { data: users } = await supabase
      .from('profiles')
      .select('id, name')
      .in('role', ['admin', 'staff', 'master'])
    setTicket(t)
    setHistory(h || [])
    setTechs(users || [])
  }

  useEffect(() => {
    load()
  }, [ticketId])

  const updateTicket = async (updates: any, action: string, actionNote: string) => {
    const oldStatus = ticket.status
    const oldTech = ticket.technician_id
    await supabase.from('support_tickets').update(updates).eq('id', ticketId)
    await supabase.from('ticket_history').insert([
      {
        ticket_id: ticketId,
        action,
        old_status: oldStatus,
        new_status: updates.status || oldStatus,
        old_technician_id: oldTech,
        new_technician_id: updates.technician_id || oldTech,
        note: actionNote,
        created_by: user?.id,
      },
    ])
    setNote('')
    toast({ title: 'Ticket atualizado' })
    onUpdate()
    load()
  }

  if (!ticket) return null

  return (
    <Sheet open={!!ticketId} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle>Ticket #{ticket.ticket_number}</SheetTitle>
          <SheetDescription>{ticket.title}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Status:</span> {ticket.status}
            </div>
            <div>
              <span className="font-semibold">Prioridade:</span> {ticket.priority}
            </div>
            <div>
              <span className="font-semibold">Módulo:</span> {ticket.module}
            </div>
            <div>
              <span className="font-semibold">Cliente:</span> {ticket.client?.name}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mudar Status</Label>
            <Select
              value={ticket.status}
              onValueChange={(v) =>
                updateTicket({ status: v }, 'status_change', `Status alterado para ${v}`)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  'Aberto',
                  'Em Atendimento',
                  'Aguardando Cliente',
                  'Aguardando Terceiro',
                  'Resolvido',
                  'Fechado',
                ].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transferir</Label>
            <Select
              value={ticket.technician_id || ''}
              onValueChange={(v) =>
                updateTicket({ technician_id: v }, 'transfer', 'Responsável alterado')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem responsável" />
              </SelectTrigger>
              <SelectContent>
                {techs.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nova Nota</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            <Button onClick={() => updateTicket({}, 'note', note)} disabled={!note}>
              Adicionar Nota
            </Button>
          </div>

          <ScrollArea className="h-64 border rounded p-4">
            <h4 className="font-semibold mb-4">Histórico</h4>
            {history.map((h) => (
              <div key={h.id} className="mb-4 text-sm border-b pb-2">
                <div className="text-xs text-muted-foreground">
                  {new Date(h.created_at).toLocaleString()} - {h.user?.name || 'Sistema'}
                </div>
                <div>{h.note}</div>
              </div>
            ))}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
