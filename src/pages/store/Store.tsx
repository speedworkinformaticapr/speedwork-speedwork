import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/use-translation'
import { supabase } from '@/lib/supabase/client'
import { useCartStore } from '@/stores/useCartStore'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ShoppingCart, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSeo } from '@/hooks/use-seo'

export default function Store() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToCart } = useCartStore()

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [category, setCategory] = useState<string>('all')
  const [maxPrice, setMaxPrice] = useState<number>(500)
  const [minRating, setMinRating] = useState<number>(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProducts(data)
      const cats = Array.from(new Set(data.map((p) => p.category).filter(Boolean))) as string[]
      setCategories(cats)
    }
    setLoading(false)
  }

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast.error(t('auth.loginDesc'))
      navigate('/login')
      return
    }
    await addToCart(user.id, productId)
  }

  useSeo({
    title: 'Loja Oficial - Footgolf PR',
    description:
      'Adquira equipamentos, vestuário e acessórios oficiais de Footgolf. Produtos selecionados para atletas de todos os níveis.',
    schema:
      products.length > 0
        ? {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: products.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Product',
                name: p.name,
                description: p.description || p.name,
                offers: {
                  '@type': 'Offer',
                  price: p.price,
                  priceCurrency: 'BRL',
                },
              },
            })),
          }
        : undefined,
  })

  const filteredProducts = products.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (p.price > maxPrice) return false
    if ((p.rating || 0) < minRating) return false
    return true
  })

  return (
    <div className="min-h-screen bg-secondary/30 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-montserrat font-black text-foreground mb-4 uppercase tracking-tight">
            {t('shop.title')}
          </h1>
          <p className="text-lg text-muted-foreground">{t('shop.desc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div
            className="lg:col-span-1 space-y-6 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50 sticky top-28">
              <h3 className="font-bold text-lg mb-6">{t('shop.filters')}</h3>

              <div className="space-y-8">
                <div>
                  <label className="text-sm font-semibold mb-2 block">{t('courses.search')}</label>
                  <Input
                    placeholder={t('courses.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">{t('shop.category')}</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder={t('shop.allCategories')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('shop.allCategories')}</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-4 flex justify-between">
                    <span>{t('shop.maxPrice')}</span>
                    <span className="text-primary font-bold">R$ {maxPrice}</span>
                  </label>
                  <Slider
                    value={[maxPrice]}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={([val]) => setMaxPrice(val)}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-4 flex justify-between">
                    <span>{t('shop.minRating')}</span>
                    <span className="flex items-center gap-1">
                      {minRating} <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    </span>
                  </label>
                  <Slider
                    value={[minRating]}
                    min={0}
                    max={5}
                    step={0.5}
                    onValueChange={([val]) => setMinRating(val)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[400px] bg-muted animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-background rounded-2xl border border-border/50">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold">{t('tournaments.noEvents')}</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, i) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden group hover:shadow-xl transition-all duration-300 animate-fade-in-up border-border/50 hover:border-primary/30"
                    style={{ animationDelay: `${i * 50 + 100}ms` }}
                  >
                    <div className="aspect-square bg-secondary/50 relative overflow-hidden">
                      <img
                        src={product.image_url || 'https://img.usecurling.com/p/400/400?q=product'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {product.category && (
                        <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          {product.category}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-black text-foreground">
                          R$ {product.price?.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 text-sm font-bold bg-secondary px-2 py-1 rounded-md">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {product.rating?.toFixed(1) || '5.0'}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-5 pt-0">
                      <Button
                        onClick={() => handleAddToCart(product.id)}
                        className="w-full rounded-xl font-bold gap-2 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t('shop.addToCart')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
