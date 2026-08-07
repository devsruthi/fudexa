import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { OrderStatus, OrderWithDetails } from '@/features/restaurant/types'
import { restaurantKeys } from '@/features/restaurant/api'
import {
  merchantOrderService,
  OrderConflictError,
  type MerchantOrderFilters,
} from '@/features/restaurant/services/order.service'
import { useRestaurantContext } from './useRestaurantContext'
import { useRealtimeOrders } from '@/features/realtime/hooks/useRealtimeOrders'
import { offlineQueue } from '@/features/realtime/services'
import { useRealtimeStore } from '@/features/realtime/store/realtime.store'

export function useMerchantOrders(filters: MerchantOrderFilters = {}) {
  const { data: ctx } = useRestaurantContext()
  const restaurantId = ctx?.restaurantId

  // Cache invalidation only — toasts/sound owned by RestaurantRealtimeBridge
  useRealtimeOrders({
    restaurantId,
    notifyNewOrders: false,
    enabled: Boolean(restaurantId),
  })

  return useQuery({
    queryKey: restaurantKeys.orders.list(restaurantId ?? '', filters as Record<string, unknown>),
    queryFn: () => merchantOrderService.getOrders(restaurantId!, filters),
    enabled: Boolean(restaurantId),
    refetchInterval: 60_000,
  })
}

export function useMerchantOrder(orderId: string | undefined) {
  const { data: ctx } = useRestaurantContext()
  const restaurantId = ctx?.restaurantId

  useRealtimeOrders({
    orderId,
    restaurantId,
    enabled: Boolean(orderId && restaurantId),
  })

  return useQuery({
    queryKey: restaurantKeys.orders.detail(orderId ?? ''),
    queryFn: () => merchantOrderService.getOrder(orderId!, restaurantId!),
    enabled: Boolean(orderId && restaurantId),
  })
}

export function useUpdateOrderStatus() {
  const { data: ctx } = useRestaurantContext()
  const queryClient = useQueryClient()
  const isOnline = useRealtimeStore((s) => s.isOnline)

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      expectedUpdatedAt,
      expectedVersion,
    }: {
      orderId: string
      status: OrderStatus
      expectedUpdatedAt?: string
      expectedVersion?: number
    }) => {
      if (!ctx?.restaurantId) throw new Error('Restaurant not loaded')

      if (!isOnline || !navigator.onLine) {
        offlineQueue.enqueue({
          type: 'update_order_status',
          payload: {
            orderId,
            restaurantId: ctx.restaurantId,
            status,
            expectedUpdatedAt,
            expectedVersion,
          },
        })
        useRealtimeStore.getState().setQueueSnapshot(offlineQueue.peek())
        return { queued: true as const, orderId, status }
      }

      const order = await merchantOrderService.updateOrderStatus(
        orderId,
        ctx.restaurantId,
        status,
        { expectedUpdatedAt, expectedVersion },
      )
      return { queued: false as const, order }
    },
    onMutate: async ({ orderId, status }) => {
      if (!ctx?.restaurantId) return
      const restaurantId = ctx.restaurantId
      await queryClient.cancelQueries({ queryKey: restaurantKeys.orders.all(restaurantId) })

      const previousLists = queryClient.getQueriesData<OrderWithDetails[]>({
        queryKey: restaurantKeys.orders.all(restaurantId),
      })

      queryClient.setQueriesData<OrderWithDetails[]>(
        { queryKey: restaurantKeys.orders.all(restaurantId) },
        (old) =>
          old?.map((o) =>
            o.id === orderId
              ? { ...o, status, updated_at: new Date().toISOString() }
              : o,
          ),
      )

      const detailKey = restaurantKeys.orders.detail(orderId)
      const previousDetail = queryClient.getQueryData<OrderWithDetails>(detailKey)
      if (previousDetail) {
        queryClient.setQueryData(detailKey, { ...previousDetail, status })
      }

      return { previousLists, previousDetail, detailKey, restaurantId }
    },
    onError: (error, _vars, context) => {
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data)
        }
      }
      if (context?.previousDetail && context.detailKey) {
        queryClient.setQueryData(context.detailKey, context.previousDetail)
      }

      if (error instanceof OrderConflictError) {
        toast.error('Conflict detected', {
          description: error.message,
        })
        if (context?.restaurantId) {
          void queryClient.invalidateQueries({
            queryKey: restaurantKeys.orders.all(context.restaurantId),
          })
        }
        return
      }

      toast.error('Could not update order', { description: (error as Error).message })
    },
    onSuccess: (result) => {
      if ('queued' in result && result.queued) {
        toast.message('Saved offline', {
          description: 'Order status will sync when you reconnect.',
        })
        return
      }
      toast.success(`Order marked ${result.order.status}`)
    },
    onSettled: (_data, _error, vars) => {
      if (!ctx?.restaurantId) return
      void queryClient.invalidateQueries({ queryKey: restaurantKeys.orders.all(ctx.restaurantId) })
      void queryClient.invalidateQueries({
        queryKey: restaurantKeys.orders.detail(vars.orderId),
      })
      void queryClient.invalidateQueries({
        queryKey: restaurantKeys.dashboard(ctx.restaurantId),
      })
    },
  })
}
