import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { FileText, Send, MessageCircle } from 'lucide-react'
import { generateFinancialRecordPDF } from '@/lib/pdf-utils'

export function ShareFinancialRecordModal({
  record,
  open,
  onOpenChange,
}: {
  record: any
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [charges, setCharges] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && record) {
      fetchCharges()
      const formattedTotal = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(record.total_amount || 0)
      setMessage(
        `Olá ${record.client_name},\n\nSegue o resumo do seu registro financeiro:\n` +
          `Descrição: ${record.description}\n` +
          `Total: ${formattedTotal}\n` +
          `Status: ${record.status}`,
      )
    }
  }, [open, record])

  const fetchCharges = async () => {
    const { data } = await supabase
      .from('financial_charges')
      .select('*')
      .eq('master_record_id', record.id)
      .order('due_date', { ascending: true })

    if (data) setCharges(data)
  }

  const handleSendEmail = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: 'Atenção',
        description: 'Por favor, insira um e-mail válido.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const formattedTotal = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(record.total_amount || 0)

      let html = `<p>Olá <strong>${record.client_name}</strong>,</p>
      <p>Segue o resumo do seu registro financeiro abaixo:</p>
      <ul style="background: #f9f9f9; padding: 15px; border-radius: 5px; list-style: none;">
        <li style="margin-bottom: 5px;"><strong>Descrição:</strong> ${record.description}</li>
        <li style="margin-bottom: 5px;"><strong>Total:</strong> ${formattedTotal}</li>
        <li style="margin-bottom: 5px;"><strong>Status:</strong> <span style="text-transform: capitalize;">${record.status}</span></li>
      </ul>`

      if (charges.length > 0) {
        html += `<h3 style="margin-top: 20px; color: #333;">Lançamentos (Parcelas)</h3>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1px solid #ddd; text-align: left;">
          <thead style="background-color: #f2f2f2;">
            <tr>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>`

        charges.forEach((c) => {
          const val = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            c.amount,
          )
          const date = new Date(c.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
          html += `<tr>
            <td>${date}</td>
            <td>${val}</td>
            <td style="text-transform: capitalize;">${c.status}</td>
          </tr>`
        })
        html += `</tbody></table>`
      }

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'custom',
          email,
          name: record.client_name,
          subject: `Resumo Financeiro - ${record.description}`,
          html,
        },
      })

      if (error) throw error
      toast({ title: 'Sucesso', description: 'E-mail de resumo financeiro enviado com sucesso!' })
      setEmail('')
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSendWhatsApp = () => {
    if (!phone) {
      toast({
        title: 'Atenção',
        description: 'Por favor, insira um telefone válido.',
        variant: 'destructive',
      })
      return
    }

    const cleanPhone = phone.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handlePreviewPDF = () => {
    generateFinancialRecordPDF(record, charges)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Compartilhar Registro Financeiro</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4 border p-4 rounded-md bg-card shadow-sm">
            <h4 className="font-semibold flex items-center gap-2 text-foreground">
              <Send className="w-4 h-4 text-primary" /> Enviar por E-mail
            </h4>
            <div className="space-y-2">
              <Label>E-mail do destinatário</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={handleSendEmail} disabled={loading}>
                  Enviar E-mail
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 border p-4 rounded-md bg-card shadow-sm">
            <h4 className="font-semibold flex items-center gap-2 text-foreground">
              <MessageCircle className="w-4 h-4 text-green-500" /> Enviar por WhatsApp
            </h4>
            <div className="space-y-2">
              <Label>Telefone / WhatsApp (apenas números com DDD)</Label>
              <Input
                placeholder="5511999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Mensagem Personalizada</Label>
              <Textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
              />
            </div>
            <Button
              onClick={handleSendWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Abrir WhatsApp Web
            </Button>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full h-12 text-base border-primary/20 hover:bg-primary/5"
              onClick={handlePreviewPDF}
            >
              <FileText className="w-5 h-5 mr-2 text-primary" /> Visualizar PDF (Imprimir / Baixar)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
