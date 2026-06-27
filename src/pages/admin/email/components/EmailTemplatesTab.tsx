import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Save, Eye, Info, Loader2, Mail, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

const BRAND_COLOR = '#2563EB'

const TEMPLATES = [
  { id: 'welcome', name: 'Boas-vindas (Cadastro de Usuário)' },
  { id: 'welcome_club', name: 'Boas-vindas (Cadastro de Empresa)' },
  { id: 'password_reset', name: 'Recuperação de Senha' },
  { id: 'mfa_code', name: 'Código de Verificação (2FA)' },
  { id: 'billing_reminder', name: 'Lembrete de Cobrança' },
  { id: 'billing_overdue', name: 'Cobrança em Atraso' },
  { id: 'event_registration', name: 'Confirmação de Inscrição' },
]

const DEFAULT_TEMPLATES: Record<string, { subject: string; body: string }> = {
  welcome: {
    subject: 'Bem-vindo à Speedwork!',
    body: '<p>Olá <strong>{{name}}</strong>,</p>\n<p>Estamos felizes em ter você na plataforma Speedwork!</p>\n<p>Para ativar sua conta, confirme seu e-mail clicando no link abaixo:</p>\n<p><a href="{{link}}">Confirmar meu e-mail</a></p>',
  },
  welcome_club: {
    subject: 'Cadastro de Empresa Recebido - Speedwork',
    body: '<p>Olá,</p>\n<p>O cadastro de <strong>{{name}}</strong> foi recebido com sucesso.</p>\n<p>Sua solicitação está em análise e em breve você terá acesso completo ao painel.</p>',
  },
  password_reset: {
    subject: 'Alteração de Senha - Speedwork',
    body: '<p>Olá <strong>{{name}}</strong>,</p>\n<p>Você solicitou a alteração da sua senha. Clique no link abaixo para redefinir:</p>\n<p><a href="{{link}}">Redefinir Senha</a></p>',
  },
  mfa_code: {
    subject: 'Código de Verificação - Speedwork',
    body: '<p>Olá <strong>{{name}}</strong>,</p>\n<p>Seu código de verificação é:</p>\n<p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:20px;background:#f4f4f4;border-radius:8px;color:#2563EB;">{{code}}</p>\n<p>Este código expira em 15 minutos.</p>',
  },
  billing_reminder: {
    subject: 'Lembrete de Vencimento - Speedwork',
    body: '<p>Olá <strong>{{name}}</strong>,</p>\n<p>Sua cobrança referente a <strong>{{description}}</strong> vencerá em {{due_date}} no valor de R$ {{amount}}.</p>',
  },
  billing_overdue: {
    subject: 'Aviso de Atraso - Speedwork',
    body: '<p>Olá <strong>{{name}}</strong>,</p>\n<p>Sua cobrança referente a <strong>{{description}}</strong> está vencida. Regularize o mais breve possível.</p>',
  },
  event_registration: {
    subject: 'Inscrição Confirmada - Speedwork',
    body: '<p>Olá <strong>{{name}}</strong>,</p>\n<p>Sua inscrição foi confirmada com sucesso.</p>\n<p><strong>Evento:</strong> {{event_name}}<br><strong>Data:</strong> {{event_date}}<br><strong>Local:</strong> {{event_location}}</p>',
  },
}

