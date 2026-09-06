import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { useSystemData } from '@/hooks/use-system-data'
import { toast } from '@/hooks/use-toast'
import { Printer, MessageCircle, Mail, Loader2 } from 'lucide-react'

export function ShareDocumentDialog({
  open,
  onOpenChange,
  documentId,
  type,
  autoPrint = false,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  documentId: string
  type: 'quote' | 'order'
  autoPrint?: boolean
}) {
  const { data: sysData } = useSystemData()
  const [docData, setDocData] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  const [isSendingWa, setIsSendingWa] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  useEffect(() => {
    if (open && documentId) {
      loadDocument()
    }
  }, [open, documentId])

  const loadDocument = async () => {
    setLoading(true)
    const table = type === 'quote' ? 'orcamentos' : 'pedidos'
    const itemsTable = type === 'quote' ? 'orcamento_itens' : 'pedido_itens'
    const fk = type === 'quote' ? 'orcamento_id' : 'pedido_id'

    const { data: doc } = await (supabase.from(table as any) as any)
      .select('*, clientes(*)')
      .eq('id', documentId)
      .single()
    if (doc) {
      setDocData(doc)
      const { data: its } = await (supabase.from(itemsTable as any) as any)
        .select('*')
        .eq(fk, documentId)
      setItems(its || [])

      const phone = (doc as any).clientes?.telefone || ''
      setWhatsappPhone(phone.replace(/\D/g, ''))
      setEmailAddress((doc as any).clientes?.email || '')

      const num = type === 'quote' ? (doc as any).numero_orcamento : (doc as any).numero_pedido
      setEmailSubject(`Envio de ${type === 'quote' ? 'Orçamento' : 'Pedido'}: ${num}`)

      const totalFormatado = Number(
        (doc as any).valor_total || (doc as any).total || 0,
      ).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
      setCustomMessage(
        `Olá ${(doc as any).clientes?.nome},\n\nSegue o resumo do seu ${type === 'quote' ? 'orçamento' : 'pedido'} (${num}).\nTotal: ${totalFormatado}\n\nFicamos à disposição para qualquer dúvida.`,
      )

      if (autoPrint) {
        setTimeout(() => handlePrint(doc, its || []), 100)
      }
    }
    setLoading(false)
  }

  const generateHTML = (d = docData, it = items) => {
    if (!d) return ''
    const num = type === 'quote' ? d.numero_orcamento : d.numero_pedido
    const dateLabel = type === 'quote' ? 'Emissão' : 'Data do Pedido'
    const dateVal = type === 'quote' ? d.data_emissao : d.data_pedido
    const total = d.total || d.valor_total || 0
    const subtotal = it.reduce((acc: any, i: any) => acc + Number(i.valor_total || 0), 0)

    const logoHtml = sysData?.logo_url
      ? `<img src="${sysData.logo_url}" style="max-height: 80px;" alt="Logo" />`
      : `<h2>${sysData?.razao_social || 'Empresa'}</h2>`
    const itemsHtml = it
      .map(
        (i: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${i.descricao || 'Item'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${i.quantidade}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${Number(i.valor_unitario).toFixed(2).replace('.', ',')}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${Number(i.valor_total).toFixed(2).replace('.', ',')}</td>
      </tr>
    `,
      )
      .join('')

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${num}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1B7D3A; padding-bottom: 20px; margin-bottom: 30px; }
          .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-block { flex: 1; }
          table { border-collapse: collapse; margin-bottom: 30px; width: 100%; }
          th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .totals { text-align: right; margin-top: 20px; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>${logoHtml}</div>
          <div style="text-align: right;">
            <h1 style="margin:0; color: #1B7D3A;">${type === 'quote' ? 'ORÇAMENTO' : 'PEDIDO'}</h1>
            <p style="margin:5px 0 0;"># ${num}</p>
          </div>
        </div>
        
        <div class="info-grid">
          <div class="info-block">
            <strong>Cliente:</strong><br>
            ${d.clientes?.nome}<br>
            ${d.clientes?.email || ''}<br>
            ${d.clientes?.telefone || ''}
          </div>
          <div class="info-block" style="text-align: right;">
            <strong>${dateLabel}:</strong> ${new Date(dateVal).toLocaleDateString('pt-BR')}<br>
            ${type === 'quote' && d.data_validade ? `<strong>Validade:</strong> ${new Date(d.data_validade).toLocaleDateString('pt-BR')}<br>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th style="text-align: center;">Qtd</th>
              <th style="text-align: right;">V. Unitário</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <p><strong>Subtotal:</strong> R$ ${subtotal.toFixed(2).replace('.', ',')}</p>
          ${
            type === 'quote'
              ? `
            <p><strong>Desconto:</strong> R$ ${Number(d.desconto_valor || 0)
              .toFixed(2)
              .replace('.', ',')} (${d.desconto_percentual || 0}%)</p>
            <p><strong>Impostos:</strong> R$ ${Number(d.valor_impostos || 0)
              .toFixed(2)
              .replace('.', ',')}</p>
          `
              : ''
          }
          <h2 style="color: #1B7D3A;">Total: R$ ${Number(total).toFixed(2).replace('.', ',')}</h2>
        </div>

        ${
          d.observacoes
            ? `
          <div style="margin-top: 30px; padding: 15px; background: #f9f9f9; border-left: 4px solid #1B7D3A;">
            <strong>Observações:</strong><br>
            ${d.observacoes.replace(/\\n/g, '<br>')}
          </div>
        `
            : ''
        }

        <div class="footer">
          <p>${sysData?.razao_social || 'Empresa'} - CNPJ: ${sysData?.cnpj || ''}</p>
          <p>${sysData?.address_street || ''}, ${sysData?.address_number || ''} - ${sysData?.address_city || ''}</p>
          <p>${sysData?.quote_footer_text || ''}</p>
        </div>
        
        <script>
          window.onload = () => { setTimeout(() => { window.print(); }, 500); }
        </script>
      </body>
      </html>
    `
  }

  const handlePrint = (currentDoc = docData, currentItems = items) => {
    const html = generateHTML(currentDoc, currentItems)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
    }
  }

  const handleSendEmail = async () => {
    if (!emailAddress)
      return toast({
        title: 'Aviso',
        description: 'Informe o e-mail do destinatário.',
        variant: 'destructive',
      })
    setIsSendingEmail(true)
    try {
      const html = generateHTML()

      const num = type === 'quote' ? docData.numero_orcamento : docData.numero_pedido
      const contentBase64 = btoa(unescape(encodeURIComponent(html)))

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'custom',
          email: emailAddress,
          name: docData.clientes?.nome || 'Cliente',
          subject: emailSubject,
          html: `<p>${customMessage.replace(/\\n/g, '<br>')}</p>`,
          attachments: [
            {
              filename: `${num}.html`,
              content: contentBase64,
              mimetype: 'text/html',
            },
          ],
        },
      })
      if (error) throw error
      toast({ title: 'Sucesso', description: 'E-mail enviado com sucesso!' })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Falha ao enviar e-mail',
        variant: 'destructive',
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleSendWa = async () => {
    if (!whatsappPhone || whatsappPhone.length < 10)
      return toast({
        title: 'Aviso',
        description: 'Informe um número de WhatsApp válido.',
        variant: 'destructive',
      })
    setIsSendingWa(true)
    try {
      const { error } = await supabase.functions.invoke('enviar_whatsapp', {
        body: {
          tipo_mensagem: 'custom',
          telefone_destino: whatsappPhone,
          mensagem_customizada: customMessage,
        },
      })
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Mensagem enviada no WhatsApp!' })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Falha ao enviar WhatsApp',
        variant: 'destructive',
      })
    } finally {
      setIsSendingWa(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar / Imprimir</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Mensagem Personalizada</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Esta mensagem será enviada no corpo do e-mail e no WhatsApp.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex flex-col gap-2">
                <Label>Enviar por E-mail</Label>
                <div className="flex gap-2">
                  <Input
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="E-mail do cliente"
                  />
                  <Button
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSendingEmail ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    E-mail
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Enviar por WhatsApp</Label>
                <div className="flex gap-2">
                  <Input
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="Apenas números (Ex: 5511999999999)"
                  />
                  <Button
                    onClick={handleSendWa}
                    disabled={isSendingWa}
                    className="shrink-0 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSendingWa ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MessageCircle className="w-4 h-4 mr-2" />
                    )}
                    WhatsApp
                  </Button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t">
                <Button variant="outline" onClick={() => handlePrint()}>
                  <Printer className="w-4 h-4 mr-2" />
                  Visualizar / Imprimir PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
