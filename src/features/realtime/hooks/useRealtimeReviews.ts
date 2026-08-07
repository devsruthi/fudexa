import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { channelKeys } from '@/features/realtime/channels'
import { realtimeService } from '@/features/realtime/services'
import { restaurantKeys } from '@/features/restaurant/api'

export function useRealtimeReviews(restaurantId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!restaurantId) return

    return realtimeService.subscribe(
      {
        key: channelKeys.reviews(restaurantId),
        table: 'reviews',
        event: '*',
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      (payload) => {
        void queryClient.invalidateQueries({
          queryKey: restaurantKeys.reviews.all(restaurantId),
        })
        void queryClient.invalidateQueries({
          queryKey: restaurantKeys.dashboard(restaurantId),
        })
        void queryClient.invalidateQueries({
          queryKey: restaurantKeys.context(),
        })

        if (payload.eventType === 'INSERT') {
          const row = payload.new as { rating?: number }
          toast.success('New review received', {
            description: row.rating ? `${row.rating}★ from a customer` : undefined,
          })
        }
      },
    )
  }, [restaurantId, queryClient])
}

export function useRealtimeDashboard(restaurantId: string | undefined) {
  useRealtimeReviews(restaurantId)
  // Orders + inventory hooks are composed by the provider / kitchen / dashboard pages
}