export default function EmailTemplatesTab() {
  const { data, updateData } = useSystemData()
  const { toast } = useToast()
  const [selectedTemplate, setSelectedTemplate] = useState('welcome')
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    if (data?.integrations) {
      const ints = data.integrations as any
      if (ints.email_templates) setTemplates((prev) => ({ ...prev, ...ints.email_templates }))
    }
  }, [data])

  const currentTemplate = templates[selectedTemplate] || DEFAULT_TEMPLATES['welcome']

  const generatePreview = (bodyContent: string) => {
    const sn = data?.razao_social || data?.platform_name || 'Speedwork'
    const logo = data?.logo_url
      ? `<img src="${data.logo_url}" alt="Logo" style="max-height: 80px; max-width: 250px; display: block; margin: 0 auto;" />`
      : `<h1 style="color: ${BRAND_COLOR}; margin: 0; font-size: 24px;">${sn}</h1>`
    const addr =
      [data?.address_street, data?.address_city].filter(Boolean).join(' - ') ||
      'Endereço da Empresa'
    const cnpj = data?.cnpj || '00.000.000/0000-00'
    const phone = data?.phone || '(00) 0000-0000'
    const responsibleName = data?.responsible_name || 'Administrador'
    const responsibleRole = data?.responsible_role || 'Administrador'
    const email = data?.email || 'contato@speedwork.com.br'
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f5f5f5; padding: 25px 20px; text-align: center; border-bottom: 4px solid ${BRAND_COLOR};">
          ${logo}
        </div>
        <div style="padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 16px;">
          ${bodyContent}
        </div>
        <div style="background-color: #f9f9f9; padding: 30px 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 13px; color: #666666; line-height: 1.6;">
          <p style="margin: 0 0 15px 0; font-size: 15px; color: #1D4ED8;"><strong>${responsibleName}</strong><br><span style="font-size: 13px; color: #666;">${responsibleRole}</span></p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px auto; width: 50%;" />
          <p style="margin: 5px 0; color: #444;"><strong>${sn}</strong></p>
          <p style="margin: 5px 0;">CNPJ: ${cnpj}</p>
          <p style="margin: 5px 0;">${addr}</p>
          <p style="margin: 5px 0;">Telefone: ${phone} | E-mail: ${email}</p>
        </div>
      </div>
    `
  }

  const handleTestEmail = async () => {
    const emailToTest = window.prompt('Digite o e-mail para receber o teste:', data?.email || '')
    if (!emailToTest) return

    setIsTesting(true)
    try {
      const previewBody = currentTemplate.body
        .replace(/{{name}}/g, 'Usuário Teste')
        .replace(/{{link}}/g, 'https://www.speedworkinformatica.com/teste')
        .replace(/{{due_date}}/g, '10/10/2026')
        .replace(/{{amount}}/g, '150,00')
        .replace(/{{description}}/g, 'Serviço Teste')
        .replace(/{{code}}/g, '123456')
        .replace(/{{event_name}}/g, 'Evento Teste')
        .replace(/{{event_date}}/g, '15/11/2026')
        .replace(/{{event_location}}/g, 'Local Teste')

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'custom',
          email: emailToTest,
          name: 'Usuário Teste',
          subject: '[TESTE] ' + currentTemplate.subject,
          html: generatePreview(previewBody),
        },
      })
      if (error) throw error
      toast({
        title: 'Sucesso',
        description: 'E-mail de teste enviado! Verifique sua caixa de entrada.',
      })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Falha ao enviar teste.',
        variant: 'destructive',
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const ints = (data?.integrations || {}) as any
      await updateData({ integrations: { ...ints, email_templates: templates } })
      toast({ title: 'Sucesso', description: 'Modelos salvos com sucesso.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" /> Editor de Modelos
        </CardTitle>
        <CardDescription>
          O sistema insere o cabeçalho e rodapé automaticamente. Configure apenas a estrutura do
          corpo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="space-y-2">
              <Label>Fluxo de Utilização</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs mt-1 text-primary/80">
                Variáveis: {'{{name}}, {{link}}, {{amount}}, {{code}}'}, etc.
              </AlertDescription>
            </Alert>
          </div>
          <div className="md:col-span-3 space-y-4 bg-muted/20 p-4 rounded-lg border">
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input
                value={currentTemplate.subject}
                onChange={(e) =>
                  setTemplates((p) => ({
                    ...p,
                    [selectedTemplate]: { ...p[selectedTemplate], subject: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Corpo (HTML)</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Eye className="w-4 h-4 mr-2" /> Pré-visualizar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Como o cliente receberá o e-mail</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 p-4 bg-gray-100 rounded-md overflow-auto max-h-[60vh]">
                      <div
                        dangerouslySetInnerHTML={{ __html: generatePreview(currentTemplate.body) }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <RichTextEditor
                value={currentTemplate.body}
                onChange={(v: string) =>
                  setTemplates((p) => ({
                    ...p,
                    [selectedTemplate]: { ...p[selectedTemplate], body: v },
                  }))
                }
                minHeight="300px"
                variables={[
                  { label: 'Nome do Usuário', value: '{{name}}' },
                  { label: 'Link de Conf./Senha', value: '{{link}}' },
                  { label: 'Código 2FA', value: '{{code}}' },
                  { label: 'Data de Vencimento', value: '{{due_date}}' },
                  { label: 'Valor', value: '{{amount}}' },
                  { label: 'Descrição', value: '{{description}}' },
                  { label: 'Nome do Evento', value: '{{event_name}}' },
                  { label: 'Data do Evento', value: '{{event_date}}' },
                  { label: 'Local do Evento', value: '{{event_location}}' },
                ]}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleTestEmail} disabled={isTesting || isSaving}>
            {isTesting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Testar Envio
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isTesting}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}{' '}
            Salvar Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
