import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { ArrowLeft, FileDown, Plus, Trash2, FileText } from 'lucide-react'
import { contratoV6Texto } from '@/lib/contract-docx'
import { downloadContractDocx } from '@/lib/contract-docx-download'
import { imprimirContrato } from '@/lib/contract-print'
import {
  fetchClienteDocInfo,
  fetchPlanLimits,
  montarContractDocData,
  type ClienteDocInfo,
} from '@/lib/contract-form-doc'
import { fetchSigners, saveSigners, type SignerRow } from '@/lib/contract-signers'

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
    cliente_representante_nome: '',
    cliente_representante_cpf: '',
    cliente_email_notificacao: '',
    observacoes: '',
  })
  // Conteúdo integral (corpo V6 + anexos) persistido em contratos.content.
  const [content, setContent] = useState('')
  const [contentEditada, setContentEditada] = useState(false)

  // Quick Add States
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [newClientName, setNewClientName] = useState('')

  const [newContaOpen, setNewContaOpen] = useState(false)
  const [newConta, setNewConta] = useState({ nome: '', codigo_estrutural: '', natureza: 'receita' })

  const [newSlaOpen, setNewSlaOpen] = useState(false)
  const [newSlaName, setNewSlaName] = useState('')

  const [services, setServices] = useState<any[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [signatarios, setSignatarios] = useState<SignerRow[]>([])
  const [novoSig, setNovoSig] = useState({ profile_id: '', role: 'Contratante' })

  const [gerando, setGerando] = useState(false)
  const [clienteInfo, setClienteInfo] = useState<ClienteDocInfo | null>(null)

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
    supabase
      .from('services')
      .select('id, title, monthly_value, semiannual_value, annual_value, avulso_value')
      .order('title')
      .then(({ data }) => setServices(data || []))

    if (id) {
      const isUuidValid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
      if (isUuidValid) {
        supabase
          .from('contratos')
          .select('*')
          .eq('id', id)
          .single()
          .then(({ data }) => {
            if (!data) return
            setForm((prev) => ({ ...prev, ...data }))
            setContent(data.content || '')
          })
        supabase
          .from('contract_services')
          .select('service_id')
          .eq('contract_id', id)
          .then(({ data }) => {
            if (data) setSelectedServices(data.map((d: any) => d.service_id))
          })
        fetchSigners(id).then(setSignatarios)
      }
    }
  }, [id])

  /** Busca os dados do cliente quando ele é selecionado (para o documento). */
  useEffect(() => {
    if (!form.cliente_id) {
      setClienteInfo(null)
      return
    }
    fetchClienteDocInfo(form.cliente_id).then(setClienteInfo)
  }, [form.cliente_id])

  /**
   * Gera o conteúdo V6 (18 cláusulas + Anexos I/II/III) com os valores do
   * formulário em **negrito**. Substitui o carregamento antigo de
   * contract_templates, que injetava as 11 cláusulas com {{placeholders}}.
   */
  const gerarConteudoV6 = async (): Promise<string> => {
    if (!form.cliente_id) {
      toast({
        title: 'Erro',
        description: 'Selecione o cliente antes de gerar',
        variant: 'destructive',
      })
      return ''
    }
    setGerando(true)
    try {
      const cliente = clienteInfo || (await fetchClienteDocInfo(form.cliente_id))
      const plano = await fetchPlanLimits(selectedServices)
      const data = montarContractDocData({
        cliente,
        numeroContrato: (form as any).numero_contrato,
        representanteNome: form.cliente_representante_nome,
        representanteCpf: form.cliente_representante_cpf,
        emailNotificacao: form.cliente_email_notificacao,
        valorCiclo: form.valor_ciclo,
        duracaoCiclo: form.duracao_ciclo,
        dataInicio: form.data_inicio,
        dataFim: form.data_fim,
        plano,
      })
      return contratoV6Texto(data)
    } finally {
      setGerando(false)
    }
  }

  const handleGerar = async () => {
    const texto = await gerarConteudoV6()
    if (!texto) return
    setContent(texto)
    setContentEditada(true)
    toast({
      title: 'Contrato V6 gerado',
      description: '18 cláusulas + Anexos I, II e III com os dados preenchidos em negrito.',
    })
  }

  const handleGerarSalvar = async (status: string) => {
    const texto = contentEditada ? content : await gerarConteudoV6()
    if (!texto) return
    setContent(texto)
    setContentEditada(true)
    await handleSave(status, texto)
  }

  const handleDownloadDocx = async () => {
    const texto = contentEditada ? content : await gerarConteudoV6()
    if (!texto) return
    const numero = (form as any).numero_contrato || `CTR-${Date.now()}`
    await downloadContractDocx(
      `Contrato ${numero}`,
      texto,
      `${numero.replace(/[^\w-]/g, '')}-contrato.docx`,
      false,
    )
  }

  const handleImprimir = () => {
    if (!content) {
      toast({ title: 'Gere o contrato antes de imprimir', variant: 'destructive' })
      return
    }
    const numero = (form as any).numero_contrato || 'contrato'
    imprimirContrato(`Contrato ${numero}`, content)
  }

  const handleSave = async (status: string, conteudoFinal?: string) => {
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

    const numeroContrato = (form as any).numero_contrato || `CTR-${Date.now()}`
    const payload: any = {
      ...form,
      status,
      user_id: user?.id,
      responsavel_id,
      numero_contrato: numeroContrato,
      data_proxima_cobranca: (form as any).data_proxima_cobranca || form.data_inicio,
    }
    if (conteudoFinal) payload.content = conteudoFinal
    if (!payload.conta_id) payload.conta_id = null
    if (!payload.sla_id) payload.sla_id = null
    if (!payload.data_fim) payload.data_fim = null
    if (!payload.cliente_representante_nome) payload.cliente_representante_nome = null
    if (!payload.cliente_representante_cpf) payload.cliente_representante_cpf = null
    if (!payload.cliente_email_notificacao) payload.cliente_email_notificacao = null

    let contractId = id
    if (id) {
      await supabase.from('contratos').update(payload).eq('id', id)
    } else {
      const { data: newContract, error } = await supabase
        .from('contratos')
        .insert([payload])
        .select('id')
        .single()
      if (error) {
        toast({
          title: 'Erro ao salvar contrato',
          description: error.message,
          variant: 'destructive',
        })
        return
      }
      contractId = newContract?.id
    }

    if (contractId) {
      await supabase.from('contract_services').delete().eq('contract_id', contractId)
      if (selectedServices.length > 0) {
        await supabase.from('contract_services').insert(
          selectedServices.map((serviceId) => ({
            contract_id: contractId,
            service_id: serviceId,
          })),
        )
      }
      // Signatários na tabela REAL contract_signers (não contract_signatories).
      await saveSigners(
        contractId,
        signatarios.map((s) => ({ profile_id: s.profile_id, role: s.role })),
      )
    }

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

  const addSignatario = () => {
    if (!novoSig.profile_id || !id) return
    if (signatarios.some((s) => s.profile_id === novoSig.profile_id)) {
      toast({ title: 'Signatário já adicionado', variant: 'destructive' })
      return
    }
    setSignatarios([
      ...signatarios,
      {
        id: `novo-${signatarios.length}`,
        profile_id: novoSig.profile_id,
        role: novoSig.role,
        order_index: signatarios.length,
        status: 'Pendente',
        profiles: null,
      },
    ])
    setNovoSig({ profile_id: '', role: 'Contratante' })
    toast({
      title: 'Signatário adicionado à lista',
      description: 'Salve o contrato para persistir.',
    })
  }

  const removeSignatario = (pid: string) => {
    setSignatarios(signatarios.filter((s) => s.profile_id !== pid))
  }

  const nomeSignatario = (s: SignerRow) =>
    s.profiles?.name || clientes.find((c) => c.id === s.profile_id)?.nome || '—'

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">{id ? 'Editar Contrato' : 'Novo Contrato'}</h1>
      </div>

      <Tabs defaultValue="cliente" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="cliente">Cliente e Tipo</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="signatarios">Signatários</TabsTrigger>
          <TabsTrigger value="contrato">Contrato e Termos</TabsTrigger>
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Representante da CONTRATANTE</Label>
              <Input
                placeholder="Nome do representante legal"
                value={form.cliente_representante_nome || ''}
                onChange={(e) => setForm({ ...form, cliente_representante_nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CPF do representante</Label>
              <Input
                placeholder="000.000.000-00"
                value={form.cliente_representante_cpf || ''}
                onChange={(e) => setForm({ ...form, cliente_representante_cpf: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail de notificação</Label>
              <Input
                type="email"
                placeholder="notificacoes@cliente.com.br"
                value={form.cliente_email_notificacao || ''}
                onChange={(e) => setForm({ ...form, cliente_email_notificacao: e.target.value })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            O conteúdo do documento é gerado a partir do modelo V6 da Speedwork (aba Contrato e
            Termos) — não é mais carregado de modelos antigos com placeholders.
          </p>
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

        <TabsContent value="servicos" className="space-y-4 bg-card p-6 border rounded-xl">
          <div className="space-y-2">
            <Label>Serviços Vinculados</Label>
            <p className="text-sm text-muted-foreground">
              Selecione os serviços comerciais que fazem parte deste contrato. A ficha de limites do
              plano (Anexo I) vem do serviço selecionado.
            </p>
            <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
              {services.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  Nenhum serviço cadastrado. Cadastre serviços em Serviços (/admin/services).
                </p>
              ) : (
                services.map((svc) => (
                  <label
                    key={svc.id}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(svc.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServices([...selectedServices, svc.id])
                        } else {
                          setSelectedServices(selectedServices.filter((s) => s !== svc.id))
                        }
                      }}
                      className="size-4 rounded border-border"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-sm">{svc.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(svc.monthly_value || 0)}
                      /mês
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="signatarios" className="space-y-4 bg-card p-6 border rounded-xl">
          <div className="space-y-2">
            <Label>Signatários do Contrato</Label>
            <p className="text-sm text-muted-foreground">
              Adicione quem assina o documento (CONTRATANTE, CONTRATADA, testemunhas). A ordem
              define a sequência de assinatura.
            </p>
            {id && (
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Perfil</Label>
                  <Select
                    value={novoSig.profile_id}
                    onValueChange={(v) => setNovoSig({ ...novoSig, profile_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-48 space-y-1">
                  <Label className="text-xs">Papel</Label>
                  <Select
                    value={novoSig.role}
                    onValueChange={(v) => setNovoSig({ ...novoSig, role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contratante">Contratante</SelectItem>
                      <SelectItem value="Contratado">Contratado</SelectItem>
                      <SelectItem value="Interveniente Anuente">Interveniente Anuente</SelectItem>
                      <SelectItem value="Testemunha">Testemunha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" onClick={addSignatario}>
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>
            )}
            <div className="space-y-2 mt-2">
              {signatarios.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum signatário adicionado.</p>
              ) : (
                signatarios.map((s) => (
                  <div
                    key={s.profile_id}
                    className="flex items-center justify-between bg-muted/30 p-2 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {nomeSignatario(s)}{' '}
                        <span className="text-xs text-muted-foreground">({s.role})</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ordem {s.order_index + 1} · {s.status || 'Pendente'}
                      </p>
                    </div>
                    <button
                      onClick={() => removeSignatario(s.profile_id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contrato" className="space-y-4 bg-card p-6 border rounded-xl">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={handleGerar} disabled={gerando}>
              <FileText className="w-4 h-4 mr-2" />
              {gerando ? 'Gerando…' : 'Gerar contrato V6'}
            </Button>
            <Button type="button" variant="outline" onClick={handleDownloadDocx} disabled={gerando}>
              <FileDown className="w-4 h-4 mr-2" /> Baixar .docx
            </Button>
            <Button type="button" variant="outline" onClick={handleImprimir} disabled={!content}>
              Imprimir / PDF
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            "Gerar contrato V6" monta as 18 cláusulas + Anexos I, II e III com os dados do
            formulário em negrito. Ajuste manualmente pelo editor (negrito, itálico, listas) antes
            de salvar.
          </p>
          <RichTextEditor
            value={content}
            onChange={(v) => {
              setContent(v)
              setContentEditada(true)
            }}
            minHeight="500px"
            aiContext="Cláusulas contratuais e anexos de um contrato de serviço Speedwork"
          />
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
        <Button
          variant="secondary"
          onClick={() => handleGerarSalvar('rascunho')}
          disabled={gerando}
        >
          Salvar Rascunho
        </Button>
        <Button onClick={() => handleGerarSalvar('ativo')} disabled={gerando}>
          Ativar Contrato
        </Button>
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
