import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { useSystemData } from '@/hooks/use-system-data'
import { toast } from '@/hooks/use-toast'
import { Printer, Send, Loader2 } from 'lucide-react'

export function ShareFinancialDialog({
  open,
  onOpenChange,
  masterRecordId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  masterRecordId: string | null
}) {
  const { data: sysData } = useSystemData()
  const [loading, setLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [masterData, setMasterData] = useState<any>(null)
  const [charges, setCharges] = useState<any[]>([])

  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (open && masterRecordId) loadData()
  }, [open, masterRecordId])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: master, error: masterErr } = await supabase
        .from('financial_master_records')
        .select('*')
        .eq('id', masterRecordId)
        .single()
      if (masterErr) throw masterErr

      const { data: chgs, error: chgErr } = await supabase
        .from('financial_charges')
        .select('*')
        .eq('master_record_id', masterRecordId)
        .order('due_date', { ascending: true })
      if (chgErr) throw chgErr

      setMasterData(master)
      setCharges(chgs || [])

      if (master.client_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, phone')
          .eq('id', master.client_id)
          .single()
        if (profile) {
          if (profile.email) setEmail(profile.email)
          if (profile.phone) setWhatsapp(profile.phone.replace(/\D/g, ''))
        }
      }

      const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
      setMessage(
        `Olá ${master.client_name},\n\nSegue o resumo do seu registro financeiro:\nDescrição: ${master.description}\nTotal: ${formatCurrency(master.total_amount)}\nStatus: ${master.status}\n\nFicamos à disposição para qualquer dúvida.`,
      )
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados financeiros.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const generateHTML = () => {
    if (!masterData) return ''
    const formatCurrency = (val: number) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
    const formatDate = (dateString: string) => {
      if (!dateString) return '-'
      const [year, month, day] = dateString.split('-')
      return `${day}/${month}/${year}`
    }

    const logoHtml = sysData?.logo_url
      ? `<img src="${sysData.logo_url}" style="max-height: 80px;" alt="Logo" />`
      : `<h2 style="color: #1B7D3A; margin: 0;">${sysData?.platform_name || 'Status Financeiro'}</h2>`

    const itemsHtml =
      charges.length > 0
        ? charges
            .map(
              (c: any) => `
      <tr>
        <td>${c.parcela_numero ? `${c.parcela_numero}/${c.parcela_total}` : '-'}</td>
        <td>${c.description || '-'}</td>
        <td>${formatDate(c.due_date)}</td>
        <td style="text-align: right;">${formatCurrency(c.amount)}</td>
        <td style="text-align: center;"><span class="status-badge" style="background: #e2e8f0; color: #333;">${c.status}</span></td>
      </tr>
    `,
            )
            .join('')
        : `<tr><td colspan="5" style="text-align: center; color: #666;">Nenhuma parcela detalhada encontrada.</td></tr>`

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Status Financeiro - ${masterData.description}</title><style>body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; } .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1B7D3A; padding-bottom: 20px; margin-bottom: 30px; } .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 8px; } .info-block { flex: 1; } table { border-collapse: collapse; margin-bottom: 30px; width: 100%; } th { background: #1B7D3A; color: white; padding: 10px; text-align: left; } td { padding: 10px; border-bottom: 1px solid #ddd; } .totals { text-align: right; margin-top: 20px; font-size: 18px; } .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; } .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666; } @media print { body { padding: 0; } }</style></head><body><div class="header"><div>${logoHtml}</div><div style="text-align: right;"><h1 style="margin:0; color: #1B7D3A;">STATUS FINANCEIRO</h1><p style="margin:5px 0 0; color: #666;">Emitido em: ${new Date().toLocaleDateString('pt-BR')}</p></div></div><div class="info-grid"><div class="info-block"><strong>Cliente:</strong><br>${masterData.client_name}<br></div><div class="info-block" style="text-align: right;"><strong>Descrição:</strong> ${masterData.description}<br><strong>Status Geral:</strong> <span class="status-badge" style="background: #e2e8f0; color: #333;">${masterData.status}</span></div></div><table><thead><tr><th>Parcela</th><th>Descrição</th><th>Vencimento</th><th style="text-align: right;">Valor</th><th style="text-align: center;">Status</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="totals"><p style="margin: 5px 0;"><strong>Valor Total:</strong> ${formatCurrency(masterData.total_amount)}</p><p style="margin: 5px 0; color: #1B7D3A;"><strong>Valor Pago:</strong> ${formatCurrency(masterData.paid_amount || 0)}</p></div><div class="footer"><p>${sysData?.razao_social || sysData?.platform_name || 'Plataforma Financeira'} - CNPJ: ${sysData?.cnpj || 'N/A'}</p><p>${sysData?.address_street || ''}, ${sysData?.address_number || ''} - ${sysData?.address_city || ''}</p><p>Gerado pelo sistema em ${new Date().toLocaleString('pt-BR')}</p></div><script>window.onload = () => { setTimeout(() => { window.print(); }, 500); }</script></body></html>`
  }

  const handlePrint = () => {
    const html = generateHTML()
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
    }
  }

  const handleSend = async () => {
    if (!email && !whatsapp)
      return toast({
        title: 'Atenção',
        description: 'Preencha o E-mail ou o WhatsApp.',
        variant: 'destructive',
      })
    const isValidEmail = (em: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)
    if (email && !isValidEmail(email))
      return toast({ title: 'Atenção', description: 'E-mail inválido.', variant: 'destructive' })

    setIsSending(true)
    try {
      const promises = []
      if (email) {
        const contentBase64 = btoa(unescape(encodeURIComponent(generateHTML())))
        promises.push(
          supabase.functions
            .invoke('send-email', {
              body: {
                type: 'custom',
                email,
                name: masterData?.client_name || 'Cliente',
                subject: `Status Financeiro: ${masterData?.description || ''}`,
                html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
                attachments: [
                  {
                    filename: `Status_Financeiro.html`,
                    content: contentBase64,
                    mimetype: 'text/html',
                  },
                ],
              },
            })
            .then(({ error }) => {
              if (error) throw new Error('Falha ao enviar e-mail: ' + error.message)
            }),
        )
      }

      if (whatsapp) {
        promises.push(
          supabase.functions
            .invoke('enviar_whatsapp', {
              body: {
                empresa_id: sysData?.id || '00000000-0000-0000-0000-000000000001',
                tipo_mensagem: 'custom',
                telefone_destino: whatsapp,
                mensagem_customizada: message,
              },
            })
            .then(({ error }) => {
              if (error) throw new Error('Falha ao enviar WhatsApp: ' + error.message)
            }),
        )
      }

      await Promise.all(promises)
      toast({ title: 'Sucesso', description: 'Compartilhamento realizado com sucesso!' })
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao enviar.',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-4">
        <DialogHeader>
          <DialogTitle>Compartilhar Registro Financeiro</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label>E-mail do destinatário</Label>
              <Input
                placeholder="exemplo@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Telefone / WhatsApp (com DDD)</Label>
              <Input
                placeholder="5511999999999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Mensagem Personalizada</Label>
              <Textarea
                rows={5}
                className="resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
        )}
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={loading || isSending}
            className="w-full sm:w-auto"
          >
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button onClick={handleSend} disabled={loading || isSending} className="w-full sm:w-auto">
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}{' '}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
