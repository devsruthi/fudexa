import { useMemo, useState } from 'react'
import {
  EmptyState,
  ErrorState,
  PageHeader,
  ReviewCard,
  TableSkeleton,
} from '@/features/restaurant/components'
import { useMerchantReviews, useReplyToReview } from '@/features/restaurant/hooks'
import type { ReviewSort } from '@/features/restaurant/services/review.service'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

const SORTS: { id: ReviewSort; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'highest', label: 'Highest rated' },
  { id: 'lowest', label: 'Lowest rated' },
]

export function ReviewsPage() {
  const [sort, setSort] = useState<ReviewSort>('newest')
  const reviews = useMerchantReviews(sort)
  const reply = useReplyToReview()

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    for (const r of reviews.data ?? []) {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1] += 1
    }
    return counts
  }, [reviews.data])

  const average = useMemo(() => {
    const list = reviews.data ?? []
    if (!list.length) return 0
    return list.reduce((s, r) => s + r.rating, 0) / list.length
  }, [reviews.data])

  if (reviews.isError) {
    return (
      <ErrorState
        description={(reviews.error as Error).message}
        onRetry={() => void reviews.refetch()}
      />
    )
  }

  const maxCount = Math.max(...distribution, 1)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Monitor guest feedback and post public replies."
      />

      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Average rating</p>
          <p className="mt-2 font-display text-4xl font-semibold">{average.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground">{reviews.data?.length ?? 0} reviews</p>
          <ul className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <li key={star} className="flex items-center gap-2 text-xs">
                <span className="w-6">{star}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-warning"
                    style={{ width: `${(distribution[star - 1] / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 tabular-nums text-muted-foreground">
                  {distribution[star - 1]}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant={sort === s.id ? 'primary' : 'outline'}
                onClick={() => setSort(s.id)}
              >
                {s.label}
              </Button>
            ))}
          </div>

          {reviews.isLoading ? (
            <TableSkeleton />
          ) : (reviews.data?.length ?? 0) === 0 ? (
            <EmptyState title="No reviews yet" />
          ) : (
            <div className={cn('grid gap-3')}>
              {(reviews.data ?? []).map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  replying={reply.isPending}
                  onReply={async (reviewId, text) => {
                    await reply.mutateAsync({ reviewId, reply: text })
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
