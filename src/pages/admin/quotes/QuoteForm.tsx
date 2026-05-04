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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Trash, ArrowLeft, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function QuoteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [data, setData] = useState({
    cliente_id: '',
    data_emissao: new Date().toISOString().split('T')[0],
    data_validade: '',
    status: 'rascunho',
    observacoes: '',
    desconto_percentual: 0,
    desconto_valor: 0,
    valor_impostos: 0,
  })
  const [items, setItems] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome')
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
      setItems(it || [])
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

    const qtd = Number(newItems[idx].quantidade) || 0
    const valUnit = Number(newItems[idx].valor_unitario) || 0

    if (newItems[idx].tipo_item === 'servico') {
      const tempo = Number(newItems[idx].tempo_estimado) || 0
      newItems[idx].valor_total = tempo * valUnit * qtd
    } else {
      newItems[idx].valor_total = qtd * valUnit
    }

    setItems(newItems)
  }

  const subtotal = items.reduce((acc, i) => acc + Number(i.valor_total), 0)
  const total =
    subtotal -
    Number(data.desconto_valor) -
    (subtotal * Number(data.desconto_percentual)) / 100 +
    Number(data.valor_impostos)

  const handleSave = async (status: string) => {
    if (!data.cliente_id) return toast({ title: 'O cliente é obrigatório', variant: 'destructive' })
    if (items.length === 0)
      return toast({ title: 'Adicione pelo menos 1 item', variant: 'destructive' })
    if (data.data_validade && data.data_validade < data.data_emissao)
      return toast({ title: 'Data de validade inválida', variant: 'destructive' })

    const payload = { ...data, subtotal, total, status }

    let orcId = id
    if (id) {
      await supabase.from('orcamentos').update(payload).eq('id', id)
      await supabase.from('orcamento_itens').delete().eq('orcamento_id', id)
    } else {
      const res = await supabase.from('orcamentos').insert(payload).select().single()
      orcId = res.data?.id
    }

    if (orcId) {
      const itemsPayload = items.map((i) => {
        const { id, ...cleanItem } = i
        return { ...cleanItem, orcamento_id: orcId }
      })
      await supabase.from('orcamento_itens').insert(itemsPayload)
    }

    toast({ title: 'Orçamento salvo com sucesso!' })
    navigate('/admin/quotes')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/quotes')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">{id ? 'Editar Orçamento' : 'Novo Orçamento'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados Básicos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select
              value={data.cliente_id}
              onValueChange={(v) => setData({ ...data, cliente_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome || 'Cliente Sem Nome'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Itens do Orçamento</CardTitle>
          <Button onClick={addItem} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Adicionar Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <Select
                  value={it.tipo_item === 'servico' ? it.servico_id || '' : it.produto_id || ''}
                  onValueChange={(v) =>
                    updateItem(idx, it.tipo_item === 'servico' ? 'servico_id' : 'produto_id', v)
                  }
                >
                  <SelectTrigger>
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

              {it.tipo_item === 'servico' && (
                <div className="w-full md:w-24 space-y-2">
                  <Label>Tempo (h)</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={it.tempo_estimado || ''}
                    onChange={(e) => updateItem(idx, 'tempo_estimado', e.target.value)}
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
                  type="number"
                  step="0.01"
                  value={it.valor_unitario || ''}
                  onChange={(e) => updateItem(idx, 'valor_unitario', e.target.value)}
                />
              </div>
              <div className="w-full md:w-32 space-y-2">
                <Label>Total</Label>
                <Input readOnly value={Number(it.valor_total).toFixed(2)} className="bg-muted" />
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
            <p className="text-muted-foreground text-center py-4">Nenhum item adicionado ainda.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Descontos, Impostos e Observações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Subtotal</Label>
              <Input readOnly value={`R$ ${subtotal.toFixed(2)}`} className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Desconto (%)</Label>
              <Input
                type="number"
                value={data.desconto_percentual}
                onChange={(e) => setData({ ...data, desconto_percentual: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Desconto (R$)</Label>
              <Input
                type="number"
                value={data.desconto_valor}
                onChange={(e) => setData({ ...data, desconto_valor: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Impostos (R$)</Label>
              <Input
                type="number"
                value={data.valor_impostos}
                onChange={(e) => setData({ ...data, valor_impostos: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="bg-primary/10 p-4 rounded-lg flex justify-between items-center">
            <span className="text-lg font-medium text-primary">Total Final</span>
            <span className="text-2xl font-bold text-primary">
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="space-y-2">
            <Label>Observações para o Cliente</Label>
            <Textarea
              rows={4}
              value={data.observacoes}
              onChange={(e) => setData({ ...data, observacoes: e.target.value })}
              placeholder="Digite termos adicionais, condições de pagamento, etc."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/admin/quotes')}>
          Cancelar
        </Button>
        <Button variant="secondary" onClick={() => handleSave('rascunho')}>
          Salvar Rascunho
        </Button>
        <Button onClick={() => handleSave('enviado')}>Salvar e Enviar</Button>
      </div>
    </div>
  )
}
