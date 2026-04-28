import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'

export function QuoteDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [document, setDocument] = useState('')
  const [price, setPrice] = useState('')
  const { toast } = useToast()

  const handleSave = async () => {
    if (!name || !document || !price) return
    setLoading(true)
    try {
      let userId = null
      let userPhone = ''
      let userAuthWhatsapp = false

      const cleanDoc = document.replace(/\D/g, '')
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('document', cleanDoc)
        .maybeSingle()

      if (existing) {
        userId = existing.id
        userPhone = existing.telefone_whatsapp || ''
        userAuthWhatsapp = existing.autoriza_whatsapp || false
      } else {
        const { data: newUser, error: e1 } = await supabase
          .from('profiles')
          .insert({
            name,
            document: cleanDoc,
            role: 'client',
          })
          .select()
          .single()
        if (e1) throw e1
        userId = newUser.id
      }

      const { data: quote, error } = await supabase
        .from('orders')
        .insert({
          athlete_id: userId,
          total_price: parseFloat(price),
          status: 'quote',
        })
        .select()
        .single()
      if (error) throw error

      if (userAuthWhatsapp && userPhone) {
        const link = `${window.location.origin}/quote/${quote.id}`
        await supabase.functions.invoke('enviar_whatsapp', {
          body: {
            cliente_id: userId,
            telefone_destino: userPhone,
            tipo_mensagem: 'orcamento_novo',
            variaveis: {
              cliente_nome: name,
              numero_orcamento: quote.id.split('-')[0],
              data_orcamento: new Date().toLocaleDateString(),
              valor_total: price,
              link_visualizar_orcamento: link,
            },
          },
        })
        toast({ title: 'Sucesso', description: 'Orçamento gerado e WhatsApp enviado!' })
      } else {
        toast({
          title: 'Sucesso',
          description: 'Orçamento gerado! (Cliente sem WhatsApp autorizado)',
        })
      }

      setOpen(false)
      setName('')
      setDocument('')
      setPrice('')
      onSaved()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Novo Orçamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar Novo Orçamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome do Cliente *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="João Silva"
            />
          </div>
          <div className="space-y-2">
            <Label>CPF/CNPJ *</Label>
            <Input
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="space-y-2">
            <Label>Valor Total (R$) *</Label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150.00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Salvar e Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
