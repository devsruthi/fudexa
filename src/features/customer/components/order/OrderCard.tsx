import { Link } from 'react-router-dom'
import { ChevronRight, Store } from 'lucide-react'
import type { OrderStatus, OrderWithItems } from '@/features/customer/types'
import { formatCurrency, formatOrderStatus, orderDetailPath } from '@/features/customer/utils'
import { OrderStatusBadge } from './OrderStatusBadge'
import { cn } from '@/utils'

interface OrderCardProps {
  order: OrderWithItems
  onReorder?: () => void
  className?: string
}

export function OrderCard({ order, onReorder, className }: OrderCardProps) {
  const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <article
      className={cn(
        'rounded-[var(--radius-xl)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-muted">
            {order.restaurant?.logo ? (
              <img src={order.restaurant.logo} alt="" className="size-full object-cover" />
            ) : (
              <Store className="size-5 text-muted-foreground" aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground">
              {order.restaurant?.name ?? 'Restaurant'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {order.order_number} · {itemCount} item{itemCount === 1 ? '' : 's'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-sm font-semibold text-foreground">{formatCurrency(Number(order.total))}</p>
        <div className="flex items-center gap-2">
          {onReorder && order.status === 'Completed' ? (
            <button
              type="button"
              onClick={onReorder}
              className="rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted"
            >
              Reorder
            </button>
          ) : null}
          <Link
            to={orderDetailPath(order.id)}
            className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80"
          >
            View
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>
      <span className="sr-only">{formatOrderStatus(order.status)}</span>
    </article>
  )
}
