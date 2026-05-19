import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Trash, ArrowLeft, Plus, MessageCircle, Printer, QrCode } from 'lucide-react'
import { decimalToTime, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils'
import { generateTermsPDF } from '@/lib/pdf-utils'

export default function QuoteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [planoContas, setPlanoContas] = useState<any[]>([])
  const [data, setData] = useState({
    cliente_id: '',
    conta_id: '',
    data_emissao: new Date().toISOString().split('T')[0],
    data_validade: '',
    status: 'rascunho',
    observacoes: '',
    desconto_percentual: 0,
    desconto_valor: 0,
    valor_impostos: 0,
    veiculo_placa: '',
    veiculo_modelo: '',
    veiculo_km: '',
  })
  const [items, setItems] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  // Financeiro / Parcelas
  const [installments, setInstallments] = useState<any[]>([])
  const [condParcelas, setCondParcelas] = useState(1)
  const [condVencimento, setCondVencimento] = useState(new Date().toISOString().split('T')[0])
  const [condHoje, setCondHoje] = useState(false)

  // Quick Add States
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newContaOpen, setNewContaOpen] = useState(false)
  const [newConta, setNewConta] = useState({ nome: '', codigo_estrutural: '', natureza: 'receita' })

  const [newProductOpen, setNewProductOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', price: 0 })
  const [newServiceOpen, setNewServiceOpen] = useState(false)
  const [newService, setNewService] = useState({ title: '', sale_value: 0 })

  useEffect(() => {
    supabase
      .from('plano_contas')
      .select('id, codigo_estrutural, nome')
      .order('codigo_estrutural')
      .then((res) => setPlanoContas(res.data || []))
    supabase
      .from('profiles')
      .select('id, name')
      .eq('is_client', true)
      .order('name')
      .then((res) => setClients(res.data || []))
    supabase
      .from('products')
      .select('id, name, price')
      .then((res) => setProducts(res.data || []))
    supabase
      .from('services' as any)
      .select('id, title, sale_value, exec_time')
      .then((res) => setServices(res.data || []))
    if (id) loadQuote()
  }, [id])

  const loadQuote = async () => {
    const { data: q } = await supabase.from('orcamentos').select('*').eq('id', id).single()
    if (q) {
      setData(q)
      const { data: it } = await supabase.from('orcamento_itens').select('*').eq('orcamento_id', id)
      setItems(
        it?.map((item) => ({ ...item, tempo_estimado_str: decimalToTime(item.tempo_estimado) })) ||
          [],
      )

      const { data: fin } = await supabase
        .from('financial_charges' as any)
        .select('*')
        .eq('orcamento_id', id)
        .order('due_date', { ascending: true })
      if (fin) setInstallments(fin)
    }
  }

  const addItem = () =>
    setItems([
      ...items,
      {
        tipo_item: 'produto',
        produto_id: '',
        servico_id: '',
        quantidade: 1,
        tempo_estimado: 0,
        tempo_estimado_str: '',
        valor_unitario: 0,
        valor_total: 0,
        descricao: '',
      },
    ])
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))

  const updateItem = (idx: number, field: string, val: any) => {
    const newItems = [...items]
    newItems[idx][field] = val

    if (field === 'tipo_item') {
      newItems[idx].produto_id = null
      newItems[idx].servico_id = null
      newItems[idx].valor_unitario = 0
      newItems[idx].quantidade = 1
      newItems[idx].tempo_estimado = 0
      newItems[idx].tempo_estimado_str = ''
      newItems[idx].descricao = ''
    }

    if (field === 'produto_id' && newItems[idx].tipo_item === 'produto') {
      const p = products.find((p) => p.id === val)
      if (p) {
        newItems[idx].valor_unitario = p.price || 0
        newItems[idx].descricao = p.name
      }
    }

    if (field === 'servico_id' && newItems[idx].tipo_item === 'servico') {
      const s = services.find((s) => s.id === val)
      if (s) {
        newItems[idx].valor_unitario = s.sale_value || 0
        newItems[idx].descricao = s.title
        const execTime = s.exec_time || '00:00'
        newItems[idx].tempo_estimado_str = execTime
        const [h, m] = execTime.split(':')
        newItems[idx].tempo_estimado = Number(h || 0) + Number(m || 0) / 60
      }
    }

    if (field === 'tempo_estimado_str') {
      const [h, m] = (val || '00:00').split(':')
      newItems[idx].tempo_estimado = Number(h || 0) + Number(m || 0) / 60
    }

    const qtd = Number(newItems[idx].quantidade) || 0
    const valUnit = Number(newItems[idx].valor_unitario) || 0

    if (newItems[idx].tipo_item === 'servico') {
      const tempo = Number(newItems[idx].tempo_estimado) || 0
      newItems[idx].valor_total = Math.round(tempo * valUnit * qtd * 100) / 100
    } else {
      newItems[idx].valor_total = Math.round(qtd * valUnit * 100) / 100
    }
    setItems(newItems)
  }

  const subtotal = Math.round(items.reduce((acc, i) => acc + Number(i.valor_total), 0) * 100) / 100
  const total = Math.max(
    0,
    Math.round(
      (subtotal -
        (Number(data.desconto_valor) || 0) -
        (subtotal * (Number(data.desconto_percentual) || 0)) / 100 +
        (Number(data.valor_impostos) || 0)) *
        100,
    ) / 100,
  )

  const generateInstallments = () => {
    if (total <= 0) return toast({ title: 'Valor total inválido.', variant: 'destructive' })
    if (installments.some((i) => i.status === 'pago'))
      return toast({
        title: 'Já existem parcelas pagas, não é possível re-gerar.',
        variant: 'destructive',
      })

    const num = condParcelas || 1
    const val = total / num
    let start = condHoje ? new Date() : new Date(condVencimento || Date.now())
    const newInst = []
    for (let i = 0; i < num; i++) {
      const d = new Date(start)
      d.setMonth(d.getMonth() + i)
      newInst.push({
        id: `temp_${Date.now()}_${i}`,
        description: num > 1 ? `Parcela ${i + 1}/${num}` : 'Pagamento Integral',
        amount: val,
        due_date: d.toISOString().split('T')[0],
        status: 'pendente',
        parcela_numero: i + 1,
        parcela_total: num,
      })
    }
    setInstallments(newInst)
    toast({ title: 'Parcelas geradas!' })
  }

  const handleSave = async (status: string) => {
    if (!data.cliente_id) return toast({ title: 'O cliente é obrigatório', variant: 'destructive' })
    if (items.length === 0)
      return toast({ title: 'Adicione pelo menos 1 item', variant: 'destructive' })

    for (const item of items) {
      if (item.tipo_item === 'servico' && (!item.tempo_estimado || item.tempo_estimado <= 0)) {
        return toast({
          title: 'Tempo de execução inválido (00:00) para o serviço.',
          variant: 'destructive',
        })
      }
      if (item.tipo_item === 'produto' && (!item.quantidade || item.quantidade <= 0)) {
        return toast({ title: 'Quantidade inválida para o produto.', variant: 'destructive' })
      }
    }

    const payload: any = { ...data, subtotal, total, status }
    if (!payload.conta_id) payload.conta_id = null

    try {
      let orcId = id
      if (id) {
        await supabase.from('orcamentos').update(payload).eq('id', id)
        await supabase.from('orcamento_itens').delete().eq('orcamento_id', id)
      } else {
        const res = await supabase.from('orcamentos').insert(payload).select().single()
        if (res.error) throw res.error
        orcId = res.data?.id
      }

      if (orcId) {
        const itemsPayload = items.map((i) => {
          const { id, tempo_estimado_str, ...cleanItem } = i
          return { ...cleanItem, orcamento_id: orcId }
        })
        await supabase.from('orcamento_itens').insert(itemsPayload)

        // Save Installments
        const currentIds = installments.filter((i) => !i.id.startsWith('temp_')).map((i) => i.id)
        if (currentIds.length > 0) {
          await supabase
            .from('financial_charges' as any)
            .delete()
            .eq('orcamento_id', orcId)
            .eq('status', 'pendente')
            .not('id', 'in', `(${currentIds.join(',')})`)
        } else {
          await supabase
            .from('financial_charges' as any)
            .delete()
            .eq('orcamento_id', orcId)
            .eq('status', 'pendente')
        }

        const clientName = clients.find((c) => c.id === data.cliente_id)?.name || 'Cliente'

        for (const inst of installments) {
          const chargePayload = {
            orcamento_id: orcId,
            client_name: clientName,
            amount: inst.amount,
            due_date: inst.due_date,
            description: `Orçamento ${orcId.slice(0, 6)} - ${inst.description}`,
            status: inst.status || 'pendente',
            type: 'receivable',
            category: 'orcamento',
            conta_id: data.conta_id || null,
            parcela_numero: inst.parcela_numero || 1,
            parcela_total: inst.parcela_total || 1,
          }

          if (inst.id && !inst.id.startsWith('temp_')) {
            await supabase
              .from('financial_charges' as any)
              .update(chargePayload)
              .eq('id', inst.id)
          } else {
            await supabase.from('financial_charges' as any).insert(chargePayload)
          }
        }
      }

      toast({ title: 'Orçamento salvo com sucesso!' })
      navigate('/admin/quotes')
    } catch (e: any) {
      toast({ title: 'Erro ao salvar orçamento', description: e.message, variant: 'destructive' })
    }
  }

  const handleQuickAddClient = async () => {
    if (!newClientName) return
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ name: newClientName, is_client: true }])
      .select()
      .single()
    if (data && !error) {
      setClients([...clients, data])
      setData({ ...data, cliente_id: data.id })
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
      setData({ ...data, conta_id: data.id })
      setNewContaOpen(false)
      setNewConta({ nome: '', codigo_estrutural: '', natureza: 'receita' })
      toast({ title: 'Conta financeira adicionada' })
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => navigate('/admin/quotes')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {id ? 'Editar Orçamento' : 'Novo Orçamento'}
        </h1>
      </div>

      <Tabs defaultValue="identificacao" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="identificacao">Identificação</TabsTrigger>
          <TabsTrigger value="itens">Itens e Serviços</TabsTrigger>
          <TabsTrigger value="fechamento">Fechamento</TabsTrigger>
          <TabsTrigger value="financeiro">Forma de Pagamento</TabsTrigger>
        </TabsList>

        <TabsContent value="identificacao" className="space-y-6">
          <div className="bg-card p-6 rounded-xl border space-y-4 shadow-sm">
            <h3 className="font-semibold text-lg">Dados Básicos</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <div className="flex gap-2">
                  <Select
                    value={data.cliente_id}
                    onValueChange={(v) => setData({ ...data, cliente_id: v })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name || 'Sem Nome'}
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
                <Label>Conta Financeira (DRE)</Label>
                <div className="flex gap-2">
                  <Select
                    value={data.conta_id || ''}
                    onValueChange={(v) => setData({ ...data, conta_id: v })}
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
              <div className="space-y-2">
                <Label>Data de Emissão</Label>
                <Input
                  type="date"
                  value={data.data_emissao}
                  onChange={(e) => setData({ ...data, data_emissao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Validade</Label>
                <Input
                  type="date"
                  value={data.data_validade}
                  onChange={(e) => setData({ ...data, data_validade: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border space-y-4 shadow-sm">
            <h3 className="font-semibold text-lg">Dados do Veículo (Opcional)</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Placa</Label>
                <Input
                  placeholder="Ex: ABC1D23"
                  value={data.veiculo_placa || ''}
                  onChange={(e) => setData({ ...data, veiculo_placa: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input
                  placeholder="Ex: Hyundai HB20"
                  value={data.veiculo_modelo || ''}
                  onChange={(e) => setData({ ...data, veiculo_modelo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Quilometragem (KM)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 45000"
                  value={data.veiculo_km || ''}
                  onChange={(e) => setData({ ...data, veiculo_km: e.target.value })}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="itens" className="space-y-4 bg-card p-6 border rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Lista de Itens</h3>
            <Button onClick={addItem} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Adicionar Item
            </Button>
          </div>
          <div className="space-y-4">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row gap-4 items-end bg-muted/30 p-4 rounded-lg border"
              >
                <div className="w-full md:w-32 space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={it.tipo_item || 'produto'}
                    onValueChange={(v) => updateItem(idx, 'tipo_item', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="produto">Produto</SelectItem>
                      <SelectItem value="servico">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 w-full space-y-2">
                  <Label>{it.tipo_item === 'servico' ? 'Serviço' : 'Produto'}</Label>
                  <div className="flex gap-2">
                    <Select
                      value={it.tipo_item === 'servico' ? it.servico_id || '' : it.produto_id || ''}
                      onValueChange={(v) =>
                        updateItem(idx, it.tipo_item === 'servico' ? 'servico_id' : 'produto_id', v)
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {it.tipo_item === 'servico'
                          ? services.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.title}
                              </SelectItem>
                            ))
                          : products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {it.tipo_item === 'servico' && (
                  <div className="w-full md:w-24 space-y-2">
                    <Label>Tempo (hh:mm)</Label>
                    <Input
                      type="time"
                      value={it.tempo_estimado_str || ''}
                      onChange={(e) => updateItem(idx, 'tempo_estimado_str', e.target.value)}
                    />
                  </div>
                )}
                <div className="w-full md:w-20 space-y-2">
                  <Label>Qtd</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={it.quantidade || 1}
                    onChange={(e) => updateItem(idx, 'quantidade', e.target.value)}
                  />
                </div>
                <div className="w-full md:w-28 space-y-2">
                  <Label>Valor Unit.</Label>
                  <Input
                    value={formatCurrencyInput(it.valor_unitario)}
                    onChange={(e) =>
                      updateItem(idx, 'valor_unitario', parseCurrencyInput(e.target.value))
                    }
                  />
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <Label>Total</Label>
                  <Input
                    readOnly
                    value={formatCurrencyInput(it.valor_total)}
                    className="bg-muted"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(idx)}
                  className="h-10 w-10 shrink-0"
                >
                  <Trash className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-muted-foreground text-center py-4">Nenhum item adicionado.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="fechamento"
          className="space-y-6 bg-card p-6 border rounded-xl shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Subtotal (R$)</Label>
              <Input readOnly value={formatCurrencyInput(subtotal)} className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Desconto (%)</Label>
              <Input
                value={formatCurrencyInput(data.desconto_percentual)}
                onChange={(e) =>
                  setData({ ...data, desconto_percentual: parseCurrencyInput(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Desconto (R$)</Label>
              <Input
                value={formatCurrencyInput(data.desconto_valor)}
                onChange={(e) =>
                  setData({ ...data, desconto_valor: parseCurrencyInput(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Impostos (R$)</Label>
              <Input
                value={formatCurrencyInput(data.valor_impostos)}
                onChange={(e) =>
                  setData({ ...data, valor_impostos: parseCurrencyInput(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="bg-primary/10 p-4 rounded-lg flex justify-between items-center">
            <span className="text-lg font-medium text-primary">Total Final</span>
            <span className="text-2xl font-bold text-primary">R$ {formatCurrencyInput(total)}</span>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              rows={4}
              value={data.observacoes}
              onChange={(e) => setData({ ...data, observacoes: e.target.value })}
              placeholder="Termos adicionais..."
            />
          </div>
        </TabsContent>

        <TabsContent
          value="financeiro"
          className="space-y-6 bg-card p-6 border rounded-xl shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-4 items-end bg-muted/20 p-4 rounded-lg border">
            <div className="space-y-2">
              <Label>Número de Parcelas</Label>
              <Input
                type="number"
                min="1"
                value={condParcelas}
                onChange={(e) => setCondParcelas(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Data do 1º Vencimento</Label>
              <Input
                type="date"
                value={condVencimento}
                onChange={(e) => setCondVencimento(e.target.value)}
                disabled={condHoje}
              />
            </div>
            <div className="flex items-center space-x-2 pb-3">
              <Checkbox
                id="condHojeQuote"
                checked={condHoje}
                onCheckedChange={(c) => setCondHoje(!!c)}
              />
              <Label htmlFor="condHojeQuote" className="font-normal">
                Pgto 1ª Parcela Hoje?
              </Label>
            </div>
            <Button type="button" onClick={generateInstallments} className="w-full">
              Gerar Parcelas
            </Button>
          </div>

          {installments.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">
                Parcelas Geradas (Fluxo de Caixa)
              </h4>
              {installments.map((inst, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 items-center bg-background p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Descrição</Label>
                    <Input
                      value={inst.description}
                      onChange={(e) => {
                        const newI = [...installments]
                        newI[idx].description = e.target.value
                        setInstallments(newI)
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                    <Input
                      value={formatCurrencyInput(inst.amount)}
                      onChange={(e) => {
                        const newI = [...installments]
                        newI[idx].amount = parseCurrencyInput(e.target.value)
                        setInstallments(newI)
                      }}
                    />
                  </div>
                  <div className="w-40">
                    <Label className="text-xs text-muted-foreground">Vencimento</Label>
                    <Input
                      type="date"
                      value={inst.due_date}
                      onChange={(e) => {
                        const newI = [...installments]
                        newI[idx].due_date = e.target.value
                        setInstallments(newI)
                      }}
                    />
                  </div>
                  <div className="w-36">
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Select
                      value={inst.status}
                      onValueChange={(v) => {
                        const newI = [...installments]
                        newI[idx].status = v
                        setInstallments(newI)
                      }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex mt-5">
                    {inst.id && !inst.id.startsWith('temp_') && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="PIX"
                          onClick={() =>
                            toast({ title: 'Vá para o Fluxo de Caixa para gerar PIX' })
                          }
                        >
                          <QrCode className="w-4 h-4 text-emerald-600" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="WhatsApp"
                          onClick={() =>
                            window.open(
                              `https://wa.me/?text=Olá! Segue cobrança da ${inst.description}. Valor: R$ ${inst.amount}. Vencimento: ${new Date(inst.due_date).toLocaleDateString('pt-BR')}`,
                              '_blank',
                            )
                          }
                        >
                          <MessageCircle className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Imprimir"
                          onClick={() =>
                            generateTermsPDF(
                              `Cobrança - ${inst.description}`,
                              `Valor: R$ ${inst.amount}\nVencimento: ${new Date(inst.due_date).toLocaleDateString('pt-BR')}`,
                            )
                          }
                        >
                          <Printer className="w-4 h-4 text-blue-500" />
                        </Button>
                      </>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setInstallments(installments.filter((_, i) => i !== idx))}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 mt-6 border-t pt-6">
        <Button variant="outline" onClick={() => navigate('/admin/quotes')}>
          Cancelar
        </Button>
        <Button variant="secondary" onClick={() => handleSave('rascunho')}>
          Salvar Rascunho
        </Button>
        <Button onClick={() => handleSave('enviado')}>Salvar Orçamento</Button>
      </div>

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
                placeholder="Ex: 1.01"
                value={newConta.codigo_estrutural}
                onChange={(e) => setNewConta({ ...newConta, codigo_estrutural: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome da Conta</Label>
              <Input
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
    </div>
  )
}
