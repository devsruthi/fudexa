import { Link } from 'react-router-dom'
import { ArrowUpRight, RotateCcw, Store } from 'lucide-react'
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
  const when = new Date(order.created_at)
  const dateLabel = when.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timeLabel = when.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-surface/90 p-5 shadow-[var(--shadow-sm)] backdrop-blur-sm transition duration-200 hover:border-primary/25 hover:shadow-[var(--shadow-md)]',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,_transparent,_rgb(var(--color-secondary)/0.45),_rgb(var(--color-primary)/0.45),_transparent)] opacity-0 transition group-hover:opacity-100"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted ring-1 ring-border/50">
            {order.restaurant?.logo ? (
              <img src={order.restaurant.logo} alt="" className="size-full object-cover" />
            ) : (
              <Store className="size-5 text-muted-foreground" aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold tracking-tight text-foreground">
              {order.restaurant?.name ?? 'Restaurant'}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">{order.order_number}</span>
              {' · '}
              {itemCount} item{itemCount === 1 ? '' : 's'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {dateLabel}
              <span className="mx-1.5 text-border">·</span>
              {timeLabel}
            </p>
          </div>
        </div>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Total
          </p>
          <p className="font-display text-xl font-semibold tabular-nums text-foreground">
            {formatCurrency(Number(order.total))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onReorder && order.status === 'Completed' ? (
            <button
              type="button"
              onClick={onReorder}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Reorder
            </button>
          ) : null}
          <Link
            to={orderDetailPath(order.id)}
            className="inline-flex items-center gap-1 rounded-full bg-brand-gradient px-3.5 py-2 text-xs font-semibold text-white shadow-[0_8px_18px_-10px_rgb(230_57_70_/_0.55)] transition hover:brightness-105"
          >
            View
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
      <span className="sr-only">{formatOrderStatus(order.status)}</span>
    </article>
  )
}
