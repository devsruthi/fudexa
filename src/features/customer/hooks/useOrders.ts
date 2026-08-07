import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerKeys } from '@/features/customer/api'
import { orderService, type OrderListFilters } from '@/features/customer/services/order.service'
import type { CreateOrderPayload } from '@/features/customer/types'
import { useAuth } from '@/features/auth'
import { useRealtimeOrders } from '@/features/realtime/hooks/useRealtimeOrders'

export function useOrders(filters: OrderListFilters = {}) {
  const { user } = useAuth()

  useRealtimeOrders({
    customerId: user?.id,
    enabled: Boolean(user?.id),
  })

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

  useRealtimeOrders({
    orderId,
    customerId: user?.id,
    enabled: Boolean(orderId && user?.id),
  })

  return useQuery({
    queryKey: customerKeys.orders.detail(orderId ?? ''),
    queryFn: () => orderService.getOrder(orderId!, user!.id),
    enabled: Boolean(orderId && user?.id),
  })
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
