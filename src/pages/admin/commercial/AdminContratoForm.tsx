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

  const [form, setForm] = useState({
    cliente_id: '',
    tipo_contrato: 'assinatura',
    data_inicio: new Date().toISOString().split('T')[0],
    duracao_ciclo: 'mensal',
    valor_ciclo: 0,
    renovacao_automatica: true,
    observacoes: '',
  })

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome')
      .then(({ data }) => setClientes(data || []))
    if (id)
      supabase
        .from('contratos')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => data && setForm(data as any))
  }, [id])

  const handleSave = async (status: string) => {
    if (!form.cliente_id)
      return toast({ title: 'Erro', description: 'Cliente obrigatório', variant: 'destructive' })
    const payload = {
      ...form,
      status,
      responsavel_id: user?.id,
      numero_contrato: (form as any).numero_contrato || `CTR-${Date.now()}`,
      data_proxima_cobranca: (form as any).data_proxima_cobranca || form.data_inicio,
    }

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
            value={form.valor_ciclo}
            onChange={(e) => setForm({ ...form, valor_ciclo: +e.target.value })}
          />
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
