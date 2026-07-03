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
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/financial-utils'

interface PaymentRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  charge: any
  onSuccess: () => void
}

export function PaymentRegistrationModal({
  open,
  onOpenChange,
  charge,
  onSuccess,
}: PaymentRegistrationModalProps) {
  const [paymentDate, setPaymentDate] = useState('')
  const [realizedAmount, setRealizedAmount] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (charge && open) {
      setPaymentDate(charge.payment_date || new Date().toISOString().split('T')[0])
      setRealizedAmount(
        charge.realized_amount ? String(charge.realized_amount) : String(charge.amount || ''),
      )
    }
  }, [charge, open])

  const handleSave = async () => {
    if (!charge) return
    setLoading(true)
    try {
      const amount = Number(realizedAmount)
      if (!paymentDate) throw new Error('Data do pagamento é obrigatória')
      if (amount <= 0) throw new Error('Valor deve ser maior que zero')

      const status = amount >= Number(charge.amount) ? 'pago' : 'parcial'

      const { error } = await supabase
        .from('financial_charges')
        .update({
          payment_date: paymentDate,
          realized_amount: amount,
          status,
        })
        .eq('id', charge.id)

      if (error) throw error
      toast.success('Baixa registrada com sucesso!')
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error('Erro ao registrar baixa: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Baixa</DialogTitle>
          <DialogDescription>
            {charge?.description} — Valor previsto: {formatCurrency(charge?.amount || 0)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Data do Pagamento/Recebimento</Label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Valor Pago/Recebido</Label>
            <Input
              type="number"
              step="0.01"
              value={realizedAmount}
              onChange={(e) => setRealizedAmount(e.target.value)}
              placeholder="0,00"
            />
            <p className="text-xs text-muted-foreground">
              Status será definido como{' '}
              {Number(realizedAmount) >= Number(charge?.amount || 0) ? '"Pago"' : '"Parcial"'}{' '}
              automaticamente.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar Baixa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
