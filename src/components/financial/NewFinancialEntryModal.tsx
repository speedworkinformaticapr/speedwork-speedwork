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
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/financial-utils'
import { EntityCombobox } from './wizard/EntityCombobox'
import { ConferenceView } from './wizard/ConferenceView'
import { computeInstallments, safeDate } from './wizard/types'

const STEPS = ['Identificação', 'Lançamento', 'Valores', 'Conferência']

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
  editId?: string | null
}

export function NewFinancialEntryModal({ open, onOpenChange, onSuccess, editId }: Props) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'receivable' | 'payable'>('receivable')
  const [isAvulso, setIsAvulso] = useState(false)
  const [entityId, setEntityId] = useState('')
  const [entityName, setEntityName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [entryDate, setEntryDate] = useState('')
  const [installments, setInstallments] = useState('1')
  const [contaOrigemId, setContaOrigemId] = useState('')
  const [contaDestinoId, setContaDestinoId] = useState('')
  const [accounts, setAccounts] = useState<any[]>([])
  const isEdit = !!editId

  useEffect(() => {
    if (!open) return
    fetchAccounts()
    const today = new Date()
    const todayStr = isNaN(today.getTime()) ? '' : today.toISOString().split('T')[0]
    setDueDate(todayStr)
    setEntryDate(todayStr)
    if (editId) {
      fetchEditData(editId)
    } else {
      resetForm()
    }
  }, [open, editId])

  async function fetchAccounts() {
    const { data } = await supabase
      .from('plano_contas')
      .select('id, codigo_estrutural, nome, natureza, conta_pai_id, is_active')
      .eq('is_active', true)
      .order('codigo_estrutural')
    setAccounts(data || [])
  }

  async function fetchEditData(id: string) {
    const { data: master } = await supabase
      .from('financial_master_records')
      .select('*')
      .eq('id', id)
      .single()
    if (!master) return
    const { data: charges } = await supabase
      .from('financial_charges')
      .select('*')
      .eq('master_record_id', id)
      .order('due_date')
    setType((master.type as any) || 'receivable')
    setEntityId(master.client_id || '')
    setEntityName(master.client_name || '')
    setCategoryId(master.category || '')
    setDescription(master.description || '')
    setTotalAmount(String(master.total_amount || ''))
    setIsAvulso(!master.client_id)
    setContaOrigemId(master.conta_origem_id || '')
    setContaDestinoId(master.conta_destino_id || '')
    if (master.entry_date) {
      const ed = safeDate(master.entry_date)
      setEntryDate(ed ? ed.toISOString().split('T')[0] : '')
    }
    if (charges && charges.length > 0) {
      const first = safeDate(charges[0].due_date)
      setDueDate(first ? first.toISOString().split('T')[0] : '')
      setInstallments(String(charges.length))
    }
  }

  function resetForm() {
    setStep(0)
    setType('receivable')
    setIsAvulso(false)
    setEntityId('')
    setEntityName('')
    setCategoryId('')
    setDescription('')
    setTotalAmount('')
    setInstallments('1')
    setContaOrigemId('')
    setContaDestinoId('')
  }

  const analyticalAccounts = useMemo(() => {
    const parentIds = new Set(accounts.filter((a) => a.conta_pai_id).map((a) => a.conta_pai_id))
    return accounts.filter((a) => !parentIds.has(a.id))
  }, [accounts])

  const categoryAccounts = useMemo(
    () => analyticalAccounts.filter((a) => a.natureza === 'C' || a.natureza === 'D'),
    [analyticalAccounts],
  )

  const installmentPreview = useMemo(
    () => computeInstallments(totalAmount, installments, dueDate),
    [totalAmount, installments, dueDate],
  )

  const handleOrigemChange = (id: string) => {
    setContaOrigemId(id)
    const acc = accounts.find((a) => a.id === id)
    if (acc?.natureza === 'D') setType('payable')
    else if (acc?.natureza === 'C') setType('receivable')
  }

  const handleDestinoChange = (id: string) => {
    setContaDestinoId(id)
    const acc = accounts.find((a) => a.id === id)
    if (acc?.natureza === 'D') setType('payable')
    else if (acc?.natureza === 'C') setType('receivable')
  }

  const canProceed = () => {
    if (step === 0) return !!type && (isAvulso || !!entityId) && !!entryDate
    if (step === 1) return !!description.trim()
    if (step === 2) return parseFloat(totalAmount) > 0 && !!dueDate
    return true
  }

  const handleSubmit = async () => {
    if (!description.trim()) return toast.error('Descrição é obrigatória')
    const total = parseFloat(totalAmount)
    if (!total || total <= 0) return toast.error('Valor total inválido')
    setLoading(true)
    try {
      const masterPayload: any = {
        description: description.trim(),
        client_id: isAvulso ? null : entityId,
        client_name: isAvulso ? 'Lançamento Avulso' : entityName,
        total_amount: total,
        type,
        category: categoryId || 'general',
        conta_origem_id: contaOrigemId || null,
        conta_destino_id: contaDestinoId || null,
        entry_date: entryDate || null,
      }
      let masterId = editId
      if (isEdit && masterId) {
        const { error } = await supabase
          .from('financial_master_records')
          .update(masterPayload)
          .eq('id', masterId)
        if (error) throw error
        await supabase.from('financial_charges').delete().eq('master_record_id', masterId)
      } else {
        masterPayload.status = 'pendente'
        const { data: master, error } = await supabase
          .from('financial_master_records')
          .insert(masterPayload)
          .select()
          .single()
        if (error) throw error
        masterId = master.id
      }
      const charges = installmentPreview.map((p) => ({
        master_record_id: masterId,
        client_name: masterPayload.client_name,
        amount: p.amount,
        due_date: p.due,
        description:
          parseInt(installments) > 1 ? `Parcela ${p.num}/${p.total}` : description.trim(),
        status: 'pendente',
        type,
        category: categoryId || 'general',
        profile_id: isAvulso ? null : entityId,
        conta_origem_id: contaOrigemId || null,
        conta_destino_id: contaDestinoId || null,
        parcela_numero: p.num,
        parcela_total: p.total,
      }))
      if (charges.length > 0) {
        const { error: ce } = await supabase.from('financial_charges').insert(charges)
        if (ce) throw ce
      }
      toast.success(isEdit ? 'Lançamento atualizado!' : 'Lançamento criado!')
      resetForm()
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error('Erro: ' + err.message)
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

  const categoryName = categoryAccounts.find((a) => a.id === categoryId)?.nome || ''
  const numInstallments = parseInt(installments) || 1
  const contaOrigemName = analyticalAccounts.find((a) => a.id === contaOrigemId)?.nome || ''
  const contaDestinoName = analyticalAccounts.find((a) => a.id === contaDestinoId)?.nome || ''

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) resetForm()
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Edite os dados do lançamento financeiro.'
              : 'Crie uma nova receita ou despesa com parcelas.'}
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
                      <SelectItem value="receivable">Receita (C)</SelectItem>
                      <SelectItem value="payable">Despesa (D)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center gap-2 pb-2">
                    <Switch checked={isAvulso} onCheckedChange={setIsAvulso} id="avulso" />
                    <Label htmlFor="avulso">Lançamento Avulso</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data Lançamento *</Label>
                <Input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                />
              </div>
              {!isAvulso && (
                <div className="space-y-2">
                  <Label>Entidade *</Label>
                  <EntityCombobox
                    type={type}
                    entityId={entityId}
                    entityName={entityName}
                    onSelect={(id: string, name: string) => {
                      setEntityId(id)
                      setEntityName(name)
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryAccounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.codigo_estrutural} - {a.nome} ({a.natureza})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Conta de Origem</Label>
                  <Select value={contaOrigemId} onValueChange={handleOrigemChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {analyticalAccounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.codigo_estrutural} - {a.nome} ({a.natureza})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Conta de Destino</Label>
                  <Select value={contaDestinoId} onValueChange={handleDestinoChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {analyticalAccounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.codigo_estrutural} - {a.nome} ({a.natureza})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nº de Parcelas</Label>
                <Input
                  type="number"
                  min="1"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                />
              </div>
              {installmentPreview.length > 0 && parseFloat(totalAmount) > 0 && (
                <div className="text-sm text-muted-foreground">
                  {numInstallments}x de {formatCurrency(installmentPreview[0]?.amount || 0)}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <ConferenceView
              type={type}
              entryDate={entryDate}
              entityName={entityName}
              isAvulso={isAvulso}
              categoryName={categoryName}
              description={description}
              totalAmount={totalAmount}
              installments={installmentPreview}
              contaOrigemName={contaOrigemName}
              contaDestinoName={contaDestinoName}
            />
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
            {step === 3 ? (isEdit ? 'Salvar Alterações' : 'Criar Lançamento') : 'Próximo'}
            {step < 3 && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
