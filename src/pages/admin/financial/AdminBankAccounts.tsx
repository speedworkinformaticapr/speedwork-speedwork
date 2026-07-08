import { useEffect, useState, useMemo } from 'react'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit2, Trash2, Landmark, CreditCard, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/financial-utils'

const TIPO_LABELS: Record<string, string> = {
  conta_corrente: 'Conta Corrente',
  poupanca: 'Poupança',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
}

const isCardType = (tipo: string) => tipo === 'cartao_credito' || tipo === 'cartao_debito'

const getTipoBadge = (tipo: string) => {
  if (isCardType(tipo))
    return (
      <Badge variant="secondary">
        <CreditCard className="w-3 h-3 mr-1" />
        {TIPO_LABELS[tipo]}
      </Badge>
    )
  return (
    <Badge variant="outline">
      <Landmark className="w-3 h-3 mr-1" />
      {TIPO_LABELS[tipo] || tipo}
    </Badge>
  )
}

const maskCardNumber = (num: string, tipo: string) => {
  if (!num) return '-'
  if (isCardType(tipo)) return `**** ${num}`
  return num
}

export default function AdminBankAccounts() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [planoContas, setPlanoContas] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<any>({
    tipo_conta: 'conta_corrente',
    is_active: true,
    saldo_inicial: 0,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'bank' | 'card'>('all')

  const loadData = async () => {
    setIsLoading(true)
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
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const bankPlanoContas = useMemo(
    () => planoContas.filter((p) => p.natureza === 'conta_bancaria'),
    [planoContas],
  )

  const filteredAccounts = useMemo(() => {
    if (filter === 'all') return accounts
    if (filter === 'bank') return accounts.filter((a) => !isCardType(a.tipo_conta))
    return accounts.filter((a) => isCardType(a.tipo_conta))
  }, [accounts, filter])

  const handleOpen = (item?: any) => {
    setFormData(
      item || {
        nome: '',
        instituicao: '',
        tipo_conta: 'conta_corrente',
        subtipo: '',
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

  const checkDuplicate = async (numeroConta: string, excludeId?: string): Promise<boolean> => {
    if (!numeroConta) return false
    let query = supabase.from('contas_bancarias').select('id').eq('numero_conta', numeroConta)
    if (excludeId) query = query.neq('id', excludeId)
    const { count } = await query
    return (count ?? 0) > 0
  }

  const handleSave = async () => {
    if (!formData.nome) return toast.error('Nome é obrigatório')
    if (!formData.instituicao) return toast.error('Instituição é obrigatória')
    if (!formData.numero_conta)
      return toast.error(
        isCardType(formData.tipo_conta)
          ? 'Últimos 4 dígitos são obrigatórios'
          : 'Número da conta é obrigatório',
      )

    const isDup = await checkDuplicate(formData.numero_conta, formData.id)
    if (isDup) return toast.error('Já existe uma conta/cartão com este número')

    setIsSaving(true)
    const isCard = isCardType(formData.tipo_conta)
    const payload = {
      nome: formData.nome,
      instituicao: formData.instituicao,
      tipo_conta: formData.tipo_conta,
      subtipo: isCard ? formData.subtipo || null : null,
      agencia: isCard ? null : formData.agencia || null,
      numero_conta: formData.numero_conta,
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
      toast.success('Registro salvo com sucesso!')
      setIsDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast.error('Erro: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este registro?')) return
    const { error } = await supabase.from('contas_bancarias').delete().eq('id', id)
    if (error) return toast.error('Erro ao excluir: ' + error.message)
    toast.success('Registro excluído!')
    loadData()
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

  const isCard = isCardType(formData.tipo_conta || 'conta_corrente')

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Landmark className="h-7 w-7" /> Contas Bancárias e Cartões
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie contas bancárias, cartões e vínculos com o Plano de Contas.
          </p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Novo Registro
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Todos ({accounts.length})</TabsTrigger>
          <TabsTrigger value="bank">
            Contas ({accounts.filter((a) => !isCardType(a.tipo_conta)).length})
          </TabsTrigger>
          <TabsTrigger value="card">
            Cartões ({accounts.filter((a) => isCardType(a.tipo_conta)).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Instituição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Agência</TableHead>
                  <TableHead>Conta/Cartão</TableHead>
                  <TableHead>PF/PJ</TableHead>
                  <TableHead className="text-right">Saldo Inicial</TableHead>
                  <TableHead>Plano de Contas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((c) => {
                  const pc = planoContas.find((p) => p.id === c.plano_contas_id)
                  const card = isCardType(c.tipo_conta)
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nome}</TableCell>
                      <TableCell>{c.instituicao || '-'}</TableCell>
                      <TableCell>{getTipoBadge(c.tipo_conta)}</TableCell>
                      <TableCell>{card ? '-' : c.agencia || '-'}</TableCell>
                      <TableCell>{maskCardNumber(c.numero_conta, c.tipo_conta)}</TableCell>
                      <TableCell>
                        {card ? <Badge variant="outline">{c.subtipo || '-'}</Badge> : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(c.saldo_inicial)}
                      </TableCell>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredAccounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Registro' : 'Novo Registro'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={formData.nome || ''}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Banco do Brasil"
              />
            </div>
            <div>
              <Label>Instituição *</Label>
              <Input
                value={formData.instituicao || ''}
                onChange={(e) => setFormData({ ...formData, instituicao: e.target.value })}
                placeholder="Ex: Banco do Brasil"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select
                  value={formData.tipo_conta}
                  onValueChange={(v) => setFormData({ ...formData, tipo_conta: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conta_corrente">Conta Corrente</SelectItem>
                    <SelectItem value="poupanca">Poupança</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isCard && (
                <div>
                  <Label>PF/PJ</Label>
                  <Select
                    value={formData.subtipo || 'none'}
                    onValueChange={(v) =>
                      setFormData({ ...formData, subtipo: v === 'none' ? '' : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="PF">PF (Pessoa Física)</SelectItem>
                      <SelectItem value="PJ">PJ (Pessoa Jurídica)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {!isCard && (
                <div>
                  <Label>Agência</Label>
                  <Input
                    value={formData.agencia || ''}
                    onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  />
                </div>
              )}
              <div>
                <Label>{isCard ? 'Últimos 4 dígitos *' : 'Número da Conta *'}</Label>
                <Input
                  value={formData.numero_conta || ''}
                  onChange={(e) => setFormData({ ...formData, numero_conta: e.target.value })}
                  maxLength={isCard ? 4 : undefined}
                  placeholder={isCard ? 'Ex: 1234' : 'Ex: 76.287-3'}
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
              <Label>{isCard ? 'Limite/Saldo (R$)' : 'Saldo Inicial (R$)'}</Label>
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
              <Label>Vincular ao Plano de Contas (opcional — auto-criado se vazio)</Label>
              <Select
                value={formData.plano_contas_id || 'none'}
                onValueChange={(v) =>
                  setFormData({ ...formData, plano_contas_id: v === 'none' ? '' : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto (recomendado)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Auto (recomendado)</SelectItem>
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
              <Label htmlFor="active">Registro Ativo</Label>
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
