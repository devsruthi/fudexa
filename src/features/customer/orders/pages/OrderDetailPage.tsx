import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, MapPin } from 'lucide-react'
import { Button, Spinner } from '@/components/ui'
import {
  ErrorState,
  OrderStatusBadge,
  OrderStatusTimeline,
} from '@/features/customer/components'
import { useOrder } from '@/features/customer/hooks'
import { formatCurrency } from '@/features/customer/utils'
import { PATHS } from '@/routes/paths'
import type { OrderStatus } from '@/features/customer/types'
import { toast } from 'sonner'

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const order = useOrder(orderId)

  if (order.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Loading order…" />
      </div>
    )
  }

  if (order.isError || !order.data) {
    return (
      <ErrorState
        title="Order not found"
        description="This order may have been removed or you don’t have access."
        onRetry={() => void order.refetch()}
      />
    )
  }

  const data = order.data

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to={PATHS.customer.orders}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to orders
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <p className="text-sm text-muted-foreground">{data.order_number}</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            {data.restaurant?.name ?? 'Order details'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {new Date(data.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={data.status as OrderStatus} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.message('Invoice download coming soon')}
          >
            <Download className="size-4" />
            Invoice
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
          <h2 className="font-display text-lg font-semibold text-foreground">Live status</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Updates automatically via realtime when the restaurant changes status.
          </p>
          <div className="mt-5">
            <OrderStatusTimeline status={data.status as OrderStatus} />
          </div>
          {data.estimated_delivery ? (
            <p className="mt-4 rounded-[var(--radius-md)] bg-muted px-3 py-2 text-sm text-muted-foreground">
              Estimated delivery:{' '}
              <span className="font-medium text-foreground">
                {new Date(data.estimated_delivery).toLocaleString()}
              </span>
            </p>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
            <h2 className="font-display text-lg font-semibold text-foreground">Items</h2>
            <ul className="mt-4 space-y-3">
              {data.order_items?.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {item.quantity}× {item.menu_item?.name ?? 'Item'}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(Number(item.subtotal))}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatCurrency(Number(data.subtotal))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd>{formatCurrency(Number(data.tax))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd>{formatCurrency(Number(data.delivery_fee))}</dd>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatCurrency(Number(data.total))}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
            <h2 className="font-display text-lg font-semibold text-foreground">Delivery</h2>
            <p className="mt-3 inline-flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {data.delivery_address}
            </p>
            {data.notes ? (
              <p className="mt-3 text-sm text-muted-foreground">Notes: {data.notes}</p>
            ) : null}
            <p className="mt-3 text-sm text-muted-foreground">
              Payment: {data.payment_method} · {data.payment_status}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
