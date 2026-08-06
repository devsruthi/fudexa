import { supabase } from '@/lib/supabase'
import type { ReviewWithCustomer } from '@/features/restaurant/types'

export type ReviewSort = 'newest' | 'oldest' | 'highest' | 'lowest'

export async function getReviews(
  restaurantId: string,
  sort: ReviewSort = 'newest',
): Promise<ReviewWithCustomer[]> {
  let query = supabase
    .from('reviews')
    .select('*, customer:profiles!reviews_customer_id_fkey(id, full_name, avatar_url)')
    .eq('restaurant_id', restaurantId)

  switch (sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'highest':
      query = query.order('rating', { ascending: false })
      break
    case 'lowest':
      query = query.order('rating', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as ReviewWithCustomer[]
}

export async function replyToReview(reviewId: string, reply: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({ reply, replied_at: new Date().toISOString() })
    .eq('id', reviewId)
  if (error) throw error
}

export const merchantReviewService = {
  getReviews,
  replyToReview,
}
