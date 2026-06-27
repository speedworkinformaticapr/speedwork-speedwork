import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Mail, Save, Server, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function EmailConfigTab() {
  const { data, updateData } = useSystemData()
  const { toast } = useToast()
  const [smtpKey, setSmtpKey] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    if (data?.integrations) {
      const integrations = data.integrations as any
      if (integrations.smtp_key) setSmtpKey(integrations.smtp_key)
      if (integrations.smtp_sender_email) {
        setSenderEmail(integrations.smtp_sender_email)
      } else if (data?.email) {
        setSenderEmail(data.email)
      }
    } else if (data?.email) {
      setSenderEmail(data.email)
    }
  }, [data])

  const handleSaveConfig = async () => {
    setIsSavingConfig(true)
    try {
      const currentIntegrations = (data?.integrations || {}) as any
      await updateData({
        integrations: {
          ...currentIntegrations,
          smtp_key: smtpKey,
          smtp_sender_email: senderEmail,
        },
      })
      toast({ title: 'Sucesso', description: 'Configurações de SMTP salvas com sucesso.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleTestSMTP = async () => {
    setIsTesting(true)
    try {
      const currentIntegrations = (data?.integrations || {}) as any
      const testEmail = senderEmail || data?.email || 'admin@example.com'
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'test_smtp',
          email: testEmail,
          senderEmail: senderEmail || currentIntegrations.smtp_sender_email || data?.email,
          smtpKey: smtpKey || currentIntegrations.smtp_key,
        },
      })
      if (error) {
        const errBody = typeof error === 'object' ? JSON.stringify(error) : String(error)
        toast({
          title: 'Falha no teste de conexão SMTP2GO',
          description:
            'Não foi possível enviar o e-mail de teste. Verifique a API Key e o e-mail remetente. Detalhe: ' +
            errBody,
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

  return (
    <Card>
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-base flex items-center gap-2">
          <Server className="w-4 h-4 text-primary" /> Conexão SMTP2GO
        </CardTitle>
        <CardDescription>
          Configure sua chave de API para habilitar os disparos automatizados de e-mail através do
          sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>SMTP2GO API Key</Label>
          <Input
            type="password"
            value={smtpKey}
            onChange={(e) => setSmtpKey(e.target.value)}
            placeholder="api-XXXXXXXXXXXXXXXX"
          />
        </div>
        <div className="space-y-2">
          <Label>E-mail Remetente SMTP2GO</Label>
          <Input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="noreply@suaempresa.com.br"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Este é o endereço de e-mail que aparecerá como remetente nas mensagens enviadas via
            SMTP2GO.
          </p>
        </div>
        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={handleTestSMTP} disabled={isTesting || !smtpKey}>
            {isTesting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Enviar E-mail de Teste
          </Button>
          <Button onClick={handleSaveConfig} disabled={isSavingConfig}>
            {isSavingConfig ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Configuração
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
