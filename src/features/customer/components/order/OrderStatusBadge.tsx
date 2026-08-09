import type { OrderStatus } from '@/features/customer/types'
import { formatOrderStatus } from '@/features/customer/utils'
import { cn } from '@/utils'

const statusStyles: Record<OrderStatus, string> = {
  Pending: 'bg-warning/12 text-warning ring-1 ring-warning/20',
  Accepted: 'bg-primary/10 text-primary ring-1 ring-primary/20',
  Preparing: 'bg-primary/10 text-primary ring-1 ring-primary/20',
  Ready: 'bg-success/12 text-success ring-1 ring-success/20',
  OutForDelivery: 'bg-secondary/15 text-secondary ring-1 ring-secondary/25',
  Completed: 'bg-success/12 text-success ring-1 ring-success/20',
  Cancelled: 'bg-danger/12 text-danger ring-1 ring-danger/20',
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
