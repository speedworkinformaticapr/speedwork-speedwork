import { useState, useEffect } from 'react'
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
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewFinancialEntryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function NewFinancialEntryModal({
  open,
  onOpenChange,
  onSuccess,
}: NewFinancialEntryModalProps) {
  const [type, setType] = useState<'receivable' | 'payable'>('receivable')
  const [entityId, setEntityId] = useState('')
  const [entityName, setEntityName] = useState('')
  const [entityOpen, setEntityOpen] = useState(false)
  const [entities, setEntities] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [installments, setInstallments] = useState('1')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchAccounts()
      setDueDate(new Date().toISOString().split('T')[0])
    }
  }, [open])

  useEffect(() => {
    if (open) {
      fetchEntities()
      setEntityId('')
      setEntityName('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const resetForm = () => {
    setType('receivable')
    setEntityId('')
    setEntityName('')
    setCategoryId('')
    setDescription('')
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

      const parcelValue = Math.round((total / numInstallments) * 100) / 100
      const charges: any[] = []
      const baseDate = new Date(dueDate + 'T00:00:00')
      for (let i = 0; i < numInstallments; i++) {
        const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate())
        const isLast = i === numInstallments - 1
        charges.push({
          master_record_id: master.id,
          client_name: entityName,
          amount:
            isLast && numInstallments > 1
              ? Math.round((total - parcelValue * (numInstallments - 1)) * 100) / 100
              : parcelValue,
          due_date: d.toISOString().split('T')[0],
          description:
            numInstallments > 1 ? `Parcela ${i + 1}/${numInstallments}` : description.trim(),
          status: 'pendente',
          type: type,
          category: categoryId || 'general',
          profile_id: entityId,
          parcela_numero: i + 1,
          parcela_total: numInstallments,
        })
      }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
          <DialogDescription>
            Crie uma nova receita ou despesa com geração automática de parcelas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
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
          </div>

          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do lançamento"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label>Parcelas</Label>
              <Input
                type="number"
                min="1"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Criar Lançamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
