// Tela de Aditivos do módulo de contratos: lista por contrato e criação de
// aditivo (renovação, reajuste, mudança de plano) gerado pelo mesmo motor de
// documentos do Wizard v2 (src/lib/contract-docx.ts + download validado).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, FileText, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  BRL,
  DATA_BR,
  V6_MASTER_TEMPLATE_FALLBACK,
  fillPlaceholders,
  formatLimites,
  type ContractDocData,
} from '@/lib/contract-docx'
import { downloadContractDocx } from '@/lib/contract-docx-download'

interface ContratoRow {
  id: string
  numero_contrato?: string | null
  cliente_id?: string | null
  plan_id?: string | null
  valor_ciclo?: number | null
  data_inicio?: string | null
  data_fim?: string | null
  reajuste_date?: string | null
  reajuste_index?: string | null
  renewal_date?: string | null
  status?: string | null
  profiles?: { name?: string | null } | null
  plans?: {
    name?: string | null
    monthly_price?: number | null
    reajuste_index?: string | null
  } | null
}

interface AditivoRow {
  id: string
  contract_id: string
  title?: string | null
  additive_type?: string | null
  status?: string | null
  content?: string | null
  start_date?: string | null
  end_date?: string | null
  created_at?: string | null
  contratos?: { numero_contrato?: string | null } | null
}

interface ClienteRow {
  id: string
  name?: string | null
  cpf_cnpj?: string | null
  address?: string | null
}

interface PlanoRow {
  id: string
  name: string
  monthly_price?: number | null
  reajuste_index?: string | null
  sla_description?: string | null
  max_users?: number | null
  max_storage_gb?: number | null
  max_traffic_gb?: number | null
  max_pages?: number | null
  max_emails?: number | null
  max_domains?: number | null
  support_hours?: number | null
}

const TIPOS: Record<string, string> = {
  renovacao: 'Renovação',
  reajuste: 'Reajuste',
  plano: 'Mudança de Plano',
}

function hojeIso() {
  return new Date().toISOString().split('T')[0]
}

function addMeses(iso: string, meses: number) {
  const d = new Date(`${iso}T12:00:00`)
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().split('T')[0]
}

