import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { ORDER_STATUS_FLOW, type OrderStatus } from '@/features/customer/types'
import { formatOrderStatus } from '@/features/customer/utils'
import { cn } from '@/utils'

interface OrderStatusTimelineProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusTimeline({ status, className }: OrderStatusTimelineProps) {
  if (status === 'Cancelled') {
    return (
      <div
        className={cn(
          'rounded-[var(--radius-xl)] border border-danger/30 bg-danger/5 p-4 text-sm text-danger',
          className,
        )}
      >
        This order was cancelled.
      </div>
    )
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status)

  return (
    <ol className={cn('space-y-0', className)}>
      {ORDER_STATUS_FLOW.map((step, index) => {
        const complete = index <= currentIndex
        const current = index === currentIndex

        return (
          <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
            {index < ORDER_STATUS_FLOW.length - 1 ? (
              <span
                className={cn(
                  'absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5',
                  index < currentIndex ? 'bg-primary' : 'bg-border',
                )}
                aria-hidden
              />
            ) : null}
            <motion.span
              layout
              className={cn(
                'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                complete
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-muted-foreground',
                current && 'ring-4 ring-primary/20',
              )}
            >
              {complete ? <Check className="size-4" /> : index + 1}
            </motion.span>
            <div className="pt-1">
              <p className={cn('text-sm font-medium', complete ? 'text-foreground' : 'text-muted-foreground')}>
                {formatOrderStatus(step)}
              </p>
              {current ? (
                <p className="text-xs text-primary">Current status</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
