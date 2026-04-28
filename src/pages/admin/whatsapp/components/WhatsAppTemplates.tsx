import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit2, Trash2, Send } from 'lucide-react'

const MSG_TYPES = [
  'agendamento_confirmacao',
  'agendamento_status',
  'agendamento_conclusao',
  'pedido_confirmacao',
  'pedido_status',
  'orcamento_novo',
]

export default function WhatsAppTemplates() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editTpl, setEditTpl] = useState<any>(null)
  const [form, setForm] = useState({ tipo_mensagem: '', titulo: '', conteudo: '', is_active: true })

  const loadData = async () => {
    const { data } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTemplates(data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!form.tipo_mensagem || !form.conteudo)
      return toast({ title: 'Aviso', description: 'Preencha todos os campos.' })
    setIsSaving(true)
    try {
      if (editTpl) await supabase.from('whatsapp_templates').update(form).eq('id', editTpl.id)
      else await supabase.from('whatsapp_templates').insert(form)
      toast({ title: 'Sucesso', description: 'Template salvo!' })
      setModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async (t: any) => {
    const phoneToTest = window.prompt('Digite o número do WhatsApp para teste (ex: 5511999999999):')
    if (!phoneToTest) return

    try {
      const { error } = await supabase.functions.invoke('enviar_whatsapp', {
        body: {
          tipo_mensagem: t.tipo_mensagem,
          telefone_destino: phoneToTest,
          variaveis: {
            cliente_nome: 'Usuário Teste',
            data_agendamento: '10/10/2026 14:00',
            link_pagamento: 'https://example.com/pay',
          },
        },
      })
      if (error) throw error
      toast({ title: 'Sucesso', description: 'WhatsApp de teste simulado/enviado com sucesso!' })
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao testar o envio.',
        variant: 'destructive',
      })
    }
  }

  const handleDel = async (id: string) => {
    await supabase.from('whatsapp_templates').delete().eq('id', id)
    toast({ title: 'Sucesso', description: 'Template removido!' })
    loadData()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Templates de Mensagem</CardTitle>
          <CardDescription>Gerencie o conteúdo enviado automaticamente.</CardDescription>
        </div>
        <Button
          onClick={() => {
            setEditTpl(null)
            setForm({ tipo_mensagem: '', titulo: '', conteudo: '', is_active: true })
            setModalOpen(true)
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Template
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-background"
            >
              <div>
                <h4 className="font-bold">
                  {t.titulo || 'Sem título'}{' '}
                  <span className="text-xs font-mono text-muted-foreground ml-2 px-2 py-1 bg-muted rounded">
                    {t.tipo_mensagem}
                  </span>
                </h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{t.conteudo}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={t.is_active}
                  onCheckedChange={async (c) => {
                    await supabase
                      .from('whatsapp_templates')
                      .update({ is_active: c })
                      .eq('id', t.id)
                    loadData()
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditTpl(t)
                    setForm(t)
                    setModalOpen(true)
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Testar Envio"
                  onClick={() => handleTest(t)}
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => handleDel(t.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="text-center text-muted-foreground">Nenhum template cadastrado.</p>
          )}
        </div>
      </CardContent>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editTpl ? 'Editar Template' : 'Novo Template'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-4 border-r pr-6">
              <div className="space-y-2">
                <Label>Tipo de Mensagem</Label>
                <Select
                  value={form.tipo_mensagem}
                  onValueChange={(v) => setForm({ ...form, tipo_mensagem: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MSG_TYPES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Título (Identificação Interna)</Label>
                <Input
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Conteúdo da Mensagem</Label>
                <Textarea
                  className="h-40"
                  value={form.conteudo}
                  onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Use variáveis como: {'{{cliente_nome}}, {{data_agendamento}}'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <Label>Pré-visualização (Simulada)</Label>
              <div className="bg-[#e1f5fe] border border-green-200 rounded-lg p-4 text-sm whitespace-pre-wrap font-sans text-gray-800 shadow-sm relative">
                {form.conteudo
                  ? form.conteudo.replace(/{{[^}]+}}/g, '_______')
                  : 'Sua mensagem aparecerá aqui...'}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button className="bg-green-600" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
