import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type CartItem = {
  id: string
  product_id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image_url: string | null
    stock: number | null
  }
}

interface CartStore {
  items: CartItem[]
  loading: boolean
  fetchCart: (userId: string) => Promise<void>
  addToCart: (userId: string, productId: string) => Promise<void>
  removeFromCart: (userId: string, itemId: string) => Promise<void>
  updateQuantity: (userId: string, itemId: string, quantity: number) => Promise<void>
  clearCart: (userId: string) => Promise<void>
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  loading: false,
  fetchCart: async (userId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        product:products (
          id,
          name,
          price,
          image_url,
          stock
        )
      `)
      .eq('user_id', userId)

    if (!error && data) {
      set({ items: data as any, loading: false })
    } else {
      set({ loading: false })
    }
  },
  addToCart: async (userId, productId) => {
    const { items } = get()
    const existing = items.find((i) => i.product_id === productId)

    if (existing) {
      await get().updateQuantity(userId, existing.id, existing.quantity + 1)
      toast.success('Quantidade atualizada no carrinho')
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({ user_id: userId, product_id: productId, quantity: 1 })
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            id,
            name,
            price,
            image_url,
            stock
          )
        `)
        .single()

      if (!error && data) {
        set({ items: [...items, data as any] })
        toast.success('Produto adicionado ao carrinho')
      } else {
        toast.error('Erro ao adicionar produto')
      }
    }
  },
  removeFromCart: async (userId, itemId) => {
    await supabase.from('cart_items').delete().eq('id', itemId).eq('user_id', userId)
    set({ items: get().items.filter((i) => i.id !== itemId) })
  },
  updateQuantity: async (userId, itemId, quantity) => {
    if (quantity <= 0) {
      await get().removeFromCart(userId, itemId)
      return
    }
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .eq('user_id', userId)
      .select(`
        id,
        product_id,
        quantity,
        product:products (
          id,
          name,
          price,
          image_url,
          stock
        )
      `)
      .single()

    if (!error && data) {
      set({ items: get().items.map((i) => (i.id === itemId ? (data as any) : i)) })
    }
  },
  clearCart: async (userId) => {
    await supabase.from('cart_items').delete().eq('user_id', userId)
    set({ items: [] })
  },
}))
