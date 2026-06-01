import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export function AsaasBillingDialog({ open, onOpenChange, orcamentoId, onSuccess }: any) {
  const [billingType, setBillingType] = useState('PIX')
  const [installmentCount, setInstallmentCount] = useState('1')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!dueDate)
      return toast({
        title: 'Aviso',
        description: 'Informe a data de vencimento.',
        variant: 'destructive',
      })
    setLoading(true)
    try {
      const { error } = await supabase.functions.invoke('create-asaas-charge', {
        body: {
          orcamento_id: orcamentoId,
          billingType,
          installmentCount: Number(installmentCount),
          dueDate,
        },
      })
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Cobrança gerada no Asaas com sucesso!' })
      onSuccess?.()
      onOpenChange(false)
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Falha ao gerar cobrança',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar Cobrança - Asaas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Método de Pagamento</Label>
            <Select value={billingType} onValueChange={setBillingType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="BOLETO">Boleto</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Número de Parcelas</Label>
            <Input
              type="number"
              min="1"
              max="12"
              value={installmentCount}
              onChange={(e) => setInstallmentCount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Vencimento da 1ª Parcela</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Gerar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
