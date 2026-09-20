import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSystemData } from '@/hooks/use-system-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Mail, Server, Loader2, ExternalLink, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function EmailConfigTab() {
  const { data } = useSystemData()
  const { toast } = useToast()
  const [isTesting, setIsTesting] = useState(false)

  const integrations = (data?.integrations || {}) as any
  const smtpKey = integrations.smtp_key || ''
  const senderEmail = integrations.smtp_sender_email || data?.email || ''

  const handleTestSMTP = async () => {
    setIsTesting(true)
    try {
      const testEmail = senderEmail || data?.email || 'admin@example.com'
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'test_smtp',
          email: testEmail,
          senderEmail: senderEmail || integrations.smtp_sender_email || data?.email,
          smtpKey: smtpKey || integrations.smtp_key,
        },
      })
      if (error) {
        let errorDetail = ''
        try {
          const errorResp = (error as any).context || error
          if (errorResp?.json) {
            const errorData = await errorResp.json()
            errorDetail = errorData?.error || JSON.stringify(errorData)
          } else {
            errorDetail = (error as any).message || String(error)
          }
        } catch {
          errorDetail = (error as any).message || String(error)
        }
        toast({
          title: 'Falha no teste de conexão SMTP2GO',
          description:
            'Não foi possível enviar o e-mail de teste. Verifique a API Key e o e-mail remetente. Detalhe: ' +
            errorDetail,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Teste enviado com sucesso',
          description: `Verifique a caixa de entrada de ${testEmail}.`,
        })
      }
    } catch (err: any) {
      toast({
        title: 'Erro no envio de teste',
        description:
          err.message || 'Ocorreu um erro inesperado ao testar a conexão. Contate o suporte.',
        variant: 'destructive',
      })
    } finally {
      setIsTesting(false)
    }
  }

  const maskedSmtpKey = smtpKey
    ? smtpKey.length > 8
      ? `${smtpKey.slice(0, 6)}••••••••${smtpKey.slice(-4)}`
      : '••••••••'
    : 'Não configurada'

  return (
    <Card>
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-base flex items-center gap-2">
          <Server className="w-4 h-4 text-primary" /> Conexão SMTP2GO
        </CardTitle>
        <CardDescription>
          Visualize o status da conexão SMTP2GO e realize testes de envio.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        <div className="flex items-center justify-between p-3.5 rounded-lg border bg-muted/40 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Configure em Dados do Sistema → Integrações Externas</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/settings/system" className="flex items-center gap-1.5">
              <span>Acessar</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <Label>SMTP2GO API Key (Somente Leitura)</Label>
          <Input
            type="text"
            readOnly
            disabled
            value={maskedSmtpKey}
            className="bg-muted cursor-not-allowed font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label>E-mail Remetente (Somente Leitura)</Label>
          <Input
            type="email"
            readOnly
            disabled
            value={senderEmail || 'Não configurado'}
            className="bg-muted cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Endereço que aparece como remetente nas mensagens enviadas via SMTP2GO.
          </p>
        </div>

        <div className="flex justify-start items-center pt-2">
          <Button variant="default" onClick={handleTestSMTP} disabled={isTesting || !smtpKey}>
            {isTesting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Testar conexão
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
