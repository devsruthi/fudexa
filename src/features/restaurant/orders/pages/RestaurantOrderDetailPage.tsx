import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  EmptyState,
  ErrorState,
  OrderStatusBadge,
  PageHeader,
  TableSkeleton,
} from '@/features/restaurant/components'
import { useMerchantOrder, useUpdateOrderStatus } from '@/features/restaurant/hooks'
import { ORDER_STATUS_ACTIONS } from '@/features/restaurant/types'
import { formatCurrency, formatStatus } from '@/features/restaurant/utils'
import { PATHS } from '@/routes/paths'
import { Button } from '@/components/ui'

export function RestaurantOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data, isLoading, isError, error, refetch } = useMerchantOrder(orderId)
  const updateStatus = useUpdateOrderStatus()

  if (isLoading) {
    return (
      <>
        <PageHeader title="Order details" />
        <TableSkeleton />
      </>
    )
  }

  if (isError) {
    return (
      <ErrorState description={(error as Error).message} onRetry={() => void refetch()} />
    )
  }

  if (!data) {
    return <EmptyState title="Order not found" />
  }

  const actions = ORDER_STATUS_ACTIONS[data.status] ?? []

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={`Order #${data.order_number}`}
        description={new Date(data.created_at).toLocaleString()}
        actions={
          <Link
            to={PATHS.restaurant.orders}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to orders
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <OrderStatusBadge status={data.status} />
        <span className="text-sm text-muted-foreground">
          {data.payment_status} · {data.payment_method}
        </span>
      </div>

      {actions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={action.next}
              variant={
                action.variant === 'danger'
                  ? 'danger'
                  : action.variant === 'secondary'
                    ? 'secondary'
                    : 'primary'
              }
              loading={updateStatus.isPending}
              onClick={() =>
                updateStatus.mutate({
                  orderId: data.id,
                  status: action.next,
                  expectedUpdatedAt: data.updated_at,
                  expectedVersion: data.version,
                })
              }
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold">Customer</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd>{data.customer?.full_name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{data.customer?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{data.customer?.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Delivery address</dt>
              <dd>{data.delivery_address}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold">Payment</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatCurrency(Number(data.subtotal))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="tabular-nums">{formatCurrency(Number(data.tax))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery fee</dt>
              <dd className="tabular-nums">{formatCurrency(Number(data.delivery_fee))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="tabular-nums">-{formatCurrency(Number(data.discount))}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatCurrency(Number(data.total))}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold">Items</h2>
        <ul className="mt-3 divide-y divide-border">
          {data.order_items?.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="size-12 overflow-hidden rounded-[var(--radius-md)] bg-muted">
                  {item.menu_item?.image ? (
                    <img src={item.menu_item.image} alt="" className="size-full object-cover" />
                  ) : null}
                </div>
                <div>
                  <p className="font-medium">{item.menu_item?.name ?? 'Item'}</p>
                  <p className="text-muted-foreground">
                    Qty {item.quantity} · {formatCurrency(Number(item.price))} each
                  </p>
                </div>
              </div>
              <span className="tabular-nums font-medium">{formatCurrency(Number(item.subtotal))}</span>
            </li>
          ))}
        </ul>
        {data.notes ? (
          <p className="mt-3 rounded-[var(--radius-md)] bg-muted px-3 py-2 text-sm">
            <span className="font-medium">Notes: </span>
            {data.notes}
          </p>
        ) : null}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold">Status timeline</h2>
        {(data.status_events?.length ?? 0) === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Current status: {formatStatus(data.status)}. Run migration 011 to enable full history.
          </p>
        ) : (
          <ol className="mt-4 space-y-4 border-l border-border pl-4">
            {data.status_events?.map((event) => (
              <li key={event.id} className="relative text-sm">
                <span className="absolute top-1.5 -left-[1.3rem] size-2.5 rounded-full bg-primary" />
                <p className="font-medium">
                  {event.from_status ? `${formatStatus(event.from_status)} → ` : ''}
                  {formatStatus(event.to_status)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.created_at).toLocaleString()}
                  {event.note ? ` · ${event.note}` : ''}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
