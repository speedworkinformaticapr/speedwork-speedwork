// Wizard v2 do módulo de contratos: etapa única de seleção (cliente + plano) →
// limites e valores preenchidos automaticamente do plano → documento gerado com
// placeholders substituídos → preview e download .docx → salvar contrato.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileText, Save, Sparkles } from 'lucide-react'
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
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  V6_MASTER_TEMPLATE_FALLBACK,
  fillPlaceholders,
  formatLimites,
  BRL,
  DATA_BR,
  type ContractDocData,
  type PlanLimits,
} from '@/lib/contract-docx'
import { downloadContractDocx } from '@/lib/contract-docx-download'

interface PlanoRow extends PlanLimits {
  id: string
  description?: string | null
}

interface ClienteRow {
  id: string
  name?: string | null
  cpf_cnpj?: string | null
  address?: string | null
}

const V6_TEMPLATE_NAME = 'Modelo Mestre — SGC4WEB V6'

export default function ContractWizard() {
  const { roles } = useAuth()
  const podeEditar = roles.includes('master') || roles.includes('admin')
  const navigate = useNavigate()

  const [planos, setPlanos] = useState<PlanoRow[]>([])
  const [clientes, setClientes] = useState<ClienteRow[]>([])
  const [templateV6, setTemplateV6] = useState<string>('')
  const [carregando, setCarregando] = useState(true)
  const [gerando, setGerando] = useState(false)

  const [clienteId, setClienteId] = useState<string>('')
  const [planoId, setPlanoId] = useState<string>('')
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0])
  const [vigenciaMeses, setVigenciaMeses] = useState('12')

  useEffect(() => {
    const carregar = async () => {
      const [planosRes, clientesRes, templateRes] = await Promise.all([
        supabase.from('plans').select('*').eq('is_active', true).order('monthly_price'),
        supabase.from('profiles').select('id, name, cpf_cnpj, address').eq('is_client', true),
        supabase
          .from('contract_templates')
          .select('content')
          .eq('name', V6_TEMPLATE_NAME)
          .maybeSingle(),
      ])
      setPlanos(planosRes.data || [])
      setClientes(clientesRes.data || [])
      setTemplateV6(templateRes.data?.content || V6_MASTER_TEMPLATE_FALLBACK)
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

  const exportDeadline = useMemo(() => {
    // cancelamento hoje → prazo de exportação de 30 dias (alerta no dashboard)
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  }, []) // calculado no momento da geração

  const numeroContrato = useMemo(
    () => `CTR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    [],
  )

  const docData: ContractDocData = {
    numero_contrato: numeroContrato,
    cliente_nome: cliente?.name || null,
    cliente_cnpj: cliente?.cpf_cnpj || null,
    cliente_endereco: cliente?.address || null,
    valor_mensal: plano?.monthly_price ?? null,
    data_inicio: dataInicio,
    data_fim: dataFim || null,
    reajuste_date: reajusteDate,
    plano,
  }

  const documento = useMemo(
    () => fillPlaceholders(templateV6 || V6_MASTER_TEMPLATE_FALLBACK, docData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [templateV6, cliente, plano, dataInicio, dataFim, reajusteDate, numeroContrato],
  )

  const handleGerarSalvar = async (status: string) => {
    if (!clienteId) return toast({ title: 'Selecione o cliente', variant: 'destructive' })
    if (!planoId) return toast({ title: 'Selecione o plano', variant: 'destructive' })

    setGerando(true)
    try {
      const { data, error } = await supabase
        .from('contratos')
        .insert({
          numero_contrato: numeroContrato,
          cliente_id: clienteId,
          tipo_contrato: 'servico',
          status,
          data_inicio: dataInicio,
          data_fim: dataFim || null,
          valor_ciclo: plano?.monthly_price ?? null,
          plan_id: planoId,
          reajuste_index: plano?.reajuste_index || 'IPCA',
          reajuste_date: reajusteDate || null,
          renewal_date: renewalDate || null,
          export_deadline_date: status === 'cancelado' ? exportDeadline : null,
          content: documento,
        })
        .select('id')
        .single()
      if (error) throw error

      await supabase.from('contract_annexes').insert({
        contract_id: data.id,
        annex_type: 'contrato_social',
        version: 'v1',
        content: documento,
      })

      toast({ title: `Contrato ${numeroContrato} salvo com sucesso!` })
      navigate(`/admin/contracts/${data.id}`)
    } catch (e) {
      console.error('Erro ao salvar contrato:', e)
      toast({ title: 'Erro ao salvar o contrato', variant: 'destructive' })
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
          documento é gerado com os dados do contrato.
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
            <Label>Cliente (parte contratada) *</Label>
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
                    {p.name} — {BRL(p.monthly_price)}/mês
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
                <strong>{BRL(plano.monthly_price)}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Taxa de implantação:</span>{' '}
                <strong>{BRL(plano.setup_price)}</strong>
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
