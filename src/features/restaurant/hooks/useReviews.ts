import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { restaurantKeys } from '@/features/restaurant/api'
import { merchantReviewService, type ReviewSort } from '@/features/restaurant/services/review.service'
import { useRestaurantContext } from './useRestaurantContext'
import type { ReviewWithCustomer } from '@/features/restaurant/types'
import { offlineQueue } from '@/features/realtime/services'
import { useRealtimeStore } from '@/features/realtime/store/realtime.store'

export function useMerchantReviews(sort: ReviewSort = 'newest') {
  const { data: ctx } = useRestaurantContext()
  return useQuery({
    queryKey: restaurantKeys.reviews.list(ctx?.restaurantId ?? '', { sort }),
    queryFn: () => merchantReviewService.getReviews(ctx!.restaurantId, sort),
    enabled: Boolean(ctx?.restaurantId),
  })
}

export function useReplyToReview() {
  const { data: ctx } = useRestaurantContext()
  const queryClient = useQueryClient()
  const isOnline = useRealtimeStore((s) => s.isOnline)

  return useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string }) => {
      if (!isOnline || !navigator.onLine) {
        offlineQueue.enqueue({
          type: 'reply_review',
          payload: { reviewId, reply },
        })
        useRealtimeStore.getState().setQueueSnapshot(offlineQueue.peek())
        return { queued: true as const }
      }
      await merchantReviewService.replyToReview(reviewId, reply)
      return { queued: false as const }
    },
    onMutate: async ({ reviewId, reply }) => {
      if (!ctx?.restaurantId) return
      const keyPrefix = restaurantKeys.reviews.all(ctx.restaurantId)
      await queryClient.cancelQueries({ queryKey: keyPrefix })
      const previous = queryClient.getQueriesData<ReviewWithCustomer[]>({ queryKey: keyPrefix })
      queryClient.setQueriesData<ReviewWithCustomer[]>({ queryKey: keyPrefix }, (old) =>
        old?.map((r) =>
          r.id === reviewId
            ? { ...r, reply, replied_at: new Date().toISOString() }
            : r,
        ),
      )
      return { previous }
    },
    onError: (_e, _v, mutationCtx) => {
      if (mutationCtx?.previous) {
        for (const [key, data] of mutationCtx.previous) {
          queryClient.setQueryData(key, data)
        }
      }
      toast.error('Could not post reply')
    },
    onSuccess: (result) => {
      if (result.queued) {
        toast.message('Reply queued offline')
        return
      }
      toast.success('Reply posted')
    },
    onSettled: () => {
      if (!ctx?.restaurantId) return
      void queryClient.invalidateQueries({
        queryKey: restaurantKeys.reviews.all(ctx.restaurantId),
      })
    },
  })
}
