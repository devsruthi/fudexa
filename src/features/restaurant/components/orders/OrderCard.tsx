import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { OrderStatus, OrderWithDetails } from '@/features/restaurant/types'
import { ORDER_STATUS_ACTIONS } from '@/features/restaurant/types'
import { formatCurrency, formatStatus, orderDetailPath, statusTone } from '@/features/restaurant/utils'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        statusTone(status),
        className,
      )}
    >
      {formatStatus(status)}
    </span>
  )
}

interface OrderCardProps {
  order: OrderWithDetails
  highlight?: boolean
  onStatusChange: (order: OrderWithDetails, status: OrderStatus) => void
  updating?: boolean
}

export function OrderCard({ order, highlight, onStatusChange, updating }: OrderCardProps) {
  const actions = ORDER_STATUS_ACTIONS[order.status] ?? []
  const prepMinutes =
    order.order_items?.reduce(
      (max, item) => Math.max(max, item.menu_item?.preparation_time ?? 0),
      0,
    ) ?? 0

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-[var(--radius-xl)] border bg-surface p-4 shadow-[var(--shadow-sm)] transition',
        highlight ? 'border-primary ring-2 ring-primary/30' : 'border-border',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link
            to={orderDetailPath(order.id)}
            className="font-semibold text-foreground hover:text-primary"
          >
            #{order.order_number}
          </Link>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {order.customer?.full_name ?? 'Customer'}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
        {order.order_items?.slice(0, 4).map((item) => (
          <li key={item.id} className="flex justify-between gap-2">
            <span className="text-foreground">
              {item.quantity}× {item.menu_item?.name ?? 'Item'}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {formatCurrency(Number(item.subtotal))}
            </span>
          </li>
        ))}
        {(order.order_items?.length ?? 0) > 4 ? (
          <li className="text-xs text-muted-foreground">
            +{(order.order_items?.length ?? 0) - 4} more
          </li>
        ) : null}
      </ul>

      {order.notes ? (
        <p className="mt-2 rounded-[var(--radius-md)] bg-muted px-2 py-1.5 text-xs text-muted-foreground">
          Note: {order.notes}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{formatCurrency(Number(order.total))}</span>
        <span>{order.payment_method}</span>
        <span>{order.payment_status}</span>
        {prepMinutes > 0 ? <span>~{prepMinutes} min</span> : null}
      </div>

      {actions.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={action.next}
              size="sm"
              variant={
                action.variant === 'danger'
                  ? 'danger'
                  : action.variant === 'secondary'
                    ? 'secondary'
                    : 'primary'
              }
              loading={updating}
              onClick={() => onStatusChange(order, action.next)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </motion.article>
  )
}
