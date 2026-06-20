import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export function TicketForm({ open, onOpenChange, onSuccess }: any) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    client_id: '',
    module: '',
    priority: 'P3',
  })

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, name, email')
      .then(({ data }) => setClients(data || []))
  }, [])

  useEffect(() => {
    const text = (form.title + ' ' + form.description).toLowerCase()
    let suggested = 'P3'
    if (
      form.module === 'Checkout' ||
      form.module === 'Login' ||
      text.includes('parado') ||
      text.includes('fora do ar') ||
      text.includes('não consigo vender') ||
      text.includes('erro crítico')
    ) {
      suggested = 'P1'
    } else if (text.includes('lentidão') || text.includes('erro')) {
      suggested = 'P2'
    } else if (
      text.includes('visual') ||
      text.includes('dúvida') ||
      text.includes('cor') ||
      text.includes('ajuste')
    ) {
      suggested = 'P4'
    }
    if (suggested !== form.priority) setForm((f) => ({ ...f, priority: suggested }))
  }, [form.title, form.description, form.module])

  const handleSubmit = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([
        {
          ...form,
          status: 'Aberto',
          technician_id: user?.id,
        },
      ])
      .select()
      .single()

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      await supabase.from('ticket_history').insert([
        {
          ticket_id: data.id,
          action: 'create',
          new_status: 'Aberto',
          created_by: user?.id,
          note: 'Ticket criado.',
        },
      ])
      toast({ title: 'Ticket criado!' })
      onOpenChange(false)
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Ticket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Módulo</Label>
              <Select value={form.module} onValueChange={(v) => setForm({ ...form, module: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Checkout">Checkout</SelectItem>
                  <SelectItem value="Login">Login</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="UI">Interface</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade (Sugerida: {form.priority})</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P1">P1 - Crítica</SelectItem>
                  <SelectItem value="P2">P2 - Alta</SelectItem>
                  <SelectItem value="P3">P3 - Média</SelectItem>
                  <SelectItem value="P4">P4 - Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select
              value={form.client_id}
              onValueChange={(v) => setForm({ ...form, client_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name || c.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            Criar Ticket
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
