import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartLineItem } from '@/features/customer/types'
import { calculateCartTotals } from '@/features/customer/utils'
import { toast } from 'sonner'

interface CartState {
  items: CartLineItem[]
  restaurantId: string | null
  restaurantName: string | null
  discount: number
  addItem: (item: Omit<CartLineItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (menuItemId: string) => void
  setQuantity: (menuItemId: string, quantity: number) => void
  increment: (menuItemId: string) => void
  decrement: (menuItemId: string) => void
  clearCart: () => void
  setDiscount: (discount: number) => void
  getTotals: () => ReturnType<typeof calculateCartTotals>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,
      discount: 0,

      addItem: (item) => {
        const quantity = item.quantity ?? 1
        const state = get()

        if (state.restaurantId && state.restaurantId !== item.restaurantId) {
          toast.error('Cart locked to one restaurant', {
            description: `Clear your ${state.restaurantName ?? 'current'} cart before ordering from another restaurant.`,
          })
          return
        }

        const existing = state.items.find((line) => line.menuItemId === item.menuItemId)
        if (existing) {
          set({
            items: state.items.map((line) =>
              line.menuItemId === item.menuItemId
                ? { ...line, quantity: line.quantity + quantity }
                : line,
            ),
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
          })
        } else {
          set({
            items: [
              ...state.items,
              {
                menuItemId: item.menuItemId,
                restaurantId: item.restaurantId,
                restaurantName: item.restaurantName,
                name: item.name,
                price: item.price,
                image: item.image,
                preparationTime: item.preparationTime,
                quantity,
              },
            ],
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
          })
        }

        toast.success('Added to cart', { description: item.name })
      },

      removeItem: (menuItemId) => {
        const items = get().items.filter((item) => item.menuItemId !== menuItemId)
        set({
          items,
          restaurantId: items[0]?.restaurantId ?? null,
          restaurantName: items[0]?.restaurantName ?? null,
          discount: items.length ? get().discount : 0,
        })
      },

      setQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId)
          return
        }
        set({
          items: get().items.map((item) =>
            item.menuItemId === menuItemId ? { ...item, quantity } : item,
          ),
        })
      },

      increment: (menuItemId) => {
        const item = get().items.find((line) => line.menuItemId === menuItemId)
        if (!item) return
        get().setQuantity(menuItemId, item.quantity + 1)
      },

      decrement: (menuItemId) => {
        const item = get().items.find((line) => line.menuItemId === menuItemId)
        if (!item) return
        get().setQuantity(menuItemId, item.quantity - 1)
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: null, discount: 0 }),

      setDiscount: (discount) => set({ discount: Math.max(0, discount) }),

      getTotals: () => calculateCartTotals(get().items, get().discount),
    }),
    {
      name: 'orderflow-cart',
      partialize: (state) => ({
        items: state.items,
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        discount: state.discount,
      }),
    },
  ),
)
