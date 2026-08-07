import { useRestaurantContext } from '@/features/restaurant/hooks'
import { useRealtimeOrders } from '@/features/realtime/hooks/useRealtimeOrders'
import { useRealtimeInventory } from '@/features/realtime/hooks/useRealtimeInventory'
import { useRealtimeReviews } from '@/features/realtime/hooks/useRealtimeReviews'

/**
 * Mount once under RestaurantLayout — owns new-order toasts/sound and live cache invalidation.
 */
export function RestaurantRealtimeBridge() {
  const { data: ctx } = useRestaurantContext()
  const restaurantId = ctx?.restaurantId

  useRealtimeOrders({ restaurantId, notifyNewOrders: true })
  useRealtimeInventory(restaurantId, { toastLowStock: true })
  useRealtimeReviews(restaurantId)

  return null
}
