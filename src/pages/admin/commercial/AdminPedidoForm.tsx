import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
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
import { toast } from '@/hooks/use-toast'
import { Trash } from 'lucide-react'
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
    veiculo_modelo: '',
    veiculo_km: '',
  })
  const [itens, setItems] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('plano_contas')
      .select('id, codigo_estrutural, nome')
      .order('codigo_estrutural')
      .then(({ data }) => setPlanoContas(data || []))
    supabase
      .from('clientes')
      .select('id, nome')
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
      .select('id, title, sale_value')
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

  const handleOrcamentoSelect = async (orcId: string) => {
    setFormData({ ...formData, orcamento_id: orcId })
    const { data: orc } = await supabase.from('orcamentos').select('*').eq('id', orcId).single()
    if (orc) {
      setFormData((p) => ({
        ...p,
        cliente_id: orc.cliente_id,
        veiculo_placa: orc.veiculo_placa || '',
        veiculo_modelo: orc.veiculo_modelo || '',
        veiculo_km: orc.veiculo_km || '',
      }))
    }
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
      if (serv) newItems[index].valor_unitario = serv.sale_value || 0
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

  const subtotal = Math.round(itens.reduce((acc, i) => acc + (i.valor_total || 0), 0) * 100) / 100

  const handleSave = async (status: string) => {
    if (!formData.cliente_id)
      return toast({ title: 'Erro', description: 'Cliente obrigatório.', variant: 'destructive' })

    const cliente = clientes.find((c) => c.id === formData.cliente_id)
    if (cliente && status === 'confirmado') {
      const { data: overdue } = await supabase
        .from('financial_charges')
        .select('id')
        .eq('client_name', cliente.nome)
        .in('status', ['pendente', 'atrasado'])
        .lt('due_date', new Date().toISOString().split('T')[0])
        .limit(1)

      if (overdue && overdue.length > 0) {
        return toast({
          title: 'Bloqueado',
          description: `O cliente ${cliente.nome} possui pendências financeiras. Regularize antes de confirmar o pedido.`,
          variant: 'destructive',
        })
      }

      for (const item of itens) {
        if (item.tipo_item === 'produto' && item.produto_id) {
          const prod = produtos.find((p) => p.id === item.produto_id)
          if (prod && (prod.stock || 0) < item.quantidade) {
            return toast({
              title: 'Estoque Insuficiente',
              description: `O produto "${prod.name}" tem apenas ${prod.stock || 0} em estoque (tentou vender ${item.quantidade}).`,
              variant: 'destructive',
            })
          }
        }
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{id ? 'Editar Pedido' : 'Novo Pedido'}</h1>
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
          <Select
            onValueChange={(v) => setFormData({ ...formData, cliente_id: v })}
            value={formData.cliente_id}
          >
            <SelectTrigger>
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
          <Label>Entrega Prevista</Label>
          <Input
            type="date"
            value={formData.data_entrega_prevista}
            onChange={(e) => setFormData({ ...formData, data_entrega_prevista: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Conta Financeira (DRE)</Label>
          <Select
            value={formData.conta_id || ''}
            onValueChange={(v) => setFormData({ ...formData, conta_id: v })}
          >
            <SelectTrigger>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg bg-card">
        <div className="col-span-1 md:col-span-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase">
            Dados do Veículo (Oficina/GridCar)
          </h3>
        </div>
        <div className="space-y-2">
          <Label>Placa</Label>
          <Input
            placeholder="Ex: ABC1D23"
            value={formData.veiculo_placa || ''}
            onChange={(e) => setFormData({ ...formData, veiculo_placa: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Modelo</Label>
          <Input
            placeholder="Ex: Hyundai HB20"
            value={formData.veiculo_modelo || ''}
            onChange={(e) => setFormData({ ...formData, veiculo_modelo: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Quilometragem (KM)</Label>
          <Input
            type="number"
            placeholder="Ex: 45000"
            value={formData.veiculo_km || ''}
            onChange={(e) => setFormData({ ...formData, veiculo_km: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Itens do Pedido</h3>
          <Button type="button" variant="outline" onClick={addItem}>
            Adicionar Item
          </Button>
        </div>
        {itens.map((item, idx) => (
          <div key={idx} className="flex flex-wrap gap-4 items-end border p-4 rounded bg-muted/20">
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
              <Select
                value={item.tipo_item === 'servico' ? item.servico_id || '' : item.produto_id || ''}
                onValueChange={(v) =>
                  updateItem(idx, item.tipo_item === 'servico' ? 'servico_id' : 'produto_id', v)
                }
              >
                <SelectTrigger>
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
            </div>

            {item.tipo_item === 'servico' && (
              <div className="w-full md:w-24 space-y-2">
                <Label>Tempo</Label>
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
                min="1"
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
              <Input readOnly value={formatCurrencyInput(item.valor_total)} className="bg-muted" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setItems(itens.filter((_, i) => i !== idx))}
            >
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <div className="text-right text-xl font-bold">Total: R$ {formatCurrencyInput(subtotal)}</div>

      <div className="flex justify-end gap-4 mt-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button variant="secondary" onClick={() => handleSave('pendente')}>
          Salvar Rascunho
        </Button>
        <Button onClick={() => handleSave('confirmado')}>Confirmar Pedido</Button>
      </div>
    </div>
  )
}
