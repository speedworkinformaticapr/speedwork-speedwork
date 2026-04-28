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
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    if (data?.integrations) {
      const integrations = data.integrations as any
      if (integrations.smtp_key) setSmtpKey(integrations.smtp_key)
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
      const { error } = await supabase.functions.invoke('send-email', {
        body: { type: 'test_smtp', email: data?.email || 'admin@example.com' },
      })
      if (error) throw error
      toast({
        title: 'Teste enviado com sucesso',
        description: 'Verifique a caixa de entrada do e-mail institucional.',
      })
    } catch (err: any) {
      toast({ title: 'Erro no envio de teste', description: err.message, variant: 'destructive' })
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
          <Label>E-mail Remetente Padrão</Label>
          <Input value={data?.email || 'contato@footgolfpr.com.br'} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground mt-1">
            Este e-mail é definido na aba Geral de Dados do Sistema.
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
