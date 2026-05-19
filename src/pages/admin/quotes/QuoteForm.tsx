import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Trash, ArrowLeft, Plus } from 'lucide-react'
import { decimalToTime, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils'

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
      .select('id, title, sale_value')
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

  const handleSave = async (status: string) => {
    if (!data.cliente_id) return toast({ title: 'O cliente é obrigatório', variant: 'destructive' })
    if (items.length === 0)
      return toast({ title: 'Adicione pelo menos 1 item', variant: 'destructive' })
    if (data.data_validade && data.data_validade < data.data_emissao)
      return toast({ title: 'Data de validade inválida', variant: 'destructive' })

    const payload: any = { ...data, subtotal, total, status }
    if (!payload.conta_id) payload.conta_id = null

    try {
      let orcId = id
      if (id) {
        const { error: updateError } = await supabase
          .from('orcamentos')
          .update(payload)
          .eq('id', id)
        if (updateError) throw updateError
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
        const { error: itemsError } = await supabase.from('orcamento_itens').insert(itemsPayload)
        if (itemsError) throw itemsError
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
    } else {
      toast({
        title: 'Erro ao adicionar cliente',
        variant: 'destructive',
        description: error?.message,
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
      setData({ ...data, conta_id: data.id })
      setNewContaOpen(false)
      setNewConta({ nome: '', codigo_estrutural: '', natureza: 'receita' })
      toast({ title: 'Conta financeira adicionada' })
    }
  }

  const handleQuickAddProduct = async () => {
    if (!newProduct.name) return
    const { data, error } = await supabase
      .from('products')
      .insert([{ name: newProduct.name, price: newProduct.price }])
      .select()
      .single()
    if (data && !error) {
      setProducts([...products, data])
      setNewProductOpen(false)
      setNewProduct({ name: '', price: 0 })
      toast({ title: 'Produto adicionado' })
    } else {
      toast({ title: 'Erro ao adicionar produto', variant: 'destructive' })
    }
  }

  const handleQuickAddService = async () => {
    if (!newService.title) return
    const { data, error } = await supabase
      .from('services' as any)
      .insert([{ title: newService.title, sale_value: newService.sale_value }])
      .select()
      .single()
    if (data && !error) {
      setServices([...services, data])
      setNewServiceOpen(false)
      setNewService({ title: '', sale_value: 0 })
      toast({ title: 'Serviço adicionado' })
    } else {
      toast({ title: 'Erro ao adicionar serviço', variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => navigate('/admin/quotes')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">{id ? 'Editar Orçamento' : 'Novo Orçamento'}</h1>
      </div>

      <Tabs defaultValue="identificacao" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="identificacao">Identificação</TabsTrigger>
          <TabsTrigger value="itens">Itens e Serviços</TabsTrigger>
          <TabsTrigger value="fechamento">Fechamento</TabsTrigger>
        </TabsList>

        <TabsContent value="identificacao" className="space-y-6">
          <div className="bg-card p-6 rounded-xl border space-y-4">
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

          <div className="bg-card p-6 rounded-xl border space-y-4">
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

        <TabsContent value="itens" className="space-y-4 bg-card p-6 border rounded-xl">
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
                      <SelectItem value="produto">Peça/Produto</SelectItem>
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
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        it.tipo_item === 'servico'
                          ? setNewServiceOpen(true)
                          : setNewProductOpen(true)
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {it.tipo_item === 'servico' && (
                  <div className="w-full md:w-24 space-y-2">
                    <Label>Tempo</Label>
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
                    min="1"
                    value={it.quantidade || 1}
                    onChange={(e) => updateItem(idx, 'quantidade', e.target.value)}
                  />
                </div>
                <div className="w-full md:w-28 space-y-2">
                  <Label>{it.tipo_item === 'servico' ? 'Valor/h (R$)' : 'Unit. (R$)'}</Label>
                  <Input
                    value={formatCurrencyInput(it.valor_unitario)}
                    onChange={(e) =>
                      updateItem(idx, 'valor_unitario', parseCurrencyInput(e.target.value))
                    }
                  />
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <Label>Total (R$)</Label>
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
              <p className="text-muted-foreground text-center py-4">
                Nenhum item adicionado ainda.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="fechamento" className="space-y-6 bg-card p-6 border rounded-xl">
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
            <Label>Observações para o Cliente</Label>
            <Textarea
              rows={4}
              value={data.observacoes}
              onChange={(e) => setData({ ...data, observacoes: e.target.value })}
              placeholder="Termos adicionais, condições..."
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => navigate('/admin/quotes')}>
          Cancelar
        </Button>
        <Button variant="secondary" onClick={() => handleSave('rascunho')}>
          Salvar Rascunho
        </Button>
        <Button onClick={() => handleSave('enviado')}>Salvar e Enviar</Button>
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

      <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Produto</Label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Preço Unitário (R$)</Label>
              <Input
                value={formatCurrencyInput(newProduct.price)}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: parseCurrencyInput(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewProductOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleQuickAddProduct}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newServiceOpen} onOpenChange={setNewServiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título do Serviço</Label>
              <Input
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Base (R$)</Label>
              <Input
                value={formatCurrencyInput(newService.sale_value)}
                onChange={(e) =>
                  setNewService({ ...newService, sale_value: parseCurrencyInput(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewServiceOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleQuickAddService}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