export default function AddendumsV2() {
  const { roles } = useAuth()
  const podeEditar = roles.includes('master') || roles.includes('admin')

  const [aditivos, setAditivos] = useState<AditivoRow[]>([])
  const [contratos, setContratos] = useState<ContratoRow[]>([])
  const [clientes, setClientes] = useState<ClienteRow[]>([])
  const [planos, setPlanos] = useState<PlanoRow[]>([])
  const [templateV6, setTemplateV6] = useState('')
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filtroContrato, setFiltroContrato] = useState('all')

  // formulário
  const [contratoId, setContratoId] = useState('')
  const [tipo, setTipo] = useState('renovacao')
  const [novoPlanoId, setNovoPlanoId] = useState('')
  const [novaVigenciaMeses, setNovaVigenciaMeses] = useState('12')
  const [dataVigencia, setDataVigencia] = useState(hojeIso())

  const carregar = useCallback(async () => {
    setLoading(true)
    const [aditivosRes, contratosRes, clientesRes, planosRes, templateRes] = await Promise.all([
      supabase
        .from('contract_additives')
        .select('*, contratos(numero_contrato)')
        .order('created_at', { ascending: false }),
      supabase
        .from('contratos')
        .select('*, profiles(name), plans(name, monthly_price, reajuste_index)')
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, name, cpf_cnpj, address').eq('is_client', true),
      supabase.from('plans').select('*').eq('is_active', true).order('monthly_price'),
      supabase
        .from('contract_templates')
        .select('content')
        .eq('name', 'Modelo Mestre — SGC4WEB V6')
        .maybeSingle(),
    ])
    setAditivos(aditivosRes.data || [])
    setContratos(contratosRes.data || [])
    setClientes(clientesRes.data || [])
    setPlanos(planosRes.data || [])
    setTemplateV6(templateRes.data?.content || V6_MASTER_TEMPLATE_FALLBACK)
    setLoading(false)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const contrato = contratos.find((c) => c.id === contratoId) || null
  const planoAtual = planos.find((p) => p.id === contrato?.plan_id) || null
  const cliente = clientes.find((c) => c.id === contrato?.cliente_id) || null
  const planoNovo = planos.find((p) => p.id === novoPlanoId) || null
  const planoDoc = tipo === 'plano' ? planoNovo || planoAtual : planoAtual

  const conteudo = useMemo(() => {
    if (!contrato) return ''
    const fimNovo =
      tipo === 'renovacao' && dataVigencia
        ? addMeses(dataVigencia, parseInt(novaVigenciaMeses, 10) || 12)
        : tipo === 'plano' && dataVigencia
          ? addMeses(dataVigencia, parseInt(novaVigenciaMeses, 10) || 12)
          : contrato.data_fim
    const data: ContractDocData = {
      numero_contrato: contrato.numero_contrato,
      cliente_nome: cliente?.name || null,
      cliente_cnpj: cliente?.cpf_cnpj || null,
      cliente_endereco: cliente?.address || null,
      valor_mensal:
        tipo === 'plano'
          ? (planoNovo?.monthly_price ?? contrato.valor_ciclo)
          : contrato.valor_ciclo,
      data_inicio: dataVigencia,
      data_fim: fimNovo,
      reajuste_date: contrato.reajuste_date,
      plano: planoDoc,
    }
    const corpo = fillPlaceholders(templateV6 || V6_MASTER_TEMPLATE_FALLBACK, data)
    let adicao = ''
    if (tipo === 'renovacao') {
      adicao = `\n\nTERMO ADITIVO DE RENOVAÇÃO. As partes renovam, por ${novaVigenciaMeses} meses, o Contrato nº ${contrato.numero_contrato}, com vigência de ${DATA_BR(dataVigencia)} a ${DATA_BR(fimNovo)}, mantidas as demais cláusulas.`
    } else if (tipo === 'reajuste') {
      adicao = `\n\nTERMO ADITIVO DE REAJUSTE. Ficam reajustados em ${contrato.reajuste_index || planoDoc?.reajuste_index || 'IPCA'} os valores do Contrato nº ${contrato.numero_contrato} a partir de ${DATA_BR(dataVigencia)}, que passa a ser ${BRL(contrato.valor_ciclo)}.`
    } else {
      adicao = `\n\nTERMO ADITIVO DE MUDANÇA DE PLANO. A partir de ${DATA_BR(dataVigencia)}, o Contrato nº ${contrato.numero_contrato} passa a vigorar no ${planoNovo?.name || '[PLANO]'}, com limites de ${formatLimites(planoNovo)} e valor mensal de ${BRL(planoNovo?.monthly_price)}, permanecendo as demais cláusulas inalteradas.`
    }
    return corpo + adicao
  }, [
    contrato,
    tipo,
    cliente,
    planoAtual,
    planoNovo,
    planoDoc,
    dataVigencia,
    novaVigenciaMeses,
    templateV6,
  ])

  const handleSalvar = async () => {
    if (!contratoId) return toast({ title: 'Selecione o contrato', variant: 'destructive' })
    setSalvando(true)
    try {
      const fimNovo =
        tipo === 'renovacao' || tipo === 'plano'
          ? addMeses(dataVigencia, parseInt(novaVigenciaMeses, 10) || 12)
          : null
      const { error } = await supabase.from('contract_additives').insert({
        contract_id: contratoId,
        title: `${TIPOS[tipo]} — ${contrato?.numero_contrato || 'contrato'}`,
        description: conteudo.slice(0, 180),
        additive_type: tipo,
        status: 'Rascunho',
        content: conteudo,
        start_date: dataVigencia,
        end_date: fimNovo,
      })

      // Efeitos no contrato
      if (tipo === 'renovacao' && fimNovo) {
        await supabase
          .from('contratos')
          .update({ renewal_date: fimNovo, data_fim: fimNovo })
          .eq('id', contratoId)
      } else if (tipo === 'reajuste') {
        const novoValor = contrato?.valor_ciclo
        await supabase
          .from('contratos')
          .update({ reajuste_date: addMeses(dataVigencia, 12) })
          .eq('id', contratoId)
        void novoValor
      } else if (tipo === 'plano' && novoPlanoId) {
        await supabase
          .from('contratos')
          .update({
            plan_id: novoPlanoId,
            valor_ciclo: planoNovo?.monthly_price ?? null,
            reajuste_index: planoNovo?.reajuste_index || 'IPCA',
          })
          .eq('id', contratoId)
      }

      toast({ title: 'Aditivo salvo com sucesso!' })
      setDialogOpen(false)
      setContratoId('')
      setTipo('renovacao')
      await carregar()
    } catch (e) {
      console.error('Erro ao salvar aditivo:', e)
      toast({ title: 'Erro ao salvar o aditivo', variant: 'destructive' })
    } finally {
      setSalvando(false)
    }
  }

  const listaFiltrada =
    filtroContrato === 'all' ? aditivos : aditivos.filter((a) => a.contract_id === filtroContrato)

  if (!podeEditar) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Acesso negado. Apenas Admin e Master podem gerenciar aditivos.
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Aditivos de Contrato</h1>
          <p className="text-muted-foreground">
            Renovação, reajuste e mudança de plano, gerados pelo mesmo motor de documentos.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Aditivo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aditivos Cadastrados</CardTitle>
          <Select value={filtroContrato} onValueChange={setFiltroContrato}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Filtrar por contrato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os contratos</SelectItem>
              {contratos.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.numero_contrato} — {c.profiles?.name || 'sem cliente'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Documento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listaFiltrada.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum aditivo encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  listaFiltrada.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {a.contratos?.numero_contrato || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{TIPOS[a.additive_type || ''] || 'Outro'}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{a.title || '—'}</TableCell>
                      <TableCell>
                        {a.start_date || a.end_date
                          ? `${DATA_BR(a.start_date)} – ${DATA_BR(a.end_date)}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{a.status || 'Rascunho'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {a.content && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              downloadContractDocx(
                                a.title || 'Aditivo',
                                a.content as string,
                                `aditivo-${(a.contratos?.numero_contrato || 'contrato').toLowerCase()}.docx`,
                              )
                            }
                          >
                            <Download className="w-4 h-4 mr-1" /> .docx
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Novo Aditivo
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Contrato *</Label>
              <Select value={contratoId} onValueChange={setContratoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contrato..." />
                </SelectTrigger>
                <SelectContent>
                  {contratos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.numero_contrato} — {c.profiles?.name || 'sem cliente'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de aditivo *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPOS).map(([valor, rotulo]) => (
                    <SelectItem key={valor} value={valor}>
                      {rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vigência a partir de</Label>
              <Input
                type="date"
                value={dataVigencia}
                onChange={(e) => setDataVigencia(e.target.value)}
              />
            </div>
            {tipo !== 'reajuste' && (
              <div className="space-y-2">
                <Label>Nova vigência (meses)</Label>
                <Select value={novaVigenciaMeses} onValueChange={setNovaVigenciaMeses}>
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
            )}
            {tipo === 'plano' && (
              <div className="space-y-2 md:col-span-2">
                <Label>Novo plano *</Label>
                <Select value={novoPlanoId} onValueChange={setNovoPlanoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o novo plano..." />
                  </SelectTrigger>
                  <SelectContent>
                    {planos
                      .filter((p) => p.id !== contrato?.plan_id)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — {BRL(p.monthly_price)}/mês
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {contrato && (
            <div>
              <Label className="mb-2 block">Preview do documento</Label>
              <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed max-h-[320px] overflow-auto">
                {conteudo}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  downloadContractDocx(
                    'Aditivo',
                    conteudo,
                    `aditivo-${(contrato.numero_contrato || 'contrato').toLowerCase()}.docx`,
                  )
                }
              >
                <Download className="w-4 h-4 mr-1" /> Baixar .docx
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={salvando || !contratoId} onClick={handleSalvar}>
              Salvar Aditivo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
