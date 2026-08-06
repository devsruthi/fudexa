import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Star } from 'lucide-react'
import type { ReviewWithCustomer } from '@/features/restaurant/types'
import {
  reviewReplySchema,
  type ReviewReplyFormValues,
} from '@/features/restaurant/schemas'
import { Button, FormField, Input } from '@/components/ui'
import { cn } from '@/utils'

interface ReviewCardProps {
  review: ReviewWithCustomer
  onReply: (reviewId: string, reply: string) => Promise<void> | void
  replying?: boolean
}

export function ReviewCard({ review, onReply, replying }: ReviewCardProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<ReviewReplyFormValues>({
    resolver: zodResolver(reviewReplySchema),
    defaultValues: { reply: review.reply ?? '' },
  })

  return (
    <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">
            {review.customer?.full_name ?? 'Customer'}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-0.5 text-warning" aria-label={`${review.rating} stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn('size-3.5', i < review.rating ? 'fill-current' : 'opacity-30')}
            />
          ))}
        </div>
      </div>
      {review.review ? (
        <p className="mt-3 text-sm text-foreground">{review.review}</p>
      ) : null}

      {review.reply ? (
        <div className="mt-3 rounded-[var(--radius-md)] border border-border bg-muted/40 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Your reply</p>
          <p className="mt-1 text-sm text-foreground">{review.reply}</p>
        </div>
      ) : null}

      {!open ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={() => setOpen(true)}>
          {review.reply ? 'Edit reply' : 'Reply'}
        </Button>
      ) : (
        <form
          className="mt-3 space-y-2"
          onSubmit={form.handleSubmit(async (values) => {
            await onReply(review.id, values.reply)
            setOpen(false)
          })}
        >
          <FormField
            label="Reply"
            htmlFor="review-reply"
            error={form.formState.errors.reply?.message}
          >
            <Input id="review-reply" {...form.register('reply')} />
          </FormField>
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={replying}>
              Post reply
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </article>
  )
}
