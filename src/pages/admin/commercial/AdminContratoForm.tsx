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
    duracao_ciclo: 'mensal',
    valor_ciclo: 0,
    renovacao_automatica: true,
    observacoes: '',
  })

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
      .from('sla_types')
      .select('id, name')
      .then(({ data }) => setSlas(data || []))

    if (id)
      supabase
        .from('contratos')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => data && setForm((prev) => ({ ...prev, ...data })))
  }, [id])

  const handleSave = async (status: string) => {
    if (!form.cliente_id)
      return toast({ title: 'Erro', description: 'Cliente obrigatório', variant: 'destructive' })

    const payload: any = {
      ...form,
      status,
      responsavel_id: user?.id,
      numero_contrato: (form as any).numero_contrato || `CTR-${Date.now()}`,
      data_proxima_cobranca: (form as any).data_proxima_cobranca || form.data_inicio,
    }
    if (!payload.conta_id) payload.conta_id = null
    if (!payload.sla_id) payload.sla_id = null

    if (id) await supabase.from('contratos').update(payload).eq('id', id)
    else await supabase.from('contratos').insert([payload])

    toast({ title: 'Contrato salvo' })
    navigate('/admin/commercial/contratos')
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{id ? 'Editar Contrato' : 'Novo Contrato'}</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cliente *</Label>
          <Select
            value={form.cliente_id}
            onValueChange={(v) => setForm({ ...form, cliente_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
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
          <Label>Tipo de Contrato</Label>
          <Select
            value={form.tipo_contrato}
            onValueChange={(v) => setForm({ ...form, tipo_contrato: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assinatura">Assinatura</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
              <SelectItem value="suporte">Suporte</SelectItem>
              <SelectItem value="consultoria">Consultoria</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Data Início</Label>
          <Input
            type="date"
            value={form.data_inicio}
            onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Valor do Ciclo R$</Label>
          <Input
            type="number"
            step="0.01"
            value={form.valor_ciclo}
            onChange={(e) => setForm({ ...form, valor_ciclo: +e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Conta Financeira (DRE)</Label>
          <Select
            value={form.conta_id || ''}
            onValueChange={(v) => setForm({ ...form, conta_id: v })}
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
        <div className="space-y-2">
          <Label>SLA Associado</Label>
          <Select value={form.sla_id || ''} onValueChange={(v) => setForm({ ...form, sla_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Nenhum SLA selecionado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum SLA</SelectItem>
              {slas.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button variant="secondary" onClick={() => handleSave('rascunho')}>
          Salvar Rascunho
        </Button>
        <Button onClick={() => handleSave('ativo')}>Ativar Contrato</Button>
      </div>
    </div>
  )
}
