import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/use-translation'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Clock, CheckCircle2, Truck, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function Orders() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          quantity,
          price,
          product:products (
            name,
            image_url
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setOrders(data)
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground py-1">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {t('shop.paid')}
          </Badge>
        )
      case 'shipped':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white py-1">
            <Truck className="w-3.5 h-3.5 mr-1" /> {t('shop.shipped')}
          </Badge>
        )
      default:
        return (
          <Badge
            variant="secondary"
            className="text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 py-1"
          >
            <Clock className="w-3.5 h-3.5 mr-1" /> {t('shop.pending')}
          </Badge>
        )
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-secondary/30 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-montserrat font-black text-foreground mb-8 uppercase tracking-tight animate-fade-in-up">
          {t('shop.orders')}
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 bg-background rounded-3xl border border-border/50 animate-fade-in-up shadow-sm">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Nenhum pedido encontrado</h2>
            <p className="text-muted-foreground mb-8">
              Você ainda não realizou nenhuma compra em nossa loja.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-full px-10 font-bold shadow-lg shadow-primary/20"
            >
              <Link to="/store">Explorar Produtos</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, i) => (
              <Card
                key={order.id}
                className="animate-fade-in-up overflow-hidden border-border/50 hover:border-primary/30 transition-colors"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="bg-secondary/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                        Pedido
                      </p>
                      <p className="font-mono text-sm font-bold">#{order.id.split('-')[0]}</p>
                    </div>
                    <div className="h-8 w-px bg-border hidden sm:block"></div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                        {t('shop.date')}
                      </p>
                      <p className="text-sm font-bold">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-border hidden sm:block"></div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                        {t('shop.total')}
                      </p>
                      <p className="text-sm font-black text-primary">
                        R$ {order.total_price?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 group">
                        <div className="w-20 h-20 rounded-xl bg-secondary overflow-hidden shrink-0">
                          <img
                            src={item.product?.image_url}
                            alt={item.product?.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base line-clamp-1">{item.product?.name}</p>
                          <p className="text-sm font-medium text-muted-foreground mt-1">
                            {item.quantity} un. <span className="mx-2">•</span> R${' '}
                            {item.price?.toFixed(2)}
                          </p>
                        </div>
                        <div className="font-black text-lg hidden sm:block">
                          R$ {(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="bg-secondary/30 p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                        Endereço de Entrega
                      </p>
                      <p className="font-medium text-foreground">
                        {order.delivery_address || 'Não informado'}
                      </p>
                    </div>
                    <div className="bg-secondary/30 p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                        Forma de Pagamento
                      </p>
                      <p className="font-medium text-foreground flex items-center gap-2">
                        {order.payment_method === 'credit_card' ? 'Cartão de Crédito' : 'Pix'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
