import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Check, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/financial-utils'

interface NewFinancialEntryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const STEPS = ['Informações Básicas', 'Entidade', 'Condições Financeiras', 'Parcelamento']

export function NewFinancialEntryModal({
  open,
  onOpenChange,
  onSuccess,
}: NewFinancialEntryModalProps) {
  const [step, setStep] = useState(0)
  const [type, setType] = useState<'receivable' | 'payable'>('receivable')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [entityId, setEntityId] = useState('')
  const [entityName, setEntityName] = useState('')
  const [entityOpen, setEntityOpen] = useState(false)
  const [entities, setEntities] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [accountId, setAccountId] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [installments, setInstallments] = useState('1')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchAccounts()
      setDueDate(new Date().toISOString().split('T')[0])
      fetchEntities()
    }
  }, [open])

  useEffect(() => {
    if (open) {
      fetchEntities()
      setEntityId('')
      setEntityName('')
    }
  }, [type, open])

  async function fetchEntities() {
    const filterField = type === 'receivable' ? 'is_client' : 'is_supplier'
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq(filterField, true)
      .order('name')
    if (data && data.length > 0) {
      setEntities(data)
      return
    }
    const { data: fallback } = await supabase
      .from('profiles')
      .select('id, name, email')
      .order('name')
    setEntities(fallback || [])
  }

  async function fetchAccounts() {
    const { data } = await supabase
      .from('plano_contas')
      .select('id, codigo_estrutural, nome, natureza')
      .eq('is_active', true)
      .order('codigo_estrutural')
    setAccounts(data || [])
  }

  const installmentPreview = useMemo(() => {
    const total = parseFloat(totalAmount) || 0
    const num = Math.max(1, parseInt(installments) || 1)
    const parcelValue = Math.round((total / num) * 100) / 100
    if (!dueDate) return []
    const base = new Date(dueDate + 'T00:00:00')
    if (isNaN(base.getTime())) return []
    return Array.from({ length: num }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth() + i, base.getDate())
      if (isNaN(d.getTime())) return null
      const isLast = i === num - 1
      return {
        num: i + 1,
        total: num,
        amount:
          isLast && num > 1
            ? Math.round((total - parcelValue * (num - 1)) * 100) / 100
            : parcelValue,
        due: d.toISOString().split('T')[0],
      }
    }).filter(Boolean) as { num: number; total: number; amount: number; due: string }[]
  }, [totalAmount, installments, dueDate])

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!type && !!description.trim() && (!!categoryId || true)
      case 1:
        return !!entityId
      case 2:
        return parseFloat(totalAmount) > 0 && !!dueDate
      case 3:
        return parseInt(installments) >= 1
      default:
        return false
    }
  }

  const resetForm = () => {
    setStep(0)
    setType('receivable')
    setCategoryId('')
    setDescription('')
    setEntityId('')
    setEntityName('')
    setAccountId('')
    setTotalAmount('')
    setInstallments('1')
  }

  const handleSubmit = async () => {
    if (!entityId) return toast.error('Selecione uma entidade')
    if (!description.trim()) return toast.error('Descrição é obrigatória')
    const total = parseFloat(totalAmount)
    if (!total || total <= 0) return toast.error('Valor total inválido')
    const numInstallments = Math.max(1, parseInt(installments) || 1)
    if (!dueDate) return toast.error('Data de vencimento é obrigatória')

    setLoading(true)
    try {
      const { data: master, error: masterError } = await supabase
        .from('financial_master_records')
        .insert({
          description: description.trim(),
          client_id: entityId,
          client_name: entityName,
          total_amount: total,
          status: 'pendente',
          type,
          category: categoryId || 'general',
        })
        .select()
        .single()
      if (masterError) throw masterError

      const charges = installmentPreview.map((p) => ({
        master_record_id: master.id,
        client_name: entityName,
        amount: p.amount,
        due_date: p.due,
        description: numInstallments > 1 ? `Parcela ${p.num}/${p.total}` : description.trim(),
        status: 'pendente',
        type,
        category: categoryId || 'general',
        profile_id: entityId,
        conta_id: accountId || null,
        parcela_numero: p.num,
        parcela_total: p.total,
      }))

      const { error: chargesError } = await supabase.from('financial_charges').insert(charges)
      if (chargesError) throw chargesError

      toast.success('Lançamento criado com sucesso!')
      resetForm()
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error('Erro ao criar lançamento: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    if (step < 3) setStep(step + 1)
    else handleSubmit()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          resetForm()
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
          <DialogDescription>
            Crie uma nova receita ou despesa com geração automática de parcelas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2 py-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div
                className={cn(
                  'flex items-center gap-2',
                  i <= step ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-colors',
                    i < step
                      ? 'bg-primary text-primary-foreground border-primary'
                      : i === step
                        ? 'border-primary text-primary'
                        : 'border-muted-foreground/30',
                  )}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-2 rounded transition-colors',
                    i < step ? 'bg-primary' : 'bg-muted-foreground/20',
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4 py-2 min-h-[200px]">
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={type} onValueChange={(v) => setType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receivable">Receita</SelectItem>
                      <SelectItem value="payable">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.codigo_estrutural} - {a.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição do lançamento"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2 animate-fade-in">
              <Label>Entidade *</Label>
              <Popover open={entityOpen} onOpenChange={setEntityOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {entityName || 'Buscar cliente/fornecedor...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar entidade..." />
                    <CommandList>
                      <CommandEmpty>Nenhuma entidade encontrada.</CommandEmpty>
                      <CommandGroup>
                        {entities.map((e) => (
                          <CommandItem
                            key={e.id}
                            value={`${e.name || ''} ${e.email || ''}`}
                            onSelect={() => {
                              setEntityId(e.id)
                              setEntityName(e.name || e.email || 'Entidade')
                              setEntityOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                entityId === e.id ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{e.name || 'Sem nome'}</span>
                              {e.email && (
                                <span className="text-xs text-muted-foreground">{e.email}</span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {entityName && (
                <p className="text-sm text-muted-foreground">
                  Selecionado: <span className="font-medium text-foreground">{entityName}</span>
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Total *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>1º Vencimento *</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Conta</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.codigo_estrutural} - {a.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Número de Parcelas</Label>
                <Input
                  type="number"
                  min="1"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                />
              </div>
              {installmentPreview.length > 0 && parseFloat(totalAmount) > 0 && (
                <div className="border rounded-md overflow-auto max-h-[200px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted/95">
                      <TableRow>
                        <TableHead className="text-xs">Parcela</TableHead>
                        <TableHead className="text-xs">Vencimento</TableHead>
                        <TableHead className="text-xs text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {installmentPreview.map((p) => (
                        <TableRow key={p.num}>
                          <TableCell className="text-xs font-medium">
                            {p.num}/{p.total}
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(p.due + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-xs text-right font-medium">
                            {formatCurrency(p.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="flex justify-between items-center rounded-md bg-muted/50 px-4 py-2">
                <span className="text-sm text-muted-foreground">Total Geral</span>
                <span className="text-lg font-bold">
                  {formatCurrency(parseFloat(totalAmount) || 0)}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (step > 0) setStep(step - 1)
              else {
                onOpenChange(false)
                resetForm()
              }
            }}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {step === 0 ? 'Cancelar' : 'Voltar'}
          </Button>
          <div className="text-xs text-muted-foreground">
            Passo {step + 1} de {STEPS.length}
          </div>
          <Button onClick={handleNext} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {step === 3 ? 'Criar Lançamento' : 'Próximo'}
            {step < 3 && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
