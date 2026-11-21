// Wizard v2 do módulo de contratos: etapa única de seleção (cliente + plano) →
// limites e valores preenchidos automaticamente do plano → documento gerado pelo
// modelo V6 REAL (corpo com 18 cláusulas + Anexos I, II e III literais) →
// preview e download .docx → salvar contrato. Os campos do representante da
// CONTRATANTE e o e-mail de notificação entram no documento e são persistidos
// em contratos (cliente_representante_nome/cpf, cliente_email_notificacao).
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileText, PenLine, Save, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  contratoV6Completo,
  fillPlaceholders,
  formatLimites,
  BRL,
  DATA_BR,
  ANEXO_I_V6,
  type ContractDocData,
  type PlanLimits,
} from '@/lib/contract-docx'
import { downloadContractDocx } from '@/lib/contract-docx-download'
import { criarDocumentoAutentique } from '@/services/autentique'
import {
  fetchPlanCatalog,
  planDisplayTitle,
  planMonthlyValue,
  planSetupValue,
  type PlanCatalogRow,
} from '@/services/plan-catalog'

type PlanoRow = PlanCatalogRow

interface ClienteRow {
  id: string
  name?: string | null
  cpf_cnpj?: string | null
  address?: string | null
}

export default function ContractWizard() {
  const { roles } = useAuth()
  const podeEditar = roles.includes('master') || roles.includes('admin')
  const navigate = useNavigate()

  const [planos, setPlanos] = useState<PlanoRow[]>([])
  const [clientes, setClientes] = useState<ClienteRow[]>([])
  const [carregando, setCarregando] = useState(true)
  const [gerando, setGerando] = useState(false)

  const [clienteId, setClienteId] = useState<string>('')
  const [planoId, setPlanoId] = useState<string>('')
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0])
  const [vigenciaMeses, setVigenciaMeses] = useState('12')

  // Representante da CONTRATANTE e e-mail de notificação (vão para o documento
  // e para as colunas cliente_representante_nome/cpf e cliente_email_notificacao)
  const [repNome, setRepNome] = useState('')
  const [repCpf, setRepCpf] = useState('')
  const [emailNotificacao, setEmailNotificacao] = useState('')

  useEffect(() => {
    const carregar = async () => {
      const [planosRes, clientesRes] = await Promise.all([
        fetchPlanCatalog(true),
        supabase.from('profiles').select('id, name, cpf_cnpj, address').eq('is_client', true),
      ])
      setPlanos(planosRes || [])
      setClientes(clientesRes.data || [])
      setCarregando(false)
    }
    carregar()
  }, [])

  const cliente = clientes.find((c) => c.id === clienteId) || null
  const plano = planos.find((p) => p.id === planoId) || null

  const dataFim = useMemo(() => {
    if (!dataInicio) return ''
    const d = new Date(`${dataInicio}T12:00:00`)
    d.setMonth(d.getMonth() + (parseInt(vigenciaMeses, 10) || 12))
    return d.toISOString().split('T')[0]
  }, [dataInicio, vigenciaMeses])

  const reajusteDate = useMemo(() => {
    if (!dataInicio) return ''
    const d = new Date(`${dataInicio}T12:00:00`)
    d.setMonth(d.getMonth() + 12)
    return d.toISOString().split('T')[0]
  }, [dataInicio])

  const renewalDate = dataFim

  const numeroContrato = useMemo(
    () => `CTR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    [],
  )

  const docData: ContractDocData = {
    numero_contrato: numeroContrato,
    cliente_nome: cliente?.name || null,
    cliente_razao: cliente?.name || null,
    cliente_cnpj: cliente?.cpf_cnpj || null,
    cliente_endereco: cliente?.address || null,
    cliente_representante: repNome || null,
    cliente_representante_cpf: repCpf || null,
    cliente_email: emailNotificacao || null,
    cliente_email_notificacao: emailNotificacao || null,
    valor_mensal: planMonthlyValue(plano),
    data_inicio: dataInicio,
    data_fim: dataFim || null,
    reajuste_date: reajusteDate,
    plano,
  }

  /** Documento integral V6: corpo + Anexos I, II e III, já preenchidos. */
  const documento = useMemo(
    () => contratoV6Completo(docData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cliente,
      plano,
      dataInicio,
      dataFim,
      reajusteDate,
      numeroContrato,
      repNome,
      repCpf,
      emailNotificacao,
    ],
  )

  /** Anexo I estruturado (ficha do plano), preenchido pelo mesmo motor V6. */
  const anexoIPreenchido = useMemo(
    () => (plano ? fillPlaceholders(ANEXO_I_V6, docData) : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plano, cliente, repNome, repCpf, emailNotificacao, dataInicio],
  )

  const { toast } = useToast()

  const salvarContrato = async (status: string) => {
    const { data, error } = await supabase
      .from('contratos')
      .insert({
        numero_contrato: numeroContrato,
        cliente_id: clienteId,
        tipo_contrato: 'servico',
        status,
        data_inicio: dataInicio,
        data_fim: dataFim || null,
        valor_ciclo: Number(planMonthlyValue(plano) ?? 0),
        plan_id: planoId,
        reajuste_index: plano?.reajuste_index || 'IPCA',
        reajuste_date: reajusteDate || null,
        renewal_date: renewalDate || null,
        content: documento,
        cliente_representante_nome: repNome || null,
        cliente_representante_cpf: repCpf || null,
        cliente_email_notificacao: emailNotificacao || null,
      })
      .select('id')
      .single()
    if (error) throw error
    if (!data?.id) throw new Error('Contrato salvo sem identificação')

    await supabase.from('contract_annexes').insert([
      {
        contract_id: data.id,
        annex_type: 'contrato_social',
        version: 'v1',
        content: documento,
      },
      {
        contract_id: data.id,
        annex_type: 'anexo_i',
        version: 'v1',
        content: anexoIPreenchido || fillPlaceholders(ANEXO_I_V6, docData),
      },
    ])
    return data.id as string
  }

  /** Garante os signatários: CONTRATADA (1) = empresa, CONTRATANTE (2) = cliente. */
  const garantirSignatarios = async (contractId: string) => {
    const { data: existentes } = await supabase
      .from('contract_signers')
      .select('id')
      .eq('contract_id', contractId)
    if (existentes && existentes.length > 0) return

    const { error } = await supabase.from('contract_signers').insert([
      {
        contract_id: contractId,
        role: 'CONTRATADA',
        order_index: 1,
        status: 'Pendente',
      },
      {
        contract_id: contractId,
        role: 'CONTRATANTE',
        order_index: 2,
        status: 'Pendente',
        profile_id: clienteId,
      },
    ])
    if (error) throw new Error('Falha ao criar signatários: ' + error.message)
  }

  /** Envia o contrato salvo para assinatura na Autentique (CONTRATADA → CONTRATANTE). */
  const handleGerarSalvar = async (status: string) => {
    if (!clienteId) return toast({ title: 'Selecione o cliente', variant: 'destructive' })
    if (!planoId) return toast({ title: 'Selecione o plano', variant: 'destructive' })

    setGerando(true)
    let contractId = ''
    try {
      contractId = await salvarContrato(status)
      if (status === 'em assinatura') {
        // Cria os signatários na ordem CONTRATADA (1) → CONTRATANTE (2)
        await garantirSignatarios(contractId)
        await criarDocumentoAutentique(contractId, 'contrato')
      }
      toast({
        title: `Contrato ${numeroContrato} salvo com sucesso!`,
        description:
          status === 'em assinatura' ? 'Enviado para assinatura na Autentique.' : undefined,
      })
      navigate(`/admin/contracts/${contractId}`)
    } catch (e) {
      console.error('Erro ao salvar contrato:', e)
      toast({
        title: 'Erro no fluxo do contrato',
        description: e instanceof Error ? e.message : 'Tente novamente.',
        variant: 'destructive',
      })
      if (contractId) navigate(`/admin/contracts/${contractId}`)
    } finally {
      setGerando(false)
    }
  }

  const filename = `contrato-${numeroContrato.toLowerCase()}.docx`

  if (!podeEditar) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Acesso negado. Apenas Admin e Master podem gerar contratos.
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assistente de Contrato — v2</h1>
        <p className="text-muted-foreground">
          Escolha o cliente e o plano: limites e valores são preenchidos automaticamente e o
          documento é gerado no modelo SGC4WEB V6 (18 cláusulas + Anexos I, II e III).
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">1. Cliente + Plano</Badge>
        <span>→</span>
        <Badge variant="outline">2. Documento gerado</Badge>
        <span>→</span>
        <Badge variant="outline">3. Preview .docx</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Seleção (etapa única)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Cliente (parte contratante) *</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={carregando ? 'Carregando...' : 'Selecione o cliente...'}
                />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name || c.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Plano *</Label>
            <Select value={planoId} onValueChange={setPlanoId}>
              <SelectTrigger>
                <SelectValue placeholder={carregando ? 'Carregando...' : 'Selecione o plano...'} />
              </SelectTrigger>
              <SelectContent>
                {planos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {planDisplayTitle(p)} — {BRL(planMonthlyValue(p))}/mês
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data de início</Label>
            <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Vigência (meses)</Label>
            <Select value={vigenciaMeses} onValueChange={setVigenciaMeses}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['6', '12', '24', '36'].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m} meses
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Representante da CONTRATANTE</Label>
            <Input
              value={repNome}
              onChange={(e) => setRepNome(e.target.value)}
              placeholder="Nome do representante legal"
            />
          </div>
          <div className="space-y-2">
            <Label>CPF do representante</Label>
            <Input
              value={repCpf}
              onChange={(e) => setRepCpf(e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>E-mail de notificação da CONTRATANTE</Label>
            <Input
              type="email"
              value={emailNotificacao}
              onChange={(e) => setEmailNotificacao(e.target.value)}
              placeholder="E-mail para notificações do contrato"
            />
          </div>
        </CardContent>
      </Card>

      {plano && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Limites e valores preenchidos do plano {plano.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm md:grid-cols-3">
              <div>
                <span className="text-muted-foreground">Valor mensal:</span>{' '}
                <strong>{BRL(planMonthlyValue(plano))}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Taxa de implantação:</span>{' '}
                <strong>{BRL(planSetupValue(plano))}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Índice de reajuste:</span>{' '}
                <strong>{plano.reajuste_index || 'IPCA'}</strong>
              </div>
              <div className="md:col-span-3">
                <span className="text-muted-foreground">Limites:</span> {formatLimites(plano)}
              </div>
              <div className="md:col-span-3">
                <span className="text-muted-foreground">SLA:</span> {plano.sla_description || '—'}
              </div>
              <div>
                <span className="text-muted-foreground">Vigência:</span> {DATA_BR(dataInicio)} até{' '}
                {DATA_BR(dataFim)}
              </div>
              <div>
                <span className="text-muted-foreground">Renovação:</span> {DATA_BR(renewalDate)}
              </div>
              <div>
                <span className="text-muted-foreground">Reajuste em:</span> {DATA_BR(reajusteDate)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-5 h-5 text-primary" /> Preview do documento gerado
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadContractDocx('Contrato', documento, filename)}
            >
              <Download className="w-4 h-4 mr-1" /> Baixar .docx
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed max-h-[420px] overflow-auto">
            {documento}
          </pre>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate('/admin/contracts/dashboard')}>
          Cancelar
        </Button>
        <Button
          variant="secondary"
          disabled={gerando}
          onClick={() => handleGerarSalvar('rascunho')}
        >
          <Save className="w-4 h-4 mr-1" /> Salvar Rascunho
        </Button>
        <Button disabled={gerando} onClick={() => handleGerarSalvar('em assinatura')}>
          <FileText className="w-4 h-4 mr-1" /> Enviar para Assinatura
        </Button>
      </div>
    </div>
  )
}
