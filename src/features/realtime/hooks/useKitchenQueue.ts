import { useCallback, useEffect, useMemo, useState } from 'react'
import type { OrderStatus, OrderWithDetails } from '@/features/restaurant/types'
import { useMerchantOrders, useUpdateOrderStatus } from '@/features/restaurant/hooks'

export const KITCHEN_COLUMNS: OrderStatus[] = [
  'Pending',
  'Accepted',
  'Preparing',
  'Ready',
  'Completed',
]

/**
 * Kitchen Display queue — live orders + status transitions.
 * Realtime subscriptions come from RestaurantRealtimeBridge + useMerchantOrders.
 */
export function useKitchenQueue() {
  const ordersQuery = useMerchantOrders({ status: 'all' })
  const updateStatus = useUpdateOrderStatus()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const activeOrders = useMemo(() => {
    const list = ordersQuery.data ?? []
    return list.filter((o) =>
      ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'].includes(o.status),
    )
  }, [ordersQuery.data])

  const columns = useMemo(() => {
    const map = Object.fromEntries(
      KITCHEN_COLUMNS.map((s) => [s, [] as OrderWithDetails[]]),
    ) as Record<OrderStatus, OrderWithDetails[]>

    for (const order of activeOrders) {
      if (map[order.status]) map[order.status].push(order)
    }

    for (const status of KITCHEN_COLUMNS) {
      map[status].sort((a, b) => {
        const ta = new Date(a.created_at).getTime()
        const tb = new Date(b.created_at).getTime()
        return status === 'Pending' || status === 'Accepted' ? tb - ta : ta - tb
      })
    }
    return map
  }, [activeOrders])

  const moveOrder = useCallback(
    (order: OrderWithDetails, nextStatus: OrderStatus) => {
      updateStatus.mutate({
        orderId: order.id,
        status: nextStatus,
        expectedUpdatedAt: order.updated_at,
        expectedVersion: (order as OrderWithDetails & { version?: number }).version,
      })
    },
    [updateStatus],
  )

  return {
    columns,
    orders: activeOrders,
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    refetch: ordersQuery.refetch,
    moveOrder,
    updating: updateStatus.isPending,
    now,
  }
}
