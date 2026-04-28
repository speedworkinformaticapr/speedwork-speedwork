import { useTranslation } from '@/hooks/use-translation'
import { useCartStore } from '@/stores/useCartStore'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Cart() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items, updateQuantity, removeFromCart } = useCartStore()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (!user) return null

  const subtotal = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0)

  return (
    <div className="min-h-screen bg-secondary/30 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-montserrat font-black text-foreground mb-8 uppercase tracking-tight animate-fade-in-up">
          {t('shop.cart')}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-background rounded-3xl border border-border/50 animate-fade-in-up shadow-sm">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('shop.emptyCart')}</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t('shop.desc')}</p>
            <Button
              asChild
              size="lg"
              className="rounded-full px-10 font-bold shadow-lg shadow-primary/20"
            >
              <Link to="/store">{t('shop.title')}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, i) => (
                <Card
                  key={item.id}
                  className="animate-fade-in-up border-border/50 hover:border-primary/30 transition-colors"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="w-full sm:w-28 sm:h-28 aspect-[4/3] sm:aspect-square bg-secondary rounded-xl overflow-hidden shrink-0">
                      <img
                        src={
                          item.product?.image_url ||
                          'https://img.usecurling.com/p/200/200?q=product'
                        }
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="font-bold text-lg line-clamp-2">{item.product?.name}</h3>
                      <p className="text-primary font-black text-xl mt-2">
                        R$ {item.product?.price?.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 shrink-0 mt-2 sm:mt-0">
                      <div className="flex items-center bg-secondary rounded-full p-1 border border-border/50">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-background shadow-sm hover:text-primary"
                          onClick={() => updateQuantity(user.id, item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-10 text-center font-bold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-background shadow-sm hover:text-primary"
                          onClick={() => updateQuantity(user.id, item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-full h-10 w-10 shrink-0 transition-colors"
                        onClick={() => removeFromCart(user.id, item.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card
                className="sticky top-28 animate-fade-in-up border-border/50 shadow-md"
                style={{ animationDelay: '200ms' }}
              >
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-6">Resumo do Pedido</h3>
                  <div className="space-y-4 mb-6 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('shop.subtotal')}</span>
                      <span className="font-semibold text-base">R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Frete</span>
                      <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                        Grátis
                      </span>
                    </div>
                    <div className="border-t border-border/50 pt-4 flex justify-between items-center">
                      <span className="font-bold text-lg">{t('shop.total')}</span>
                      <span className="font-black text-3xl text-foreground">
                        R$ {subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full rounded-xl font-bold py-6 text-lg gap-2 shadow-lg shadow-primary/20"
                  >
                    <Link to="/checkout">
                      {t('shop.checkout')} <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Pagamento seguro com encriptação SSL
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
