import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Copy, CreditCard, QrCode, CheckCircle2 } from 'lucide-react'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chargeId: string
  athleteId: string | null
  amount: number
  description: string
  onSuccess: () => void
}

export function PaymentModal({
  open,
  onOpenChange,
  chargeId,
  athleteId,
  amount,
  description,
  onSuccess,
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [pixData, setPixData] = useState<{ qr_code: string; copy_paste: string } | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [currentIntentId, setCurrentIntentId] = useState<string | null>(null)
  const { toast } = useToast()

  const [stripeConfig, setStripeConfig] = useState<any>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

  useEffect(() => {
    if (!currentIntentId) return

    const interval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('stripe_payments')
          .select('status')
          .eq('payment_intent_id', currentIntentId)
          .maybeSingle()

        if (data?.status === 'succeeded') {
          clearInterval(interval)
          setIsSuccess(true)
          toast({
            title: 'Pagamento confirmado com sucesso!',
            className: 'bg-[#4ADE80] text-white border-none',
          })
          setTimeout(() => {
            onSuccess()
            onOpenChange(false)
            setIsSuccess(false)
            setPixData(null)
            setCurrentIntentId(null)
          }, 2000)
        } else if (data?.status === 'failed') {
          clearInterval(interval)
          toast({
            title: 'Pagamento falhou',
            description: 'Tente gerar um novo código.',
            variant: 'destructive',
          })
          setCurrentIntentId(null)
          setPixData(null)
        }
      } catch (error) {
        console.error('Error polling payment status', error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [currentIntentId, onSuccess, onOpenChange, toast])

  const handleProcessPayment = async (method: 'card' | 'pix') => {
    setIsProcessing(true)
    try {
      const { data, error } = await supabase.functions.invoke('process-stripe-payment', {
        body: {
          charge_id: chargeId,
          atleta_id: athleteId,
          valor: amount,
          metodo_pagamento: method,
        },
      })

      if (error) throw error
      if (data?.status === 'error') throw new Error(data.error)

      if (method === 'pix') {
        setPixData({
          qr_code: data.pix_qr_code,
          copy_paste: data.pix_copy_paste,
        })
        setCurrentIntentId(data.payment_intent_id)
      } else {
        await simulateWebhookSuccess(data.payment_intent_id)
        setIsSuccess(true)
        toast({ title: 'Pagamento aprovado!' })
        setTimeout(() => {
          onSuccess()
          onOpenChange(false)
          setIsSuccess(false)
        }, 2000)
      }
    } catch (err: any) {
      toast({ title: 'Erro ao processar', description: err.message, variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  const simulateWebhookSuccess = async (paymentIntentId: string) => {
    await supabase
      .from('stripe_payments' as any)
      .update({ status: 'succeeded', data_pagamento: new Date().toISOString() })
      .eq('payment_intent_id', paymentIntentId)
    await supabase
      .from('financial_charges' as any)
      .update({ status: 'pago', payment_date: new Date().toISOString().split('T')[0] })
      .eq('id', chargeId)
  }

  const handleCopyPix = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.copy_paste)
      toast({ title: 'Código copiado!' })
    }
  }

  useEffect(() => {
    if (open) {
      supabase
        .from('stripe_config' as any)
        .select('*')
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data) setStripeConfig(data)
        })
    }
  }, [open])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const finalCardAmount = stripeConfig?.pass_fees_to_customer
    ? amount * (1 + (stripeConfig.card_fee_percentage || 0) / 100) +
      (stripeConfig.card_fee_fixed || 0)
    : amount

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          setPixData(null)
          setIsSuccess(false)
          setCurrentIntentId(null)
        }
        onOpenChange(val)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento de Fatura</DialogTitle>
          <DialogDescription>
            {description} - {formatCurrency(amount)}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium">Pagamento Concluído</h3>
            <p className="text-muted-foreground">Obrigado pelo seu pagamento.</p>
          </div>
        ) : (
          <Tabs defaultValue="card" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card">
                <CreditCard className="w-4 h-4 mr-2" /> Cartão
              </TabsTrigger>
              <TabsTrigger value="pix">
                <QrCode className="w-4 h-4 mr-2" /> Pix
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Número do Cartão (Simulado)</Label>
                  <Input
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Validade</Label>
                    <Input
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    className="w-full"
                    onClick={() => handleProcessPayment('card')}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Pagar {formatCurrency(finalCardAmount)}
                  </Button>
                  {stripeConfig?.pass_fees_to_customer && finalCardAmount > amount && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Inclui taxa de conveniência do cartão de crédito.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pix" className="mt-4">
              {pixData ? (
                <div className="flex flex-col items-center space-y-4 py-4">
                  <div className="p-4 bg-white border rounded-lg">
                    <img src={pixData.qr_code} alt="QR Code Pix" className="w-48 h-48" />
                  </div>
                  <div className="w-full space-y-2">
                    <Label>Código Pix Copia e Cola</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={pixData.copy_paste} />
                      <Button variant="outline" size="icon" onClick={handleCopyPix}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-xs text-muted-foreground"
                    onClick={() => {
                      simulateWebhookSuccess(currentIntentId || 'simulated_pix')
                      setIsSuccess(true)
                      setTimeout(() => {
                        onSuccess()
                        onOpenChange(false)
                        setIsSuccess(false)
                        setPixData(null)
                        setCurrentIntentId(null)
                      }, 2000)
                    }}
                  >
                    (Dev) Simular Pagamento Realizado
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <QrCode className="w-12 h-12 text-muted-foreground" />
                  <p className="text-center text-muted-foreground text-sm">
                    Gere um QR Code para pagamento instantâneo via Pix.
                  </p>
                  <Button onClick={() => handleProcessPayment('pix')} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Gerar Código Pix
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
