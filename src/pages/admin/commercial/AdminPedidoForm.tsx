import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { toast } from '@/hooks/use-toast'
import { Trash, ArrowLeft, Plus } from 'lucide-react'
import { decimalToTime, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils'

export default function AdminPedidoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [clientes, setClientes] = useState<any[]>([])
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [servicos, setServicos] = useState<any[]>([])
  const [planoContas, setPlanoContas] = useState<any[]>([])

  const [formData, setFormData] = useState({
    cliente_id: '',
    orcamento_id: '',
    conta_id: '',
    data_pedido: new Date().toISOString().split('T')[0],
    data_entrega_prevista: '',
    forma_pagamento: 'pix',
    observacoes: '',
    veiculo_placa: '',
    veiculo_brand_id: '',
    veiculo_model_id: '',
    veiculo_km: '',
  })

  const [brands, setBrands] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [itens, setItems] = useState<any[]>([])

  // Quick Add States
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    cpf_cnpj: '',
    rg: '',
    autoriza_whatsapp: false,
    birth_date: '',
    gender: '',
    address: '',
    nationality: '',
    naturalness: '',
    observacoes: '',
  })
  const [newProductOpen, setNewProductOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    subcategory: '',
    price: 0,
    stock: 0,
    dimensions: '',
    description: '',
  })
  const [newServiceOpen, setNewServiceOpen] = useState(false)
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    cost_value: 0,
    sale_value: 0,
    exec_time: '00:00:00',
    margin_time: 0,
    add_time: '00:00:00',
  })
  const [newContaOpen, setNewContaOpen] = useState(false)
  const [newConta, setNewConta] = useState({ nome: '', codigo_estrutural: '', natureza: 'receita' })

  const numClass =
    '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

  useEffect(() => {
    supabase
      .from('vehicle_brands')
      .select('*')
      .order('name')
      .then(({ data }) => setBrands(data || []))

    supabase
      .from('plano_contas')
      .select('id, codigo_estrutural, nome')
      .order('codigo_estrutural')
      .then(({ data }) => setPlanoContas(data || []))
    supabase
      .from('profiles')
      .select('id, name as nome')
      .eq('is_client', true)
      .order('name')
      .then(({ data }) => setClientes(data || []))
    supabase
      .from('orcamentos')
      .select('id, numero_orcamento')
      .eq('status', 'aprovado')
      .then(({ data }) => setOrcamentos(data || []))
    supabase
      .from('products')
      .select('id, name, price, stock')
      .then(({ data }) => setProdutos(data || []))
    supabase
      .from('services' as any)
      .select('id, title, sale_value, exec_time')
      .then(({ data }) => setServicos(data || []))

    if (id) {
      supabase
        .from('pedidos')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) setFormData({ ...data })
        })
      supabase
        .from('pedido_itens')
        .select('*')
        .eq('pedido_id', id)
        .then(({ data }) => {
          if (data)
            setItems(
              data.map((item: any) => ({
                ...item,
                tempo_estimado_str: decimalToTime(item.tempo_estimado),
              })),
            )
        })
    }
  }, [id])

  useEffect(() => {
    if (formData.veiculo_brand_id) {
      supabase
        .from('vehicle_models')
        .select('*')
        .eq('brand_id', formData.veiculo_brand_id)
        .order('name')
        .then(({ data }) => setModels(data || []))
    } else {
      setModels([])
    }
  }, [formData.veiculo_brand_id])

  const validateVehicle = () => {
    if (!formData.veiculo_placa) return 'Placa do veículo é obrigatória'
    if (!formData.veiculo_brand_id) return 'Marca do veículo é obrigatória'
    if (!formData.veiculo_model_id) return 'Modelo do veículo é obrigatório'
    if (!formData.veiculo_km) return 'KM/Horímetro é obrigatório'

    const p = formData.veiculo_placa.toUpperCase().replace(/[^A-Z0-9]/g, '')
    const isStandardMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(p)
    const isStandardOld = /^[A-Z]{3}[0-9]{4}$/.test(p)
    const isUserMercosulLiteral = /^[A-Z][0-9]{4}[A-Z]{2}$/.test(p)
    const isUserMercosulExample = /^[A-Z][0-9][A-Z][0-9][A-Z][0-9]{2}$/.test(p)
    const isUserOldLiteral = /^[A-Z]{2}[0-9]{4}[A-Z]{2}$/.test(p)

    if (
      !isStandardMercosul &&
      !isStandardOld &&
      !isUserMercosulLiteral &&
      !isUserMercosulExample &&
      !isUserOldLiteral
    ) {
      return 'Formato de placa inválido. Padrões aceitos: Mercosul (ABC1D23), Antiga (ABC1234), ou formatos especiais (A1B2C34, AB1234CD).'
    }

    return null
  }

  const handleOrcamentoSelect = async (orcId: string) => {
    setFormData({ ...formData, orcamento_id: orcId })
    const { data: orc } = await supabase.from('orcamentos').select('*').eq('id', orcId).single()
    if (orc)
      setFormData((p) => ({
        ...p,
        cliente_id: orc.cliente_id,
        veiculo_placa: orc.veiculo_placa || '',
        veiculo_brand_id: orc.veiculo_brand_id || '',
        veiculo_model_id: orc.veiculo_model_id || '',
        veiculo_km: orc.veiculo_km || '',
      }))
    const { data: oItems } = await supabase
      .from('orcamento_itens')
      .select('*')
      .eq('orcamento_id', orcId)
    if (oItems)
      setItems(
        oItems.map((i) => ({
          ...i,
          id: undefined,
          pedido_id: undefined,
          tempo_estimado_str: decimalToTime(i.tempo_estimado),
        })),
      )
  }

  const addItem = () =>
    setItems([
      ...itens,
      {
        tipo_item: 'produto',
        produto_id: null,
        servico_id: null,
        quantidade: 1,
        tempo_estimado: 0,
        tempo_estimado_str: '',
        valor_unitario: 0,
        valor_total: 0,
      },
    ])

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...itens]
    newItems[index][field] = value
    if (field === 'tipo_item') {
      newItems[index].produto_id = null
      newItems[index].servico_id = null
      newItems[index].valor_unitario = 0
      newItems[index].quantidade = 1
      newItems[index].tempo_estimado = 0
      newItems[index].tempo_estimado_str = ''
    }
    if (field === 'produto_id' && newItems[index].tipo_item === 'produto') {
      const prod = produtos.find((p) => p.id === value)
      if (prod) newItems[index].valor_unitario = prod.price || 0
    }
    if (field === 'servico_id' && newItems[index].tipo_item === 'servico') {
      const serv = servicos.find((s) => s.id === value)
      if (serv) {
        newItems[index].valor_unitario = serv.sale_value || 0
        const execTime = serv.exec_time || '00:00'
        newItems[index].tempo_estimado_str = execTime
        const [h, m] = execTime.split(':')
        newItems[index].tempo_estimado = Number(h || 0) + Number(m || 0) / 60
      }
    }
    if (field === 'tempo_estimado_str') {
      const [h, m] = (value || '00:00').split(':')
      newItems[index].tempo_estimado = Number(h || 0) + Number(m || 0) / 60
    }
    const qtd = Number(newItems[index].quantidade) || 0
    const valUnit = Number(newItems[index].valor_unitario) || 0
    if (newItems[index].tipo_item === 'servico') {
      const tempo = Number(newItems[index].tempo_estimado) || 0
      newItems[index].valor_total = Math.round(tempo * valUnit * qtd * 100) / 100
    } else {
      newItems[index].valor_total = Math.round(qtd * valUnit * 100) / 100
    }
    setItems(newItems)
  }

  const subtotal =
    Math.round(itens.reduce((acc, i) => acc + (Number(i.valor_total) || 0), 0) * 100) / 100

  const handleSave = async (status: string) => {
    if (!formData.cliente_id)
      return toast({ title: 'Erro', description: 'Cliente obrigatório.', variant: 'destructive' })

    const vErr = validateVehicle()
    if (vErr) {
      return toast({ title: 'Erro', description: vErr, variant: 'destructive' })
    }

    const cliente = clientes.find((c) => c.id === formData.cliente_id)
    if (cliente && status === 'confirmado') {
      for (const item of itens) {
        if (item.tipo_item === 'produto' && item.produto_id) {
          const prod = produtos.find((p) => p.id === item.produto_id)
          if (prod && (prod.stock || 0) < item.quantidade) {
            return toast({
              title: 'Estoque Insuficiente',
              description: `O produto "${prod.name}" tem apenas ${prod.stock || 0} em estoque.`,
              variant: 'destructive',
            })
          }
        }
      }
    }

    for (const item of itens) {
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

    const pedidoData: any = {
      ...formData,
      responsavel_id: user?.id,
      valor_total: subtotal,
      status,
      numero_pedido: formData.numero_pedido || `PED-${Date.now()}`,
    }
    if (!pedidoData.conta_id) pedidoData.conta_id = null

    let pid = id
    if (id) {
      await supabase.from('pedidos').update(pedidoData).eq('id', id)
      await supabase.from('pedido_itens').delete().eq('pedido_id', id)
    } else {
      const { data } = await supabase.from('pedidos').insert([pedidoData]).select().single()
      pid = data?.id
    }

    if (pid && itens.length > 0) {
      await supabase.from('pedido_itens').insert(
        itens.map((i) => {
          const { tempo_estimado_str, ...cleanItem } = i
          return { ...cleanItem, pedido_id: pid, user_id: user?.id }
        }),
      )
    }

    toast({ title: 'Sucesso', description: 'Pedido salvo.' })
    navigate('/admin/commercial/pedidos')
  }

  const handleQuickAddClient = async () => {
    if (!newClient.name) return
    const payload = {
      ...newClient,
      is_client: true,
      birth_date: newClient.birth_date || null,
    }
    const { data, error } = await supabase
      .from('profiles')
      .insert([payload])
      .select('id, name as nome')
      .single()
    if (data && !error) {
      setClientes([...clientes, data])
      setFormData({ ...formData, cliente_id: data.id })
      setNewClientOpen(false)
      setNewClient({
        name: '',
        email: '',
        phone: '',
        cpf_cnpj: '',
        rg: '',
        autoriza_whatsapp: false,
        birth_date: '',
        gender: '',
        address: '',
        nationality: '',
        naturalness: '',
        observacoes: '',
      })
      toast({ title: 'Cliente adicionado' })
    } else if (error) {
      toast({
        title: 'Erro ao adicionar cliente',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleQuickAddProduct = async () => {
    if (!newProduct.name) return
    const { data: res, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single()
    if (res && !error) {
      setProdutos([...produtos, res])
      setNewProductOpen(false)
      setNewProduct({
        name: '',
        sku: '',
        category: '',
        subcategory: '',
        price: 0,
        stock: 0,
        dimensions: '',
        description: '',
      })
      toast({ title: 'Produto adicionado' })
    } else if (error) {
      toast({
        title: 'Erro ao adicionar produto',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleQuickAddService = async () => {
    if (!newService.title) return
    const { data: res, error } = await supabase
      .from('services' as any)
      .insert([newService])
      .select()
      .single()
    if (res && !error) {
      setServicos([...servicos, res])
      setNewServiceOpen(false)
      setNewService({
        title: '',
        description: '',
        cost_value: 0,
        sale_value: 0,
        exec_time: '00:00:00',
        margin_time: 0,
        add_time: '00:00:00',
      })
      toast({ title: 'Serviço adicionado' })
    } else if (error) {
      toast({
        title: 'Erro ao adicionar serviço',
        description: error.message,
        variant: 'destructive',
      })
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
      setFormData({ ...formData, conta_id: data.id })
      setNewContaOpen(false)
      setNewConta({ nome: '', codigo_estrutural: '', natureza: 'receita' })
      toast({ title: 'Conta financeira adicionada' })
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">{id ? 'Editar Pedido' : 'Novo Pedido'}</h1>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="itens">Itens</TabsTrigger>
          <TabsTrigger value="logistica">Logística e Veículo</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4 bg-card p-6 border rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Importar Orçamento Aprovado</Label>
              <Select onValueChange={handleOrcamentoSelect} value={formData.orcamento_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {orcamentos.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.numero_orcamento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <div className="flex gap-2">
                <Select
                  onValueChange={(v) => setFormData({ ...formData, cliente_id: v })}
                  value={formData.cliente_id}
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
              <Label>Data Pedido</Label>
              <Input
                type="date"
                value={formData.data_pedido}
                onChange={(e) => setFormData({ ...formData, data_pedido: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Conta Financeira (DRE)</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.conta_id || ''}
                  onValueChange={(v) => setFormData({ ...formData, conta_id: v })}
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
              <Label>Forma de Pagamento Base</Label>
              <Select
                value={formData.forma_pagamento}
                onValueChange={(v) => setFormData({ ...formData, forma_pagamento: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="itens" className="space-y-4 bg-card p-6 border rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Itens do Pedido</h3>
            <Button type="button" variant="outline" onClick={addItem} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Adicionar Item
            </Button>
          </div>
          <div className="space-y-4">
            {itens.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-wrap gap-4 items-end border p-4 rounded-lg bg-muted/30"
              >
                <div className="w-full md:w-32 space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={item.tipo_item || 'produto'}
                    onValueChange={(v) => updateItem(idx, 'tipo_item', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="produto">Peça/Produto</SelectItem>
                      <SelectItem value="servico">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>{item.tipo_item === 'servico' ? 'Serviço' : 'Produto'}</Label>
                  <div className="flex gap-2">
                    <Select
                      value={
                        item.tipo_item === 'servico' ? item.servico_id || '' : item.produto_id || ''
                      }
                      onValueChange={(v) =>
                        updateItem(
                          idx,
                          item.tipo_item === 'servico' ? 'servico_id' : 'produto_id',
                          v,
                        )
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {item.tipo_item === 'servico'
                          ? servicos.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.title}
                              </SelectItem>
                            ))
                          : produtos.map((p) => (
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
                      onClick={() =>
                        item.tipo_item === 'servico'
                          ? setNewServiceOpen(true)
                          : setNewProductOpen(true)
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {item.tipo_item === 'servico' && (
                  <div className="w-full md:w-24 space-y-2">
                    <Label>Tempo (hh:mm)</Label>
                    <Input
                      type="time"
                      value={item.tempo_estimado_str || ''}
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
                    value={item.quantidade || 1}
                    onChange={(e) => updateItem(idx, 'quantidade', +e.target.value)}
                  />
                </div>
                <div className="w-full md:w-28 space-y-2">
                  <Label>{item.tipo_item === 'servico' ? 'Valor/h (R$)' : 'Unit. (R$)'}</Label>
                  <Input
                    value={formatCurrencyInput(item.valor_unitario)}
                    onChange={(e) =>
                      updateItem(idx, 'valor_unitario', parseCurrencyInput(e.target.value))
                    }
                  />
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <Label>Total (R$)</Label>
                  <Input
                    readOnly
                    value={formatCurrencyInput(item.valor_total)}
                    className="bg-muted"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setItems(itens.filter((_, i) => i !== idx))}
                >
                  <Trash className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <div className="text-right text-xl font-bold mt-4">
            Total: R$ {formatCurrencyInput(subtotal)}
          </div>
        </TabsContent>

        <TabsContent value="logistica" className="space-y-4 bg-card p-6 border rounded-xl">
          <div className="space-y-2 max-w-sm">
            <Label>Entrega Prevista</Label>
            <Input
              type="date"
              value={formData.data_entrega_prevista}
              onChange={(e) => setFormData({ ...formData, data_entrega_prevista: e.target.value })}
            />
          </div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase pt-4">
            Dados do Veículo (Oficina/Opcional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Placa *</Label>
              <Input
                placeholder="Ex: ABC1D23"
                value={formData.veiculo_placa || ''}
                onChange={(e) => setFormData({ ...formData, veiculo_placa: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Marca *</Label>
              <Select
                value={formData.veiculo_brand_id || ''}
                onValueChange={(v) =>
                  setFormData({ ...formData, veiculo_brand_id: v, veiculo_model_id: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Modelo *</Label>
              <Select
                disabled={!formData.veiculo_brand_id}
                value={formData.veiculo_model_id || ''}
                onValueChange={(v) => setFormData({ ...formData, veiculo_model_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quilometragem (KM) *</Label>
              <Input
                type="number"
                placeholder="Ex: 45000"
                value={formData.veiculo_km || ''}
                onChange={(e) => setFormData({ ...formData, veiculo_km: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2 pt-4">
            <Label>Observações Logísticas / Internas</Label>
            <Textarea
              rows={4}
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button variant="secondary" onClick={() => handleSave('pendente')}>
          Salvar Rascunho
        </Button>
        <Button onClick={() => handleSave('confirmado')}>Confirmar Pedido</Button>
      </div>

      <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Nome Completo / Razão Social *</Label>
              <Input
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CPF / CNPJ</Label>
              <Input
                value={newClient.cpf_cnpj}
                onChange={(e) => setNewClient({ ...newClient, cpf_cnpj: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>RG / Inscrição Estadual</Label>
              <Input
                value={newClient.rg}
                onChange={(e) => setNewClient({ ...newClient, rg: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone / WhatsApp</Label>
              <Input
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Input
                type="date"
                value={newClient.birth_date}
                onChange={(e) => setNewClient({ ...newClient, birth_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Gênero</Label>
              <Select
                value={newClient.gender}
                onValueChange={(v) => setNewClient({ ...newClient, gender: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Endereço Completo</Label>
              <Input
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nacionalidade</Label>
              <Input
                value={newClient.nationality}
                onChange={(e) => setNewClient({ ...newClient, nationality: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Naturalidade</Label>
              <Input
                value={newClient.naturalness}
                onChange={(e) => setNewClient({ ...newClient, naturalness: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={newClient.observacoes}
                onChange={(e) => setNewClient({ ...newClient, observacoes: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2 flex items-center gap-2">
              <Checkbox
                id="auth_zap"
                checked={newClient.autoriza_whatsapp}
                onCheckedChange={(c) => setNewClient({ ...newClient, autoriza_whatsapp: !!c })}
              />
              <Label htmlFor="auth_zap">Autoriza contato via WhatsApp</Label>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Peça ou Material</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Nome ou Descrição da Peça *</Label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>SKU / Código</Label>
              <Input
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Preço de Venda Padrão *</Label>
              <Input
                type="number"
                className={numClass}
                value={newProduct.price || ''}
                onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={newProduct.category}
                onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipamentos">Equipamentos</SelectItem>
                  <SelectItem value="vestuario">Vestuário</SelectItem>
                  <SelectItem value="pecas">Peças</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subcategoria</Label>
              <Input
                value={newProduct.subcategory}
                onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Estoque Inicial</Label>
              <Input
                type="number"
                className={numClass}
                value={newProduct.stock || ''}
                onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Dimensões</Label>
              <Input
                value={newProduct.dimensions}
                onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Descrição Técnica</Label>
              <Textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Tipo de Serviço</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Título / Nome do Serviço *</Label>
              <Input
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Descrição Detalhada</Label>
              <Textarea
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Custo Sugerido (R$)</Label>
              <Input
                type="number"
                className={numClass}
                value={newService.cost_value || ''}
                onChange={(e) =>
                  setNewService({ ...newService, cost_value: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Sugerido de Venda (R$)</Label>
              <Input
                type="number"
                className={numClass}
                value={newService.sale_value || ''}
                onChange={(e) =>
                  setNewService({ ...newService, sale_value: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tempo Execução (hh:mm:ss)</Label>
              <Input
                placeholder="00:00:00"
                value={newService.exec_time}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  let masked = val
                  if (val.length > 6) masked = val.substring(0, 6)
                  if (masked.length > 4)
                    masked = masked.replace(/(\d{2})(\d{2})(\d{1,2})/, '$1:$2:$3')
                  else if (masked.length > 2) masked = masked.replace(/(\d{2})(\d{1,2})/, '$1:$2')

                  const calcAdd = () => {
                    const margin = newService.margin_time || 0
                    const [h, m, s] = masked.split(':').map((n) => parseInt(n || '0', 10))
                    if (isNaN(h) || isNaN(m) || isNaN(s)) return '00:00:00'
                    const added = Math.round((h * 3600 + m * 60 + s) * (margin / 100))
                    return `${Math.floor(added / 3600)
                      .toString()
                      .padStart(2, '0')}:${Math.floor((added % 3600) / 60)
                      .toString()
                      .padStart(2, '0')}:${(added % 60).toString().padStart(2, '0')}`
                  }

                  setNewService({ ...newService, exec_time: masked, add_time: calcAdd() })
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Margem de Tempo (%)</Label>
              <Input
                type="number"
                className={numClass}
                value={newService.margin_time || ''}
                onChange={(e) => {
                  const margin = Number(e.target.value)
                  const calcAdd = () => {
                    const [h, m, s] = newService.exec_time
                      .split(':')
                      .map((n) => parseInt(n || '0', 10))
                    if (isNaN(h) || isNaN(m) || isNaN(s)) return '00:00:00'
                    const added = Math.round((h * 3600 + m * 60 + s) * (margin / 100))
                    return `${Math.floor(added / 3600)
                      .toString()
                      .padStart(2, '0')}:${Math.floor((added % 3600) / 60)
                      .toString()
                      .padStart(2, '0')}:${(added % 60).toString().padStart(2, '0')}`
                  }
                  setNewService({ ...newService, margin_time: margin, add_time: calcAdd() })
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Tempo Adicional Calculado</Label>
              <Input value={newService.add_time} readOnly className="bg-muted" />
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
