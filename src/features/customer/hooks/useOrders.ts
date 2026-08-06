import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerKeys } from '@/features/customer/api'
import { orderService, type OrderListFilters } from '@/features/customer/services/order.service'
import type { CreateOrderPayload } from '@/features/customer/types'
import { useAuth } from '@/features/auth'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

export function useOrders(filters: OrderListFilters = {}) {
  const { user } = useAuth()

  return useQuery({
    queryKey: customerKeys.orders.list(filters as Record<string, unknown>),
    queryFn: () => orderService.getOrders(user!.id, filters),
    enabled: Boolean(user?.id),
  })
}

export function useRecentOrders(limit = 5) {
  const { user } = useAuth()

  return useQuery({
    queryKey: customerKeys.orders.recent(),
    queryFn: () => orderService.getRecentOrders(user!.id, limit),
    enabled: Boolean(user?.id),
  })
}

export function useOrder(orderId: string | undefined) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: customerKeys.orders.detail(orderId ?? ''),
    queryFn: () => orderService.getOrder(orderId!, user!.id),
    enabled: Boolean(orderId && user?.id),
  })

  useEffect(() => {
    if (!orderId || !user?.id) return

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: customerKeys.orders.detail(orderId),
          })
          void queryClient.invalidateQueries({ queryKey: customerKeys.orders.lists() })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [orderId, user?.id, queryClient])

  return query
}

export function useCreateOrder() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => {
      if (!user?.id) throw new Error('You must be signed in to place an order.')
      return orderService.createOrder(user.id, payload)
    },
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.orders.all })
      toast.success('Order placed', {
        description: `Order ${order.order_number} is on its way to the kitchen.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Order failed', {
        description: error.message || 'Unable to create your order. Please try again.',
      })
    },
  })
}
