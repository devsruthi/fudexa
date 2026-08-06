import type { OrderStatus } from '@/features/customer/types'
import { formatOrderStatus } from '@/features/customer/utils'
import { cn } from '@/utils'

const statusStyles: Record<OrderStatus, string> = {
  Pending: 'bg-warning/15 text-warning',
  Accepted: 'bg-primary/15 text-primary',
  Preparing: 'bg-primary/15 text-primary',
  Ready: 'bg-success/15 text-success',
  OutForDelivery: 'bg-secondary/20 text-secondary-foreground',
  Completed: 'bg-success/15 text-success',
  Cancelled: 'bg-danger/15 text-danger',
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        statusStyles[status],
        className,
      )}
    >
      {formatOrderStatus(status)}
    </span>
  )
}
