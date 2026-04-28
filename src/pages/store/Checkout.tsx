import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/use-translation'
import { useCartStore } from '@/stores/useCartStore'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { CreditCard, QrCode, Ticket, ShieldCheck, MapPin } from 'lucide-react'

export default function Checkout() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items, clearCart } = useCartStore()

  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) navigate('/login')
    if (items.length === 0) navigate('/store')
  }, [user, items, navigate])

  const subtotal = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0)
  const total = Math.max(0, subtotal - discount)

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'FOOTGOLF10') {
      setDiscount(subtotal * 0.1)
      toast.success('Cupom FOOTGOLF10 aplicado com sucesso!')
    } else {
      toast.error('Cupom inválido')
      setDiscount(0)
    }
  }

  const handlePlaceOrder = async () => {
    if (!address) {
      toast.error('Informe o endereço de entrega completo')
      return
    }

    setLoading(true)
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          total_price: total,
          status: 'pending',
          delivery_address: address,
          payment_method: paymentMethod,
          discount: discount,
        } as any)
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

      if (itemsError) throw itemsError

      await clearCart(user!.id)

      const { data: prof } = await supabase
        .from('profiles')
        .select('autoriza_whatsapp, telefone_whatsapp')
        .eq('id', user!.id)
        .single()
      if (prof?.autoriza_whatsapp && prof?.telefone_whatsapp) {
        const { error: wppErr } = await supabase.functions.invoke('enviar_whatsapp', {
          body: {
            cliente_id: user!.id,
            telefone_destino: prof.telefone_whatsapp,
            tipo_mensagem: 'pedido_confirmacao',
            variaveis: {
              cliente_nome: user!.user_metadata?.name || 'Cliente',
              numero_pedido: order.id.slice(0, 8).toUpperCase(),
              data_pedido: new Date().toLocaleDateString(),
              valor_total: total.toFixed(2),
              itens_resumo: items.map((i) => i.product?.name).join(', '),
            },
          },
        })
        if (!wppErr) {
          toast.success('Pedido confirmado! Uma mensagem foi enviada no seu WhatsApp.')
        } else {
          toast.success('Pedido confirmado! (Falha ao enviar WhatsApp)')
        }
      } else {
        toast.success(t('shop.orderSuccess'))
      }

      navigate('/orders')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao finalizar pedido')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="min-h-screen bg-secondary/30 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-montserrat font-black text-foreground mb-8 uppercase tracking-tight animate-fade-in-up">
          {t('shop.checkout')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card
              className="animate-fade-in-up border-border/50"
              style={{ animationDelay: '100ms' }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold">{t('shop.address')}</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input
                      id="address"
                      placeholder="Rua, Número, Complemento, Bairro, CEP"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="animate-fade-in-up border-border/50"
              style={{ animationDelay: '200ms' }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold">{t('shop.paymentMethod')}</h2>
                </div>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-4"
                >
                  <div
                    className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border'}`}
                  >
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label
                      htmlFor="credit_card"
                      className="flex flex-1 items-center gap-3 cursor-pointer text-base"
                    >
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <span className="font-semibold">{t('shop.creditCard')}</span>
                    </Label>
                  </div>
                  {paymentMethod === 'credit_card' && (
                    <div className="pl-12 pr-4 pb-4 animate-fade-in text-sm text-muted-foreground">
                      {t('shop.cardInfo')} (Simulação para testes)
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <Input
                          placeholder="Número do Cartão"
                          className="col-span-2 bg-secondary/50"
                        />
                        <Input placeholder="MM/AA" className="bg-secondary/50" />
                        <Input placeholder="CVC" className="bg-secondary/50" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border'}`}
                  >
                    <RadioGroupItem value="pix" id="pix" />
                    <Label
                      htmlFor="pix"
                      className="flex flex-1 items-center gap-3 cursor-pointer text-base"
                    >
                      <QrCode className="w-5 h-5 text-muted-foreground" />
                      <span className="font-semibold">{t('shop.pix')}</span>
                    </Label>
                  </div>
                  {paymentMethod === 'pix' && (
                    <div className="pl-12 pr-4 pb-4 animate-fade-in text-sm text-muted-foreground">
                      {t('shop.pixInfo')} O código será exibido na próxima tela.
                    </div>
                  )}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card
              className="sticky top-28 animate-fade-in-up border-border/50 shadow-md"
              style={{ animationDelay: '300ms' }}
            >
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-6">Resumo</h3>

                <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2 scrollbar-thin">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-12 h-12 rounded bg-secondary overflow-hidden shrink-0">
                        <img
                          src={item.product?.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold line-clamp-1">{item.product?.name}</p>
                        <p className="text-muted-foreground">
                          {item.quantity}x R$ {item.product?.price?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-6 pt-6 border-t border-border/50 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-5 h-5 text-primary" />
                    <Input
                      placeholder="FOOTGOLF10"
                      className="h-10 bg-secondary/50 font-mono uppercase"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <Button variant="secondary" onClick={handleApplyCoupon}>
                      {t('shop.apply')}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('shop.subtotal')}</span>
                    <span className="font-medium text-base">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-primary font-medium animate-fade-in">
                      <span>Desconto</span>
                      <span>- R$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                      Grátis
                    </span>
                  </div>
                  <div className="border-t border-border/50 pt-4 flex justify-between items-center">
                    <span className="font-bold text-lg">{t('shop.total')}</span>
                    <span className="font-black text-3xl text-foreground">
                      R$ {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  className="w-full rounded-xl font-bold py-6 text-lg shadow-lg shadow-primary/20"
                  disabled={loading}
                >
                  {loading ? 'Processando...' : t('shop.placeOrder')}
                </Button>
                <div className="mt-6 text-center flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Transação Criptografada
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
