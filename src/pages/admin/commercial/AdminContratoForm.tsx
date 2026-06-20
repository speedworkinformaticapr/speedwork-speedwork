import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils'
import { ArrowLeft, Plus } from 'lucide-react'

export default function AdminContratoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [clientes, setClientes] = useState<any[]>([])
  const [planoContas, setPlanoContas] = useState<any[]>([])
  const [slas, setSlas] = useState<any[]>([])

  const [form, setForm] = useState({
    cliente_id: '',
    conta_id: '',
    sla_id: '',
    tipo_contrato: 'assinatura',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    duracao_ciclo: 'mensal',
    valor_ciclo: 0,
    renovacao_automatica: true,
    observacoes: '',
  })

  // Quick Add States
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [newClientName, setNewClientName] = useState('')

  const [newContaOpen, setNewContaOpen] = useState(false)
  const [newConta, setNewConta] = useState({ nome: '', codigo_estrutural: '', natureza: 'receita' })

  const [newSlaOpen, setNewSlaOpen] = useState(false)
  const [newSlaName, setNewSlaName] = useState('')

  useEffect(() => {
    supabase
      .from('plano_contas')
      .select('id, codigo_estrutural, nome')
      .order('codigo_estrutural')
      .then(({ data }) => setPlanoContas(data || []))
    supabase
      .from('profiles')
      .select('id, name')
      .eq('is_client', true)
      .then(({ data }) => {
        const mapped = (data || []).map((p) => ({ id: p.id, nome: p.name }))
        setClientes(mapped)
      })
    supabase
      .from('sla_types')
      .select('id, name')
      .then(({ data }) => setSlas(data || []))

    if (id) {
      const isUuidValid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
      if (isUuidValid) {
        supabase
          .from('contratos')
          .select('*')
          .eq('id', id)
          .single()
          .then(({ data }) => data && setForm((prev) => ({ ...prev, ...data })))
      }
    }
  }, [id])

  const handleSave = async (status: string) => {
    if (!form.cliente_id)
      return toast({ title: 'Erro', description: 'Cliente obrigatório', variant: 'destructive' })

    let responsavel_id = user?.id
    if (user?.id) {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (usuario?.id) {
        responsavel_id = usuario.id
      }
    }

    const payload: any = {
      ...form,
      status,
      user_id: user?.id,
      responsavel_id,
      numero_contrato: (form as any).numero_contrato || `CTR-${Date.now()}`,
      data_proxima_cobranca: (form as any).data_proxima_cobranca || form.data_inicio,
    }
    if (!payload.conta_id) payload.conta_id = null
    if (!payload.sla_id) payload.sla_id = null
    if (!payload.data_fim) payload.data_fim = null

    if (id) await supabase.from('contratos').update(payload).eq('id', id)
    else await supabase.from('contratos').insert([payload])

    toast({ title: 'Contrato salvo com sucesso' })
    navigate('/admin/commercial/contratos')
  }

  const handleQuickAddClient = async () => {
    if (!newClientName) return
    const { data } = await supabase
      .from('profiles')
      .insert([{ name: newClientName, is_client: true }])
      .select()
      .single()
    if (data) {
      setClientes([...clientes, { id: data.id, nome: data.name }])
      setForm({ ...form, cliente_id: data.id })
      setNewClientOpen(false)
      setNewClientName('')
      toast({ title: 'Cliente adicionado' })
    }
  }

  const handleQuickAddConta = async () => {
    if (!newConta.nome || !newConta.codigo_estrutural) return
    const { data } = await supabase
      .from('plano_contas')
      .insert([{ ...newConta, is_active: true }])
      .select()
      .single()
    if (data) {
      setPlanoContas([...planoContas, data])
      setForm({ ...form, conta_id: data.id })
      setNewContaOpen(false)
      setNewConta({ nome: '', codigo_estrutural: '', natureza: 'receita' })
      toast({ title: 'Conta financeira adicionada' })
    }
  }

  const handleQuickAddSla = async () => {
    if (!newSlaName) return
    const { data } = await supabase
      .from('sla_types')
      .insert([{ name: newSlaName }])
      .select()
      .single()
    if (data) {
      setSlas([...slas, data])
      setForm({ ...form, sla_id: data.id })
      setNewSlaOpen(false)
      setNewSlaName('')
      toast({ title: 'SLA adicionado' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">{id ? 'Editar Contrato' : 'Novo Contrato'}</h1>
      </div>

      <Tabs defaultValue="cliente" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="cliente">Cliente e Tipo</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
          <TabsTrigger value="sla">SLA e Termos</TabsTrigger>
        </TabsList>

        <TabsContent value="cliente" className="space-y-4 bg-card p-6 border rounded-xl">
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <div className="flex gap-2">
              <Select
                value={form.cliente_id}
                onValueChange={(v) => setForm({ ...form, cliente_id: v })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setNewClientOpen(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Contrato</Label>
            <Select
              value={form.tipo_contrato}
              onValueChange={(v) => setForm({ ...form, tipo_contrato: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assinatura">Assinatura</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="suporte">Suporte</SelectItem>
                <SelectItem value="consultoria">Consultoria</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="faturamento" className="space-y-4 bg-card p-6 border rounded-xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={form.data_inicio}
                onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={form.data_fim || ''}
                onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Duração do Ciclo</Label>
              <Select
                value={form.duracao_ciclo}
                onValueChange={(v) => setForm({ ...form, duracao_ciclo: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor do Ciclo (R$)</Label>
              <Input
                value={formatCurrencyInput(form.valor_ciclo)}
                onChange={(e) =>
                  setForm({ ...form, valor_ciclo: parseCurrencyInput(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Conta Financeira (DRE)</Label>
              <div className="flex gap-2">
                <Select
                  value={form.conta_id || ''}
                  onValueChange={(v) => setForm({ ...form, conta_id: v })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {planoContas.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.codigo_estrutural} - {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setNewContaOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4 bg-card p-6 border rounded-xl">
          <div className="space-y-2">
            <Label>SLA Associado</Label>
            <div className="flex gap-2">
              <Select
                value={form.sla_id || ''}
                onValueChange={(v) => setForm({ ...form, sla_id: v })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Nenhum SLA selecionado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum SLA</SelectItem>
                  {slas.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setNewSlaOpen(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observações e Termos Adicionais</Label>
            <RichTextEditor
              value={form.observacoes || ''}
              onChange={(v) => setForm({ ...form, observacoes: v })}
              withAi
              aiContext="Termos contratuais adicionais e observações para um contrato de serviço"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button variant="secondary" onClick={() => handleSave('rascunho')}>
          Salvar Rascunho
        </Button>
        <Button onClick={() => handleSave('ativo')}>Ativar Contrato</Button>
      </div>

      {/* Quick Add Modals */}
      <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewClientOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleQuickAddClient}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newContaOpen} onOpenChange={setNewContaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Conta Financeira</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Código Estrutural</Label>
              <Input
                placeholder="Ex: 1.01.01"
                value={newConta.codigo_estrutural}
                onChange={(e) => setNewConta({ ...newConta, codigo_estrutural: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome da Conta</Label>
              <Input
                placeholder="Ex: Receitas Diversas"
                value={newConta.nome}
                onChange={(e) => setNewConta({ ...newConta, nome: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewContaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleQuickAddConta}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newSlaOpen} onOpenChange={setNewSlaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo SLA</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nome do SLA</Label>
            <Input value={newSlaName} onChange={(e) => setNewSlaName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSlaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleQuickAddSla}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
