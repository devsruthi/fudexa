import { useMemo, useState } from 'react'
import {
  EmptyState,
  ErrorState,
  OrderCard,
  PageHeader,
  SearchBar,
  TableSkeleton,
} from '@/features/restaurant/components'
import { useMerchantOrders, useUpdateOrderStatus } from '@/features/restaurant/hooks'
import { LIVE_ORDER_COLUMNS, type OrderStatus } from '@/features/restaurant/types'
import { formatStatus } from '@/features/restaurant/utils'
import { Button } from '@/components/ui'

const COLUMN_LABELS: Partial<Record<OrderStatus, string>> = {
  Pending: 'Incoming',
  Accepted: 'Accepted',
  Preparing: 'Preparing',
  Ready: 'Ready',
  OutForDelivery: 'Out',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
}

export function RestaurantOrdersPage() {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'board' | 'list'>('board')
  const { data, isLoading, isError, error, refetch } = useMerchantOrders({
    status: 'all',
    search,
  })
  const updateStatus = useUpdateOrderStatus()

  const grouped = useMemo(() => {
    const map = Object.fromEntries(
      LIVE_ORDER_COLUMNS.map((status) => [status, [] as NonNullable<typeof data>]),
    ) as Record<OrderStatus, NonNullable<typeof data>>
    for (const order of data ?? []) {
      map[order.status]?.push(order)
    }
    return map
  }, [data])

  if (isError) {
    return (
      <ErrorState description={(error as Error).message} onRetry={() => void refetch()} />
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Live orders"
        description="Accept, prepare, and complete orders in real time."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={view === 'board' ? 'primary' : 'outline'}
              onClick={() => setView('board')}
            >
              Board
            </Button>
            <Button
              size="sm"
              variant={view === 'list' ? 'primary' : 'outline'}
              onClick={() => setView('list')}
            >
              List
            </Button>
          </div>
        }
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search order number or address…"
        className="max-w-md"
      />

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState
          title="No orders yet"
          description="New customer orders will appear here instantly."
        />
      ) : view === 'board' ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {LIVE_ORDER_COLUMNS.map((status) => (
            <section
              key={status}
              className="w-72 shrink-0 rounded-[var(--radius-xl)] border border-border bg-muted/30 p-3"
            >
              <header className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">
                  {COLUMN_LABELS[status] ?? formatStatus(status)}
                </h2>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs tabular-nums">
                  {grouped[status]?.length ?? 0}
                </span>
              </header>
              <div className="space-y-3">
                {(grouped[status] ?? []).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    highlight={order.status === 'Pending'}
                    updating={updateStatus.isPending}
                    onStatusChange={(ord, next) =>
                      updateStatus.mutate({
                        orderId: ord.id,
                        status: next,
                        expectedUpdatedAt: ord.updated_at,
                        expectedVersion: ord.version,
                      })
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(data ?? []).map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              highlight={order.status === 'Pending'}
              updating={updateStatus.isPending}
              onStatusChange={(ord, next) =>
                updateStatus.mutate({
                  orderId: ord.id,
                  status: next,
                  expectedUpdatedAt: ord.updated_at,
                  expectedVersion: ord.version,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
