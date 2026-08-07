import { memo, useState, type DragEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { OrderStatus, OrderWithDetails } from '@/features/restaurant/types'
import { ORDER_STATUS_ACTIONS } from '@/features/restaurant/types'
import { formatCurrency, formatStatus } from '@/features/restaurant/utils'
import {
  formatDuration,
  getElapsedSeconds,
  getPrepMinutes,
  getRemainingSeconds,
  getUrgency,
  urgencyClasses,
  urgencyTimerClasses,
} from '@/features/realtime/utils/kitchen-timer'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

interface KitchenOrderCardProps {
  order: OrderWithDetails
  now: number
  onMove: (order: OrderWithDetails, next: OrderStatus) => void
  updating?: boolean
}

export const KitchenOrderCard = memo(function KitchenOrderCard({
  order,
  now,
  onMove,
  updating,
}: KitchenOrderCardProps) {
  const prepMinutes = getPrepMinutes(order)
  const elapsed = getElapsedSeconds(order.created_at, now)
  const remaining = getRemainingSeconds(order.created_at, prepMinutes, now)
  const urgency = getUrgency(remaining, elapsed, prepMinutes)
  const actions = ORDER_STATUS_ACTIONS[order.status] ?? []
  const late = remaining < 0

  const handleDragStart = (e: DragEvent<HTMLElement>) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        orderId: order.id,
        fromStatus: order.status,
        updated_at: order.updated_at,
        version: (order as OrderWithDetails & { version?: number }).version,
      }),
    )
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <motion.div
      layout
      layoutId={order.id}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <article
        draggable
        onDragStart={handleDragStart}
        className={cn(
          'cursor-grab rounded-[var(--radius-xl)] border-2 bg-surface p-4 shadow-[var(--shadow-md)] active:cursor-grabbing',
          urgencyClasses[urgency],
          order.status === 'Pending' && 'ring-2',
        )}
        aria-label={`Order ${order.order_number}, ${formatStatus(order.status)}, ${late ? 'late' : 'on time'}`}
      >
        <header className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight">#{order.order_number}</p>
            <p className="text-sm text-muted-foreground">
              {order.customer?.full_name ?? 'Customer'}
            </p>
          </div>
          <div className="text-right">
            <p className={cn('font-mono text-lg tabular-nums', urgencyTimerClasses[urgency])}>
              {late ? `LATE ${formatDuration(remaining)}` : formatDuration(remaining)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              elapsed {formatDuration(elapsed)} · prep {prepMinutes}m
            </p>
          </div>
        </header>

        <ul className="mt-4 space-y-2 border-t border-border/60 pt-3">
          {order.order_items?.map((item) => (
            <li key={item.id} className="text-base font-medium">
              <span className="mr-2 inline-flex min-w-7 justify-center rounded bg-foreground/10 px-1.5 py-0.5 text-sm">
                {item.quantity}
              </span>
              {item.menu_item?.name ?? 'Item'}
            </li>
          ))}
        </ul>

        {order.notes ? (
          <p className="mt-3 rounded-[var(--radius-md)] bg-foreground/5 px-3 py-2 text-sm font-medium">
            <span className="text-muted-foreground">Notes: </span>
            {order.notes}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{formatCurrency(Number(order.total))}</span>
          <span>{order.payment_status}</span>
          <span>{order.payment_method}</span>
          {late ? <span className="font-semibold text-danger">Priority</span> : null}
        </div>

        {actions.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
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
                onClick={() => onMove(order, action.next)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </article>
    </motion.div>
  )
})

interface KitchenColumnProps {
  status: OrderStatus
  label: string
  orders: OrderWithDetails[]
  now: number
  onDropOrder: (
    orderId: string,
    toStatus: OrderStatus,
    meta: { updated_at?: string; version?: number },
  ) => void
  onMove: (order: OrderWithDetails, next: OrderStatus) => void
  updating?: boolean
}

export function KitchenColumn({
  status,
  label,
  orders,
  now,
  onDropOrder,
  onMove,
  updating,
}: KitchenColumnProps) {
  const [over, setOver] = useState(false)

  return (
    <section
      className={cn(
        'flex w-80 shrink-0 flex-col rounded-[var(--radius-xl)] border border-border bg-muted/40',
        over && 'border-primary ring-2 ring-primary/30',
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        try {
          const raw = e.dataTransfer.getData('application/json')
          const data = JSON.parse(raw) as {
            orderId: string
            fromStatus: OrderStatus
            updated_at?: string
            version?: number
          }
          if (data.fromStatus === status) return
          onDropOrder(data.orderId, status, {
            updated_at: data.updated_at,
            version: data.version,
          })
        } catch {
          // ignore invalid drops
        }
      }}
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">{label}</h2>
        <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-bold tabular-nums">
          {orders.length}
        </span>
      </header>
      <div className="flex max-h-[calc(100dvh-12rem)] flex-col gap-3 overflow-y-auto p-3">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              now={now}
              onMove={onMove}
              updating={updating}
            />
          ))}
        </AnimatePresence>
        {orders.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No tickets</p>
        ) : null}
      </div>
    </section>
  )
}
