import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { channelKeys } from '@/features/realtime/channels'
import { realtimeService } from '@/features/realtime/services'
import { restaurantKeys } from '@/features/restaurant/api'

export function useRealtimeInventory(restaurantId: string | undefined, options?: { toastLowStock?: boolean }) {
  const queryClient = useQueryClient()
  const toastLowStock = options?.toastLowStock ?? true

  useEffect(() => {
    if (!restaurantId) return

    return realtimeService.subscribe(
      {
        key: channelKeys.inventory(restaurantId),
        table: 'inventory',
        event: '*',
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      (payload) => {
        void queryClient.invalidateQueries({
          queryKey: restaurantKeys.inventory.all(restaurantId),
        })
        void queryClient.invalidateQueries({
          queryKey: restaurantKeys.menu.all(restaurantId),
        })
        void queryClient.invalidateQueries({
          queryKey: restaurantKeys.dashboard(restaurantId),
        })

        if (toastLowStock && payload.eventType === 'UPDATE') {
          const row = payload.new as { status?: string; stock?: number }
          if (row.status === 'OutOfStock') {
            toast.error('Out of stock', {
              description: 'A menu item is now unavailable.',
            })
          } else if (row.status === 'LowStock') {
            toast.warning('Low inventory', {
              description: `Stock dropped to ${row.stock ?? 'low'}.`,
            })
          }
        }
      },
    )
  }, [restaurantId, queryClient, toastLowStock])
}
