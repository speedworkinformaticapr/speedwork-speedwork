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
import { ArrowLeft, FileDown, Plus, FileText, PenLine } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  CONTRACT_STATUS,
  CONTRACT_STATUS_LABEL,
  contractStatusBadgeClass,
} from '@/lib/contract-status'
import { contratoV6Texto } from '@/lib/contract-docx'
import { downloadContractDocx } from '@/lib/contract-docx-download'
import { contractConteudoParaHtml, imprimirContrato } from '@/lib/contract-print'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  ClienteSectionFields,
  FaturamentoSectionFields,
  ServicosSectionFields,
} from './components/ContratoGuiasFields'
import { SignatariosSectionFields } from './components/SignatariosSectionFields'
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
    desconto_adicional: 0,
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
  // % Desconto Adicional: substitui o campo de valor na guia Faturamento.
  const [descontoPercentual, setDescontoPercentual] = useState(0)
  // id do contrato em edição — passa a valer também quando um contrato novo é
  // salvo na hora (guia Signatários), sem depender do parâmetro da rota.
  const [contractId, setContractId] = useState<string | null>(
    id && /^[0-9a-f-]{36}$/i.test(id) ? id : null,
  )
  // Valor do ciclo: soma automática dos serviços; vira manual quando o usuário digita.
  const [valorManual, setValorManual] = useState(false)
  const [coletando, setColetando] = useState(false)

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
            const { desconto_adicional: _desconto, ...resto } = data
            setForm((prev) => ({ ...prev, ...resto }))
            setDescontoPercentual(Number(_desconto ?? 0))
            // Texto cru (gerador V6 com **negrito**) vira HTML formatado; HTML
            // já salvo pelo editor passa intacto.
            setContent(contractConteudoParaHtml(data.content || ''))
            // Valor salvo no banco prevalece sobre a soma automática dos serviços.
            if (data.valor_ciclo) setValorManual(true)
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

  /** Campo de preço do serviço conforme o ciclo escolhido. */
  const valorCampoPorCiclo = (svc: any, ciclo: string): number => {
    switch (ciclo) {
      case 'semestral':
        return Number(svc.semiannual_value ?? 0)
      case 'anual':
        return Number(svc.annual_value ?? 0)
      case 'avulso':
        return Number(svc.avulso_value ?? 0)
      default:
        return Number(svc.monthly_value ?? 0)
    }
  }
  // valorCampoPorCiclo também vive em ContratoGuiasFields.tsx (ServicosSectionFields)

  /** Total dos serviços selecionados para o ciclo escolhido (mostrado na tela). */
  const totalServicos = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + valorCampoPorCiclo(s, form.duracao_ciclo), 0)

  // Valor do ciclo = soma dos serviços do ciclo − % de desconto adicional.
  // Gravado em valor_ciclo: as parcelas do financeiro já nascem com desconto.
  useEffect(() => {
    if (valorManual) return
    const valor = totalServicos * (1 - Math.min(Math.max(descontoPercentual, 0), 100) / 100)
    setForm((prev) => ({ ...prev, valor_ciclo: Math.round(valor * 100) / 100 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServices, form.duracao_ciclo, services, descontoPercentual, valorManual])

  // Ao abrir um contrato salvo sem conteúdo persistido, gera o V6 na carga:
  // o editor já abre com o contrato formatado, sem precisar clicar em "Gerar".
  useEffect(() => {
    if (!id || content || gerando || !form.cliente_id) return
    let ativo = true
    gerarConteudoV6().then((texto) => {
      if (ativo && texto) {
        setContent(contractConteudoParaHtml(texto))
        setContentEditada(false)
      }
    })
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, content, form.cliente_id])

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
    // Converte os marcadores ** do texto cru no mesmo HTML da tela do modelo.
    setContent(contractConteudoParaHtml(texto))
    setContentEditada(true)
    toast({
      title: 'Contrato V6 gerado',
      description: '18 cláusulas + Anexos I, II e III com os dados preenchidos em negrito.',
    })
  }

  /** Salva mantendo o status atual (CRIADO quando o contrato é novo). */
  const handleSalvarAtual = async () => {
    // Conteúdo existente (carregado do banco ou editado) prevalece; só gera
    // quando o contrato ainda não tem documento. Sempre gravado como HTML.
    const texto =
      contentEditada || content ? content : contractConteudoParaHtml(await gerarConteudoV6())
    if (!texto) return
    setContent(texto)
    setContentEditada(true)
    await handleSave(undefined, texto)
  }

  const handleDownloadDocx = async () => {
    const texto =
      contentEditada || content ? content : contractConteudoParaHtml(await gerarConteudoV6())
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

  /** Grava contract_services e contract_signers do formulário (tabela REAL contract_signers). */
  const sincronizarServicosESignatarios = async (cid: string) => {
    await supabase.from('contract_services').delete().eq('contract_id', cid)
    if (selectedServices.length > 0) {
      await supabase.from('contract_services').insert(
        selectedServices.map((serviceId) => ({
          contract_id: cid,
          service_id: serviceId,
        })),
      )
    }
    await saveSigners(
      cid,
      signatarios.map((s) => ({ profile_id: s.profile_id, role: s.role })),
    )
  }

  /**
   * Persiste o contrato e devolve o id. Contrato novo nasce com status CRIADO
   * (etapa 1 do fluxo, CONTRACT_STATUS); em edição mantém o status gravado,
   * salvo quando um status explícito é passado.
   */
  const persistContrato = async (
    statusParam?: string,
    conteudoFinal?: string,
  ): Promise<string | null> => {
    if (!form.cliente_id) {
      toast({ title: 'Erro', description: 'Cliente obrigatório', variant: 'destructive' })
      return null
    }

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
    const statusFinal =
      statusParam ||
      (contractId && (form as any).status ? (form as any).status : CONTRACT_STATUS.CRIADO)
    const payload: any = {
      ...form,
      desconto_adicional: Math.min(Math.max(descontoPercentual, 0), 100),
      status: statusFinal,
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

    if (contractId) {
      const { error } = await supabase.from('contratos').update(payload).eq('id', contractId)
      if (error) {
        toast({
          title: 'Erro ao salvar contrato',
          description: error.message,
          variant: 'destructive',
        })
        return null
      }
      await sincronizarServicosESignatarios(contractId)
      return contractId
    }

    const { data: newContract, error } = await supabase
      .from('contratos')
      .insert([payload])
      .select('id')
      .single()
    if (error || !newContract) {
      toast({
        title: 'Erro ao salvar contrato',
        description: error?.message,
        variant: 'destructive',
      })
      return null
    }
    const novoId = newContract.id
    setContractId(novoId)
    await sincronizarServicosESignatarios(novoId)
    return novoId
  }

  const handleSave = async (statusParam?: string, conteudoFinal?: string) => {
    const salvoId = await persistContrato(statusParam, conteudoFinal)
    if (!salvoId) return
    toast({ title: 'Contrato salvo com sucesso' })
    navigate('/admin/commercial/contratos')
  }

  /** Etapa 2 do fluxo: envia o contrato para assinatura na Autentique. */
  const handleColetarAssinaturas = async () => {
    setColetando(true)
    try {
      const texto =
        contentEditada || content ? content : contractConteudoParaHtml(await gerarConteudoV6())
      if (!texto) return
      const salvoId = await persistContrato(CONTRACT_STATUS.CRIADO, texto)
      if (!salvoId) return
      const { error } = await supabase.functions.invoke('autentique-create-document', {
        body: { contract_id: salvoId, document_type: 'contrato', content: texto },
      })
      if (error) throw new Error(error.message)
      toast({
        title: 'Coleta de assinaturas iniciada',
        description: 'Os signatários receberão o e-mail com o link de assinatura da Autentique.',
      })
      navigate('/admin/commercial/contratos')
    } catch (e: any) {
      toast({
        title: 'Erro ao coletar assinaturas',
        description: e?.message || 'Tente novamente',
        variant: 'destructive',
      })
    } finally {
      setColetando(false)
    }
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

  const addSignatario = async () => {
    if (!novoSig.profile_id) return
    if (signatarios.some((s) => s.profile_id === novoSig.profile_id)) {
      toast({ title: 'Signatário já adicionado', variant: 'destructive' })
      return
    }
    const novaLista: SignerRow[] = [
      ...signatarios,
      {
        id: `novo-${signatarios.length}`,
        profile_id: novoSig.profile_id,
        role: novoSig.role,
        order_index: signatarios.length,
        status: 'Pendente',
        profiles: null,
      },
    ]
    setSignatarios(novaLista)
    setNovoSig({ profile_id: '', role: 'Contratante' })
    // Contrato novo: salva na hora (status CRIADO) para persistir o signatário.
    if (!contractId) {
      const salvoId = await persistContrato(CONTRACT_STATUS.CRIADO)
      if (salvoId) {
        toast({
          title: 'Contrato criado (status CRIADO) e signatário salvo',
          description: 'Continue preenchendo o contrato e salve ao final.',
        })
      }
      return
    }
    await saveSigners(
      contractId,
      novaLista.map((s) => ({ profile_id: s.profile_id, role: s.role })),
    )
  }

  const removeSignatario = async (pid: string) => {
    const novaLista = signatarios.filter((s) => s.profile_id !== pid)
    setSignatarios(novaLista)
    if (contractId) {
      await saveSigners(
        contractId,
        novaLista.map((s) => ({ profile_id: s.profile_id, role: s.role })),
      )
    }
  }

  /** patch genérico do formulário, compartilhado pelas seções extraídas */
  const updateForm = (patch: Record<string, unknown>) => setForm((prev) => ({ ...prev, ...patch }))

  const statusAtual = ((form as any).status as string | undefined) || null
  // Botão Coletar Assinaturas: contrato com signatários, ainda não enviado
  // (CRIADO) ou em status legado anterior ao fluxo.
  const podeColetar =
    signatarios.length > 0 &&
    !!form.cliente_id &&
    (!statusAtual ||
      statusAtual === CONTRACT_STATUS.CRIADO ||
      statusAtual === 'rascunho' ||
      statusAtual === 'ativo')

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{contractId ? 'Editar Contrato' : 'Novo Contrato'}</h1>
          {statusAtual && (
            <Badge className={contractStatusBadgeClass(statusAtual)}>
              {CONTRACT_STATUS_LABEL[statusAtual] || statusAtual}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="cliente" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="cliente">Cliente</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
          <TabsTrigger value="signatarios">Signatários</TabsTrigger>
          <TabsTrigger value="contrato">Contratos e Aditivos</TabsTrigger>
        </TabsList>

        <TabsContent value="cliente" className="space-y-4 bg-card p-6 border rounded-xl">
          <ClienteSectionFields
            form={form}
            update={updateForm}
            clientes={clientes}
            onAddCliente={() => setNewClientOpen(true)}
          />
        </TabsContent>

        <TabsContent value="faturamento" className="space-y-6 bg-card p-6 border rounded-xl">
          <FaturamentoSectionFields
            form={form}
            update={updateForm}
            totalServicos={totalServicos}
            descontoPercentual={descontoPercentual}
            setDescontoPercentual={setDescontoPercentual}
            setValorManual={setValorManual}
            planoContas={planoContas}
            onAddConta={() => setNewContaOpen(true)}
          />
        </TabsContent>

        <TabsContent value="servicos" className="space-y-4 bg-card p-6 border rounded-xl">
          <ServicosSectionFields
            form={form}
            services={services}
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            setValorManual={setValorManual}
            totalServicos={totalServicos}
          />
        </TabsContent>

        <TabsContent value="signatarios" className="space-y-4 bg-card p-6 border rounded-xl">
          <SignatariosSectionFields
            clientes={clientes}
            novoSig={novoSig}
            setNovoSig={setNovoSig}
            signatarios={signatarios}
            addSignatario={addSignatario}
            removeSignatario={removeSignatario}
            update={updateForm}
            form={form}
          />
        </TabsContent>

        <TabsContent value="contrato" className="space-y-4 bg-card p-4 md:p-6 border rounded-xl">
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
          {/* ROLAGEM SÓ NO TEXTO: quem rola é a área do contrato (maxHeight no
              editor). A barra de botões é sticky no topo do editor e não é
              escondida pela rolagem; o restante da página permanece visível. */}
          <RichTextEditor
            value={content}
            onChange={(v) => {
              setContent(v)
              setContentEditada(true)
            }}
            minHeight="480px"
            maxHeight="calc(100dvh - 320px)"
            contentClassName="contract-doc-editor"
            aiContext="Cláusulas contratuais e anexos de um contrato de serviço Speedwork"
          />
          <div className="space-y-2">
            <Label>Observações e Termos Adicionais</Label>
            <RichTextEditor
              value={form.observacoes || ''}
              onChange={(v) => setForm({ ...form, observacoes: v })}
              minHeight="160px"
              maxHeight="240px"
              withAi
              aiContext="Termos contratuais adicionais e observações para um contrato de serviço"
            />
          </div>
          <fieldset className="space-y-4">
            <legend className="text-sm font-medium mb-2">Nível de Serviço (SLA)</legend>
            <div className="space-y-2 max-w-md">
              <Label htmlFor="contrato-sla">SLA</Label>
              <div className="flex gap-2">
                <Select
                  value={form.sla_id || ''}
                  onValueChange={(v) => setForm({ ...form, sla_id: v })}
                >
                  <SelectTrigger id="contrato-sla" className="flex-1">
                    <SelectValue placeholder="Selecione o SLA" />
                  </SelectTrigger>
                  <SelectContent>
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
                  aria-label="Adicionar novo SLA"
                  onClick={() => setNewSlaOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </fieldset>

          {/* CAMPOS DAS DEMAIS GUIAS, abaixo do contrato: seções compactas e
              colapsáveis para consulta/edição sem trocar de guia. A navegação
              por guias continua intacta — isso é um espelho dos mesmos campos. */}
          <div className="border-t pt-4 mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Demais campos do formulário
            </h3>
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="secao-cliente">
                <AccordionTrigger className="text-sm py-3">Cliente</AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <ClienteSectionFields
                    form={form}
                    update={updateForm}
                    clientes={clientes}
                    onAddCliente={() => setNewClientOpen(true)}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="secao-servicos">
                <AccordionTrigger className="text-sm py-3">
                  Serviços ({selectedServices.length})
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <ServicosSectionFields
                    form={form}
                    services={services}
                    selectedServices={selectedServices}
                    setSelectedServices={setSelectedServices}
                    setValorManual={setValorManual}
                    totalServicos={totalServicos}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="secao-faturamento">
                <AccordionTrigger className="text-sm py-3">Faturamento</AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <FaturamentoSectionFields
                    form={form}
                    update={updateForm}
                    totalServicos={totalServicos}
                    descontoPercentual={descontoPercentual}
                    setDescontoPercentual={setDescontoPercentual}
                    setValorManual={setValorManual}
                    planoContas={planoContas}
                    onAddConta={() => setNewContaOpen(true)}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="secao-signatarios">
                <AccordionTrigger className="text-sm py-3">
                  Signatários ({signatarios.length})
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <SignatariosSectionFields
                    clientes={clientes}
                    novoSig={novoSig}
                    setNovoSig={setNovoSig}
                    signatarios={signatarios}
                    addSignatario={addSignatario}
                    removeSignatario={removeSignatario}
                    update={updateForm}
                    form={form}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        {podeColetar && (
          <Button onClick={handleColetarAssinaturas} disabled={coletando || gerando}>
            <PenLine className="w-4 h-4 mr-2" />
            {coletando ? 'Enviando…' : 'Coletar Assinaturas'}
          </Button>
        )}
        <Button variant="secondary" onClick={handleSalvarAtual} disabled={gerando}>
          Salvar Contrato
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
