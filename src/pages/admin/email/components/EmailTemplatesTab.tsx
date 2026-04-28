import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
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

const TEMPLATES = [
  { id: 'welcome', name: 'Boas-vindas (Cadastro de Atleta)' },
  { id: 'welcome_club', name: 'Boas-vindas (Cadastro de Clube)' },
  { id: 'password_reset', name: 'Recuperação de Senha' },
  { id: 'billing_reminder', name: 'Lembrete de Cobrança' },
  { id: 'billing_overdue', name: 'Cobrança em Atraso' },
  { id: 'event_registration', name: 'Confirmação de Inscrição' },
]

const DEFAULT_TEMPLATES: Record<string, { subject: string; body: string }> = {
  welcome: {
    subject: 'Bem-vindo ao Footgolf PR!',
    body: '<p>Olá <strong>{{name}}</strong>,</p>\n<p>Estamos felizes em ter você!</p>',
  },
  welcome_club: {
    subject: 'Cadastro de Clube',
    body: '<p>Olá <strong>{{name}}</strong>,</p>\n<p>Seu clube foi recebido.</p>',
  },
  password_reset: {
    subject: 'Alteração de Senha',
    body: '<p>Olá <strong>{{name}}</strong>,</p>\n<p>Redefina no link: {{link}}</p>',
  },
  billing_reminder: {
    subject: 'Lembrete de Vencimento',
    body: '<p>Olá <strong>{{name}}</strong>,</p>\n<p>Sua cobrança vencerá em {{due_date}}.</p>',
  },
  billing_overdue: {
    subject: 'Aviso de Atraso',
    body: '<p>Olá <strong>{{name}}</strong>,</p>\n<p>Sua cobrança está vencida.</p>',
  },
  event_registration: {
    subject: 'Inscrição Confirmada',
    body: '<p>Olá <strong>{{name}}</strong>,</p>\n<p>Inscrição no evento confirmada.</p>',
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

  const handleTestEmail = async () => {
    const emailToTest = window.prompt('Digite o e-mail para receber o teste:', data?.email || '')
    if (!emailToTest) return

    setIsTesting(true)
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'custom',
          email: emailToTest,
          name: 'Usuário Teste',
          subject: '[TESTE] ' + currentTemplate.subject,
          html: generatePreview(
            currentTemplate.body
              .replace(/{{name}}/g, 'Usuário Teste')
              .replace(/{{link}}/g, 'https://footgolfpr.com.br/teste')
              .replace(/{{due_date}}/g, '10/10/2026')
              .replace(/{{amount}}/g, '150,00')
              .replace(/{{event_name}}/g, 'Torneio Teste')
              .replace(/{{event_date}}/g, '15/11/2026')
              .replace(/{{event_location}}/g, 'Clube Teste'),
          ),
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

  const currentTemplate = templates[selectedTemplate] || DEFAULT_TEMPLATES['welcome']

  const generatePreview = (bodyContent: string) => {
    const sn = data?.razao_social || data?.platform_name || 'Federação de Footgolf do Paraná'
    const logo = data?.logo_url
      ? `<img src="${data.logo_url}" alt="Logo" style="max-height: 80px;" />`
      : `<h1 style="color: #1B7D3A;">${sn}</h1>`
    const addr =
      [data?.address_street, data?.address_city].filter(Boolean).join(' - ') ||
      'Endereço da Federação'
    return `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background-color: #f5f5f5; padding: 25px; text-align: center; border-bottom: 4px solid #1B7D3A;">${logo}</div>
        <div style="padding: 40px 30px;">${bodyContent}</div>
        <div style="background-color: #f9f9f9; padding: 30px; text-align: center; font-size: 13px; color: #666;">
          <p><strong>${data?.responsible_name || 'Presidente'}</strong></p>
          <hr style="margin: 15px auto; width: 50%;" />
          <p><strong>${sn}</strong><br/>CNPJ: ${data?.cnpj || '00.000.000/0000-00'}<br/>${addr}</p>
        </div>
      </div>
    `
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
                Variáveis: {'{{name}}, {{link}}, {{amount}}'}, etc.
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
              <Textarea
                className="font-mono text-sm min-h-[300px]"
                value={currentTemplate.body}
                onChange={(e) =>
                  setTemplates((p) => ({
                    ...p,
                    [selectedTemplate]: { ...p[selectedTemplate], body: e.target.value },
                  }))
                }
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
