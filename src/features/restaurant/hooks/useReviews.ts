import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { restaurantKeys } from '@/features/restaurant/api'
import { merchantReviewService, type ReviewSort } from '@/features/restaurant/services/review.service'
import { useRestaurantContext } from './useRestaurantContext'

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

  return useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: string; reply: string }) =>
      merchantReviewService.replyToReview(reviewId, reply),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: restaurantKeys.reviews.all(ctx!.restaurantId),
      })
      toast.success('Reply posted')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
