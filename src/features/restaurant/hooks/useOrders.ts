import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { OrderStatus } from '@/features/restaurant/types'
import { restaurantKeys } from '@/features/restaurant/api'
import { merchantOrderService, type MerchantOrderFilters } from '@/features/restaurant/services/order.service'
import { playNewOrderSound } from '@/features/restaurant/utils'
import { useRestaurantContext } from './useRestaurantContext'

export function useMerchantOrders(filters: MerchantOrderFilters = {}) {
  const { data: ctx } = useRestaurantContext()
  const restaurantId = ctx?.restaurantId
  const queryClient = useQueryClient()
  const knownIds = useRef<Set<string>>(new Set())

  const query = useQuery({
    queryKey: restaurantKeys.orders.list(restaurantId ?? '', filters as Record<string, unknown>),
    queryFn: () => merchantOrderService.getOrders(restaurantId!, filters),
    enabled: Boolean(restaurantId),
    refetchInterval: 30_000,
  })

  useEffect(() => {
    if (!restaurantId) return

    const channel = supabase
      .channel(`merchant-orders-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          void queryClient.invalidateQueries({
            queryKey: restaurantKeys.orders.all(restaurantId),
          })
          void queryClient.invalidateQueries({
            queryKey: restaurantKeys.dashboard(restaurantId),
          })

          if (payload.eventType === 'INSERT') {
            const id = (payload.new as { id?: string }).id
            if (id && !knownIds.current.has(id)) {
              knownIds.current.add(id)
              playNewOrderSound()
              toast.success('New order received', {
                description: 'Check the live orders board.',
              })
            }
          }
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [restaurantId, queryClient])

  useEffect(() => {
    for (const order of query.data ?? []) {
      knownIds.current.add(order.id)
    }
  }, [query.data])

  return query
}

export function useMerchantOrder(orderId: string | undefined) {
  const { data: ctx } = useRestaurantContext()
  const restaurantId = ctx?.restaurantId
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: restaurantKeys.orders.detail(orderId ?? ''),
    queryFn: () => merchantOrderService.getOrder(orderId!, restaurantId!),
    enabled: Boolean(orderId && restaurantId),
  })

  useEffect(() => {
    if (!orderId || !restaurantId) return
    const channel = supabase
      .channel(`merchant-order-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        () => {
          void queryClient.invalidateQueries({
            queryKey: restaurantKeys.orders.detail(orderId),
          })
        },
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [orderId, restaurantId, queryClient])

  return query
}

export function useUpdateOrderStatus() {
  const { data: ctx } = useRestaurantContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      merchantOrderService.updateOrderStatus(orderId, ctx!.restaurantId, status),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: restaurantKeys.orders.all(ctx!.restaurantId) })
      void queryClient.invalidateQueries({
        queryKey: restaurantKeys.orders.detail(vars.orderId),
      })
      void queryClient.invalidateQueries({
        queryKey: restaurantKeys.dashboard(ctx!.restaurantId),
      })
      toast.success(`Order marked ${vars.status}`)
    },
    onError: (error: Error) => {
      toast.error('Could not update order', { description: error.message })
    },
  })
}
