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
import { Trash, ArrowLeft, Plus, MessageCircle, Send } from 'lucide-react'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils'

const toTime = (dec: number) => {
  if (!dec) return '00:00'
  const h = Math.floor(dec)
  const m = Math.round((dec - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}
const toDec = (time: string) => {
  if (!time) return 0
  const [h, m] = time.split(':')
  return Number(h || 0) + Number(m || 0) / 60
}
const numClass =
  '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

export default function QuoteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [planoContas, setPlanoContas] = useState<any[]>([])
  const [data, setData] = useState({
    cliente_id: '',
    conta_id: '',
    numero_orcamento: '',
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

  const [productItems, setProductItems] = useState<any[]>([])
  const [serviceItems, setServiceItems] = useState<any[]>([])

  const [clients, setClients] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  const [installments, setInstallments] = useState<any[]>([])
  const [condParcelas, setCondParcelas] = useState<number | string>(1)
  const [condVencimento, setCondVencimento] = useState(new Date().toISOString().split('T')[0])
  const [condHoje, setCondHoje] = useState(false)

  const [newClientOpen, setNewClientOpen] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')

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
      .select('id, name, email, phone, cpf_cnpj, address')
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
      if (it) {
        setProductItems(it.filter((i) => i.tipo_item === 'produto').map((i) => ({ ...i })))
        setServiceItems(
          it
            .filter((i) => i.tipo_item === 'servico')
            .map((i) => ({
              ...i,
              tempo_estimado_str: toTime(i.tempo_estimado),
              tempo_executado_str: toTime(i.tempo_executado),
            })),
        )
      }

      const { data: fin } = await supabase
        .from('financial_charges' as any)
        .select('*')
        .eq('orcamento_id', id)
        .order('due_date', { ascending: true })
      if (fin) setInstallments(fin)
    }
  }

  const addProduct = () =>
    setProductItems([
      ...productItems,
      {
        tipo_item: 'produto',
        produto_id: '',
        quantidade: 1,
        valor_unitario: 0,
        valor_total: 0,
        descricao: '',
        aprovado: true,
      },
    ])
  const removeProduct = (idx: number) => setProductItems(productItems.filter((_, i) => i !== idx))

  const addService = () =>
    setServiceItems([
      ...serviceItems,
      {
        tipo_item: 'servico',
        servico_id: '',
        quantidade: 1,
        tempo_estimado: 0,
        tempo_estimado_str: '00:00',
        tempo_executado: 0,
        tempo_executado_str: '00:00',
        valor_unitario: 0,
        valor_total: 0,
        descricao: '',
        aprovado: true,
      },
    ])
  const removeService = (idx: number) => setServiceItems(serviceItems.filter((_, i) => i !== idx))

  const updateProduct = (idx: number, field: string, val: any) => {
    const newI = [...productItems]
    newI[idx][field] = val
    if (field === 'produto_id') {
      const p = products.find((p) => p.id === val)
      if (p) {
        newI[idx].valor_unitario = p.price || 0
        newI[idx].descricao = p.name
      }
    }
    const qtd = Number(newI[idx].quantidade) || 0
    const valUnit = Number(newI[idx].valor_unitario) || 0
    newI[idx].valor_total = Math.round(qtd * valUnit * 100) / 100
    setProductItems(newI)
  }

  const updateService = (idx: number, field: string, val: any) => {
    const newI = [...serviceItems]
    newI[idx][field] = val
    if (field === 'servico_id') {
      const s = services.find((s) => s.id === val)
      if (s) {
        newI[idx].valor_unitario = s.sale_value || 0
        newI[idx].descricao = s.title
        newI[idx].tempo_estimado_str = s.exec_time || '00:00'
        newI[idx].tempo_estimado = toDec(s.exec_time || '00:00')
      }
    }
    if (field === 'tempo_estimado_str') newI[idx].tempo_estimado = toDec(val)
    if (field === 'tempo_executado_str') newI[idx].tempo_executado = toDec(val)

    const qtd = Number(newI[idx].quantidade) || 0
    const valUnit = Number(newI[idx].valor_unitario) || 0
    const tempo = Number(newI[idx].tempo_executado) || 0
    newI[idx].valor_total = Math.round(tempo * valUnit * qtd * 100) / 100
    setServiceItems(newI)
  }

  const allItems = [...productItems, ...serviceItems]

  const subtotal =
    Math.round(
      allItems
        .filter((i) => i.aprovado !== false)
        .reduce((acc, i) => acc + Number(i.valor_total), 0) * 100,
    ) / 100
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
      return toast({ title: 'Já existem parcelas pagas.', variant: 'destructive' })

    const num = condParcelas || 1
    const val = total / Number(num)
    let start = condHoje ? new Date() : new Date(condVencimento || Date.now())
    const newInst = []
    for (let i = 0; i < Number(num); i++) {
      const d = new Date(start)
      d.setMonth(d.getMonth() + i)
      newInst.push({
        id: `temp_${Date.now()}_${i}`,
        description: Number(num) > 1 ? `Parcela ${i + 1}/${num}` : 'Pagamento Integral',
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

  const handleSave = async (statusToSave: string, preventNavigation = false) => {
    if (!data.cliente_id) {
      toast({ title: 'O cliente é obrigatório', variant: 'destructive' })
      return null
    }
    if (allItems.length === 0) {
      toast({ title: 'Adicione pelo menos 1 item', variant: 'destructive' })
      return null
    }

    const payload: any = { ...data, subtotal, total, status: statusToSave }
    if (!payload.conta_id) payload.conta_id = null
    payload.data_validade = payload.data_validade || null
    payload.data_emissao = payload.data_emissao || null

    if (!id && !payload.numero_orcamento) {
      payload.numero_orcamento = ''
    }

    try {
      let orcId = id
      let numOrc = data.numero_orcamento

      if (id) {
        await supabase.from('orcamentos').update(payload).eq('id', id)
        await supabase.from('orcamento_itens').delete().eq('orcamento_id', id)
      } else {
        const res = await supabase.from('orcamentos').insert(payload).select().single()
        if (res.error) throw res.error
        orcId = res.data?.id
        numOrc = res.data?.numero_orcamento
        setData((prev) => ({ ...prev, numero_orcamento: numOrc, status: statusToSave }))
        window.history.replaceState(null, '', `/admin/quotes/${orcId}/edit`)
      }

      if (orcId) {
        const itemsPayload = allItems.map((i) => {
          const { id: itemId, tempo_estimado_str, tempo_executado_str, ...cleanItem } = i
          return { ...cleanItem, orcamento_id: orcId }
        })
        await supabase.from('orcamento_itens').insert(itemsPayload)

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
          let finalDescription = inst.description
          const docNum = numOrc || 'A gerar'
          if (finalDescription.startsWith('OS ')) {
            finalDescription = finalDescription.replace(/OS [^-]+ - /, `OS ${docNum} - `)
          } else {
            finalDescription = `OS ${docNum} - ${finalDescription}`
          }

          const chargePayload = {
            orcamento_id: orcId,
            client_name: clientName,
            amount: inst.amount,
            due_date: inst.due_date,
            description: finalDescription,
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

      toast({ title: 'Ordem de Serviço salva com sucesso!' })
      if (!preventNavigation) {
        navigate('/admin/quotes')
      }
      return { id: orcId, numero_orcamento: numOrc }
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' })
      return null
    }
  }

  const handleQuickAddClient = async () => {
    if (!newClientName) return
    const { data: res, error } = await supabase
      .from('profiles')
      .insert([
        { name: newClientName, email: newClientEmail, phone: newClientPhone, is_client: true },
      ])
      .select()
      .single()
    if (res && !error) {
      setClients([...clients, res])
      setData({ ...data, cliente_id: res.id })
      setNewClientOpen(false)
      setNewClientName('')
      toast({ title: 'Cliente adicionado' })
    }
  }

  const handleQuickAddProduct = async () => {
    if (!newProduct.name) return
    const { data: res } = await supabase.from('products').insert([newProduct]).select().single()
    if (res) {
      setProducts([...products, res])
      setNewProductOpen(false)
      setNewProduct({ name: '', price: 0 })
      toast({ title: 'Produto adicionado' })
    }
  }

  const handleQuickAddService = async () => {
    if (!newService.title) return
    const { data: res } = await supabase
      .from('services' as any)
      .insert([newService])
      .select()
      .single()
    if (res) {
      setServices([...services, res])
      setNewServiceOpen(false)
      setNewService({ title: '', sale_value: 0 })
      toast({ title: 'Serviço adicionado' })
    }
  }

  const handleSendApproval = async () => {
    const result = await handleSave('aguardando aprovação', true)
    if (!result || !result.id) return
    const { id: savedId, numero_orcamento: savedNum } = result

    const client = clients.find((c) => c.id === data.cliente_id)
    if (!client) return toast({ title: 'Selecione um cliente', variant: 'destructive' })

    const link = `${window.location.origin}/quote/approval/${savedId}`

    toast({ title: 'Enviando link para o cliente...' })

    try {
      if (client.phone) {
        await supabase.functions.invoke('enviar_whatsapp', {
          body: {
            telefone_destino: client.phone.replace(/\D/g, ''),
            mensagem_customizada: `Olá ${client.name}, seu orçamento está pronto para aprovação. Acesse de forma segura o link: ${link}`,
          },
        })
      }

      if (client.email) {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'custom',
            email: client.email,
            subject: `Aprovação de Ordem de Serviço ${savedNum || savedId.slice(0, 6)}`,
            html: `<p>Olá <strong>${client.name}</strong>,</p><p>Seu orçamento está pronto. Acesse o portal abaixo para verificar os itens e realizar a aprovação online.</p><div style="text-align:center; margin-top:20px;"><a href="${link}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;">Acessar Portal de Aprovação</a></div>`,
          },
        })
      }

      toast({ title: 'Link enviado com sucesso!' })
      setData((prev) => ({ ...prev, status: 'aguardando aprovação' }))
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao notificar', variant: 'destructive' })
    }
  }

  const selectedClient = clients.find((c) => c.id === data.cliente_id)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/quotes')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {id ? `OS ${data.numero_orcamento}` : 'Nova Ordem de Serviço'}
          </h1>
        </div>
        <div className="flex gap-2">
          {id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/quote/approval/${id}`, '_blank')}
            >
              <Send className="w-4 h-4 mr-2 text-blue-600" /> Portal do Cliente
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="dados-cliente" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6 h-auto md:h-12 py-2 md:py-0">
          <TabsTrigger value="dados-cliente">1. Dados do Cliente</TabsTrigger>
          <TabsTrigger value="produtos">2. Peças</TabsTrigger>
          <TabsTrigger value="servicos">3. Serviços</TabsTrigger>
          <TabsTrigger value="aprovacao">4. Aprovação</TabsTrigger>
          <TabsTrigger value="faturamento">5. Fechamento</TabsTrigger>
        </TabsList>

        <TabsContent value="dados-cliente" className="space-y-6">
          <div className="bg-card p-6 rounded-xl border space-y-4 shadow-sm">
            <h3 className="font-semibold text-lg">Informações do Cliente</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Selecione o Cliente *</Label>
                <div className="flex gap-2">
                  <Select
                    value={data.cliente_id}
                    onValueChange={(v) => setData({ ...data, cliente_id: v })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Buscar cliente..." />
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
              {selectedClient && (
                <div className="p-4 bg-background border border-input rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <span className="font-medium ml-1">{selectedClient.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telefone:</span>{' '}
                    <span className="font-medium ml-1">{selectedClient.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Documento:</span>{' '}
                    <span className="font-medium ml-1">{selectedClient.cpf_cnpj || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Endereço:</span>{' '}
                    <span className="font-medium ml-1">{selectedClient.address || '-'}</span>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3 mt-4">
                <div className="space-y-2">
                  <Label>Número da OS</Label>
                  <Input
                    disabled
                    value={id ? data.numero_orcamento : 'Automático (AAAAMMDD-SEQ)'}
                    className="bg-muted text-muted-foreground font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Emissão</Label>
                  <Input
                    type="date"
                    value={data.data_emissao || ''}
                    onChange={(e) => setData({ ...data, data_emissao: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Validade</Label>
                  <Input
                    type="date"
                    value={data.data_validade || ''}
                    onChange={(e) => setData({ ...data, data_validade: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border space-y-4 shadow-sm">
            <h3 className="font-semibold text-lg">Veículo / Equipamento</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Placa / Série</Label>
                <Input
                  placeholder="Ex: ABC1D23"
                  value={data.veiculo_placa || ''}
                  onChange={(e) => setData({ ...data, veiculo_placa: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo / Descrição</Label>
                <Input
                  placeholder="Ex: Hyundai HB20"
                  value={data.veiculo_modelo || ''}
                  onChange={(e) => setData({ ...data, veiculo_modelo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>KM / Horímetro</Label>
                <Input
                  type="number"
                  className={numClass}
                  min="0"
                  step="1"
                  placeholder="Ex: 45000"
                  value={data.veiculo_km || ''}
                  onChange={(e) => setData({ ...data, veiculo_km: e.target.value })}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="produtos" className="space-y-4 bg-card p-6 border rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-primary">Peças e Materiais</h3>
            <Button onClick={addProduct} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Adicionar Peça
            </Button>
          </div>
          <div className="space-y-4">
            {productItems.map((it, idx) => (
              <div
                key={idx}
                className={`flex flex-col md:flex-row gap-4 items-end bg-background p-4 rounded-lg border border-border transition-opacity ${!it.aprovado ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="flex-1 w-full space-y-2">
                  <div className="flex justify-between items-center h-5">
                    <Label>Produto</Label>
                    {!it.aprovado && (
                      <span className="text-xs text-destructive font-bold bg-destructive/10 px-2 rounded">
                        Rejeitado
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={it.produto_id || ''}
                      onValueChange={(v) => updateProduct(idx, 'produto_id', v)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setNewProductOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="w-full md:w-24 space-y-2">
                  <Label>Qtd</Label>
                  <Input
                    type="number"
                    className={numClass}
                    min="0.01"
                    step="0.01"
                    value={it.quantidade || ''}
                    onChange={(e) => updateProduct(idx, 'quantidade', e.target.value)}
                  />
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <Label>Valor Unit.</Label>
                  <Input
                    value={formatCurrencyInput(it.valor_unitario)}
                    onChange={(e) =>
                      updateProduct(idx, 'valor_unitario', parseCurrencyInput(e.target.value))
                    }
                  />
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <Label>Total</Label>
                  <Input
                    readOnly
                    value={formatCurrencyInput(it.valor_total)}
                    className="bg-muted font-medium"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProduct(idx)}
                  className="h-10 w-10 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash className="w-4 h-4" />
                </Button>{' '}
              </div>
            ))}
            {productItems.length === 0 && (
              <p className="text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg">
                Nenhuma peça adicionada a esta Ordem de Serviço.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="servicos" className="space-y-4 bg-card p-6 border rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-primary">Mão de Obra / Serviços</h3>
            <Button onClick={addService} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Adicionar Serviço
            </Button>
          </div>
          <div className="space-y-4">
            {serviceItems.map((it, idx) => (
              <div
                key={idx}
                className={`flex flex-col md:flex-row gap-4 items-end bg-background p-4 rounded-lg border border-border transition-opacity ${!it.aprovado ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="flex-1 w-full space-y-2">
                  <div className="flex justify-between items-center h-5">
                    <Label>Serviço</Label>
                    {!it.aprovado && (
                      <span className="text-xs text-destructive font-bold bg-destructive/10 px-2 rounded">
                        Rejeitado
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={it.servico_id || ''}
                      onValueChange={(v) => updateService(idx, 'servico_id', v)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setNewServiceOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="w-full md:w-24 space-y-2">
                  <Label>T. Padrão</Label>
                  <Input
                    type="time"
                    value={it.tempo_estimado_str || ''}
                    onChange={(e) => updateService(idx, 'tempo_estimado_str', e.target.value)}
                  />
                </div>
                <div className="w-full md:w-24 space-y-2">
                  <Label>T. Executado</Label>
                  <Input
                    type="time"
                    value={it.tempo_executado_str || ''}
                    onChange={(e) => updateService(idx, 'tempo_executado_str', e.target.value)}
                  />
                </div>
                <div className="w-full md:w-20 space-y-2">
                  <Label>Qtd</Label>
                  <Input
                    type="number"
                    className={numClass}
                    min="1"
                    step="1"
                    value={it.quantidade || ''}
                    onChange={(e) => updateService(idx, 'quantidade', e.target.value)}
                  />
                </div>
                <div className="w-full md:w-28 space-y-2">
                  <Label>Valor Hora/Un</Label>
                  <Input
                    value={formatCurrencyInput(it.valor_unitario)}
                    onChange={(e) =>
                      updateService(idx, 'valor_unitario', parseCurrencyInput(e.target.value))
                    }
                  />
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <Label>Total</Label>
                  <Input
                    readOnly
                    value={formatCurrencyInput(it.valor_total)}
                    className="bg-muted font-medium"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeService(idx)}
                  className="h-10 w-10 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash className="w-4 h-4" />
                </Button>{' '}
              </div>
            ))}
            {serviceItems.length === 0 && (
              <p className="text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg">
                Nenhum serviço adicionado a esta Ordem de Serviço.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="aprovacao"
          className="space-y-6 bg-card p-6 border rounded-xl shadow-sm"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="font-semibold text-lg text-primary">Resumo e Aprovação</h3>
            <div className="flex gap-3 items-center w-full md:w-auto">
              <Label className="whitespace-nowrap text-muted-foreground">Status da OS:</Label>
              <Select value={data.status} onValueChange={(v) => setData({ ...data, status: v })}>
                <SelectTrigger className="w-full md:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="aguardando aprovação">Aguardando Aprovação</SelectItem>
                  <SelectItem value="aprovado">Aprovado pelo Cliente</SelectItem>
                  <SelectItem value="pré-fechada">OS Pré-fechada</SelectItem>
                  <SelectItem value="fechado">OS Fechada</SelectItem>
                  <SelectItem value="rejeitado">OS Rejeitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Subtotal Itens Aprovados</Label>
              <Input
                readOnly
                value={formatCurrencyInput(subtotal)}
                className="bg-muted text-lg font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label>Desconto (%)</Label>
              <Input
                className={numClass}
                value={formatCurrencyInput(data.desconto_percentual)}
                onChange={(e) =>
                  setData({ ...data, desconto_percentual: parseCurrencyInput(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Desconto (R$)</Label>
              <Input
                className={numClass}
                value={formatCurrencyInput(data.desconto_valor)}
                onChange={(e) =>
                  setData({ ...data, desconto_valor: parseCurrencyInput(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Impostos / Frete (R$)</Label>
              <Input
                className={numClass}
                value={formatCurrencyInput(data.valor_impostos)}
                onChange={(e) =>
                  setData({ ...data, valor_impostos: parseCurrencyInput(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="bg-primary/10 p-6 rounded-xl flex justify-between items-center border border-primary/20 mt-4">
            <span className="text-xl font-medium text-primary">Total da Ordem de Serviço</span>
            <span className="text-4xl font-bold text-primary">R$ {formatCurrencyInput(total)}</span>
          </div>

          <div className="flex justify-end pt-6">
            <Button onClick={handleSendApproval} size="lg" className="w-full md:w-auto">
              <MessageCircle className="w-5 h-5 mr-2" /> Enviar Link de Aprovação
            </Button>
          </div>
        </TabsContent>

        <TabsContent
          value="faturamento"
          className="space-y-6 bg-card p-6 border rounded-xl shadow-sm"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="font-semibold text-lg text-primary">Fechamento Financeiro</h3>
            <div className="space-y-2 w-full md:w-72">
              <Label>Conta Destino / DRE</Label>
              <Select
                value={data.conta_id || ''}
                onValueChange={(v) => setData({ ...data, conta_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta de receita" />
                </SelectTrigger>
                <SelectContent>
                  {planoContas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.codigo_estrutural} - {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4 items-end bg-background p-5 rounded-xl border border-border">
            <div className="space-y-2">
              <Label>Número de Parcelas</Label>
              <Input
                type="number"
                className={numClass}
                min="1"
                step="1"
                value={condParcelas}
                onChange={(e) =>
                  setCondParcelas(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                }
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
            <div className="flex items-center space-x-2 pb-3 pl-2">
              <Checkbox
                id="condHojeQuote"
                checked={condHoje}
                onCheckedChange={(c) => setCondHoje(!!c)}
              />
              <Label htmlFor="condHojeQuote" className="font-medium cursor-pointer text-foreground">
                Pagar entrada hoje?
              </Label>
            </div>
            <Button type="button" onClick={generateInstallments} className="w-full">
              Gerar Fluxo
            </Button>
          </div>

          {installments.length > 0 && (
            <div className="space-y-3 mt-4">
              <h4 className="font-medium text-foreground pb-2">Previsão de Recebimento</h4>
              {installments.map((inst, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row gap-3 items-end md:items-center bg-background p-4 rounded-lg border border-border shadow-sm"
                >
                  <div className="w-full md:w-32">
                    <Label className="text-xs text-muted-foreground">Nº da OS</Label>
                    <Input
                      readOnly
                      value={data.numero_orcamento || 'A gerar'}
                      className="bg-muted font-medium"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <Label className="text-xs text-muted-foreground">Descrição da Parcela</Label>
                    <Input
                      value={inst.description}
                      onChange={(e) => {
                        const newI = [...installments]
                        newI[idx].description = e.target.value
                        setInstallments(newI)
                      }}
                    />
                  </div>
                  <div className="w-full md:w-36">
                    <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                    <Input
                      className={numClass}
                      value={formatCurrencyInput(inst.amount)}
                      onChange={(e) => {
                        const newI = [...installments]
                        newI[idx].amount = parseCurrencyInput(e.target.value)
                        setInstallments(newI)
                      }}
                    />
                  </div>
                  <div className="w-full md:w-44">
                    <Label className="text-xs text-muted-foreground">Data de Vencimento</Label>
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
                  <div className="w-full md:w-40">
                    <Label className="text-xs text-muted-foreground">Situação</Label>
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
                        <SelectItem value="pago">Recebido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full md:w-auto flex justify-end md:mt-5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setInstallments(installments.filter((_, i) => i !== idx))}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 mt-6">
            <Label className="font-semibold">Anotações Internas e Termos da OS</Label>
            <Textarea
              className="resize-y min-h-[100px]"
              value={data.observacoes}
              onChange={(e) => setData({ ...data, observacoes: e.target.value })}
              placeholder="Descreva aqui garantias, defeitos relatados pelo cliente, acordos verbais..."
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 mt-8 border-t pt-6">
        <Button variant="outline" size="lg" onClick={() => navigate('/admin/quotes')}>
          Cancelar
        </Button>
        <Button variant="secondary" size="lg" onClick={() => handleSave(data.status)}>
          Salvar OS Atual
        </Button>
        <Button size="lg" onClick={() => handleSave('fechado')} className="px-8">
          Finalizar e Fechar OS
        </Button>
      </div>

      <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome Completo / Razão Social</Label>
              <Input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setNewClientOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleQuickAddClient}>Salvar Cliente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Peça ou Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome ou Descrição da Peça</Label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Preço de Venda Padrão</Label>
              <Input
                type="number"
                className={numClass}
                value={newProduct.price || ''}
                onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setNewProductOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleQuickAddProduct}>Adicionar ao Catálogo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newServiceOpen} onOpenChange={setNewServiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Tipo de Serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Título / Descrição do Serviço</Label>
              <Input
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Sugerido (Un/Hora)</Label>
              <Input
                type="number"
                className={numClass}
                value={newService.sale_value || ''}
                onChange={(e) =>
                  setNewService({ ...newService, sale_value: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setNewServiceOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleQuickAddService}>Adicionar Serviço</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
