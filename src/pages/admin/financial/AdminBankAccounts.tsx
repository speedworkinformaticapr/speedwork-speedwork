import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Landmark } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/financial-utils'

export default function AdminBankAccounts() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [planoContas, setPlanoContas] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<any>({ is_active: true, saldo_inicial: 0 })
  const [isSaving, setIsSaving] = useState(false)

  const loadData = async () => {
    const [{ data: banks }, { data: pc }] = await Promise.all([
      supabase.from('contas_bancarias').select('*').order('nome'),
      supabase
        .from('plano_contas')
        .select('id, codigo_estrutural, nome, natureza')
        .eq('is_active', true)
        .order('codigo_estrutural'),
    ])
    setAccounts(banks || [])
    setPlanoContas(pc || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const bankPlanoContas = planoContas.filter((p) => p.natureza === 'conta_bancaria')

  const handleOpen = (item?: any) => {
    setFormData(
      item || {
        nome: '',
        agencia: '',
        numero_conta: '',
        titular: '',
        saldo_inicial: 0,
        plano_contas_id: '',
        is_active: true,
      },
    )
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.nome) return toast.error('Nome é obrigatório')
    setIsSaving(true)
    const payload = {
      nome: formData.nome,
      agencia: formData.agencia || null,
      numero_conta: formData.numero_conta || null,
      titular: formData.titular || null,
      saldo_inicial: Number(formData.saldo_inicial) || 0,
      plano_contas_id: formData.plano_contas_id || null,
      is_active: formData.is_active ?? true,
    }
    try {
      if (formData.id) {
        const { error } = await supabase
          .from('contas_bancarias')
          .update(payload)
          .eq('id', formData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('contas_bancarias').insert(payload)
        if (error) throw error
      }
      toast.success('Conta bancária salva com sucesso!')
      setIsDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast.error('Erro: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('contas_bancarias')
      .update({ is_active: !current })
      .eq('id', id)
    if (error) return toast.error('Erro ao atualizar status')
    toast.success('Status atualizado!')
    loadData()
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Landmark className="h-7 w-7" /> Contas Bancárias
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie contas bancárias e seus vínculos com o Plano de Contas.
          </p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Nova Conta
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Agência</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead className="text-right">Saldo Inicial</TableHead>
                <TableHead>Vínculo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((c) => {
                const pc = planoContas.find((p) => p.id === c.plano_contas_id)
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell>{c.agencia || '-'}</TableCell>
                    <TableCell>{c.numero_conta || '-'}</TableCell>
                    <TableCell>{c.titular || '-'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.saldo_inicial)}</TableCell>
                    <TableCell>
                      {pc ? (
                        <Badge variant="secondary">
                          {pc.codigo_estrutural} - {pc.nome}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={c.is_active}
                        onCheckedChange={() => toggleActive(c.id, c.is_active)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpen(c)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    Nenhuma conta bancária cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Conta' : 'Nova Conta Bancária'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={formData.nome || ''}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Agência</Label>
                <Input
                  value={formData.agencia || ''}
                  onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                />
              </div>
              <div>
                <Label>Número da Conta</Label>
                <Input
                  value={formData.numero_conta || ''}
                  onChange={(e) => setFormData({ ...formData, numero_conta: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Titular</Label>
              <Input
                value={formData.titular || ''}
                onChange={(e) => setFormData({ ...formData, titular: e.target.value })}
              />
            </div>
            <div>
              <Label>Saldo Inicial (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.saldo_inicial || 0}
                onChange={(e) =>
                  setFormData({ ...formData, saldo_inicial: parseFloat(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Vincular ao Plano de Contas</Label>
              <Select
                value={formData.plano_contas_id || 'none'}
                onValueChange={(v) =>
                  setFormData({ ...formData, plano_contas_id: v === 'none' ? '' : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {bankPlanoContas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.codigo_estrutural} - {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                id="active"
              />
              <Label htmlFor="active">Conta Ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
