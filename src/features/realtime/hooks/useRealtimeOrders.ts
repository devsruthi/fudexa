import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { channelKeys } from '@/features/realtime/channels'
import { realtimeService } from '@/features/realtime/services'
import { playNewOrderSound } from '@/features/restaurant/utils'
import { restaurantKeys } from '@/features/restaurant/api'
import { customerKeys } from '@/features/customer/api'

interface UseRealtimeOrdersOptions {
  restaurantId?: string
  customerId?: string
  orderId?: string
  /** Play sound + toast for new restaurant orders */
  notifyNewOrders?: boolean
  enabled?: boolean
}

/**
 * Subscribe to order changes and invalidate relevant query caches.
 * Deduplicated via RealtimeService channel keys.
 */
export function useRealtimeOrders(options: UseRealtimeOrdersOptions) {
  const {
    restaurantId,
    customerId,
    orderId,
    notifyNewOrders = false,
    enabled = true,
  } = options
  const queryClient = useQueryClient()
  const knownIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!enabled) return
    const unsubs: Array<() => void> = []

    if (restaurantId) {
      unsubs.push(
        realtimeService.subscribe(
          {
            key: channelKeys.restaurantOrders(restaurantId),
            table: 'orders',
            event: '*',
            filter: `restaurant_id=eq.${restaurantId}`,
          },
          (payload) => {
            void queryClient.invalidateQueries({
              queryKey: restaurantKeys.orders.all(restaurantId),
            })
            void queryClient.invalidateQueries({
              queryKey: restaurantKeys.dashboard(restaurantId),
            })
            void queryClient.invalidateQueries({
              queryKey: restaurantKeys.analytics.all(restaurantId),
            })

            if (payload.eventType === 'INSERT' && notifyNewOrders) {
              const row = payload.new as { id?: string; status?: string }
              if (row.id && !knownIds.current.has(row.id)) {
                knownIds.current.add(row.id)
                playNewOrderSound()
                toast.success('New order received', {
                  description: 'Open Kitchen or Orders to start preparing.',
                })
              }
            }

            if (payload.eventType === 'UPDATE') {
              const row = payload.new as { id?: string; status?: string }
              const prev = payload.old as { status?: string }
              if (row.status === 'Cancelled' && prev.status !== 'Cancelled') {
                toast.warning('Order cancelled', {
                  description: 'An order was cancelled.',
                })
              }
            }
          },
        ),
      )
    }

    if (customerId) {
      unsubs.push(
        realtimeService.subscribe(
          {
            key: channelKeys.customerOrders(customerId),
            table: 'orders',
            event: '*',
            filter: `customer_id=eq.${customerId}`,
          },
          () => {
            void queryClient.invalidateQueries({ queryKey: customerKeys.orders.all })
          },
        ),
      )
    }

    if (orderId) {
      unsubs.push(
        realtimeService.subscribe(
          {
            key: channelKeys.orderDetail(orderId),
            table: 'orders',
            event: '*',
            filter: `id=eq.${orderId}`,
          },
          (payload) => {
            void queryClient.invalidateQueries({
              queryKey: customerKeys.orders.detail(orderId),
            })
            void queryClient.invalidateQueries({
              queryKey: restaurantKeys.orders.detail(orderId),
            })
            void queryClient.invalidateQueries({ queryKey: customerKeys.orders.lists() })

            if (payload.eventType === 'UPDATE') {
              const row = payload.new as { status?: string }
              if (row.status) {
                const labels: Record<string, string> = {
                  Accepted: 'Your order was accepted',
                  Preparing: 'Kitchen is preparing your order',
                  Ready: 'Your order is ready',
                  OutForDelivery: 'Your order is on the way',
                  Completed: 'Order completed — enjoy!',
                  Cancelled: 'Your order was cancelled',
                }
                const msg = labels[row.status]
                if (msg) toast.message(msg)
              }
            }
          },
        ),
      )
    }

    return () => {
      for (const unsub of unsubs) unsub()
    }
  }, [restaurantId, customerId, orderId, notifyNewOrders, enabled, queryClient])
}
