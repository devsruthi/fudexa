import { useCallback } from 'react'
import { MonitorSmartphone } from 'lucide-react'
import { KitchenColumn } from '@/features/realtime/components/KitchenOrderCard'
import { KITCHEN_COLUMNS, useKitchenQueue } from '@/features/realtime/hooks/useKitchenQueue'
import {
  EmptyState,
  ErrorState,
  PageHeader,
  TableSkeleton,
} from '@/features/restaurant/components'
import type { OrderStatus, OrderWithDetails } from '@/features/restaurant/types'
import { formatStatus } from '@/features/restaurant/utils'
import { useRealtimeConnection } from '@/features/realtime/hooks/useRealtimeConnection'
import { cn } from '@/utils'

const LABELS: Partial<Record<OrderStatus, string>> = {
  Pending: 'New Orders',
  Accepted: 'Accepted',
  Preparing: 'Preparing',
  Ready: 'Ready',
  Completed: 'Completed',
}

export function KitchenPage() {
  const { columns, isLoading, isError, error, refetch, moveOrder, updating, now, orders } =
    useKitchenQueue()
  const { isConnected, isOnline, status } = useRealtimeConnection()

  const onDropOrder = useCallback(
    (
      orderId: string,
      toStatus: OrderStatus,
      meta: { updated_at?: string; version?: number },
    ) => {
      const order = orders.find((o) => o.id === orderId)
      if (!order) return
      // Synthesize order object with concurrency tokens from drag payload
      const proxy = {
        ...order,
        updated_at: meta.updated_at ?? order.updated_at,
        version: meta.version ?? (order as OrderWithDetails & { version?: number }).version,
      } as OrderWithDetails
      moveOrder(proxy, toStatus)
    },
    [orders, moveOrder],
  )

  if (isError) {
    return (
      <ErrorState description={(error as Error).message} onRetry={() => void refetch()} />
    )
  }

  return (
    <div className="-mx-4 space-y-4 md:-mx-8">
      <div className="px-4 md:px-8">
        <PageHeader
          title="Kitchen Display"
          description="Drag tickets between columns or use action buttons. Timers update every second."
          actions={
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium',
                isConnected && isOnline
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-warning/30 bg-warning/10 text-warning',
              )}
            >
              <MonitorSmartphone className="size-3.5" aria-hidden />
              {isOnline ? (isConnected ? 'Live' : `Realtime: ${status}`) : 'Offline'}
            </div>
          }
        />
      </div>

      {isLoading ? (
        <div className="px-4 md:px-8">
          <TableSkeleton rows={4} />
        </div>
      ) : orders.length === 0 ? (
        <div className="px-4 md:px-8">
          <EmptyState
            title="Kitchen is clear"
            description="New orders will appear here instantly."
          />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 md:px-8">
          {KITCHEN_COLUMNS.map((statusCol) => (
            <KitchenColumn
              key={statusCol}
              status={statusCol}
              label={LABELS[statusCol] ?? formatStatus(statusCol)}
              orders={columns[statusCol] ?? []}
              now={now}
              onDropOrder={onDropOrder}
              onMove={moveOrder}
              updating={updating}
            />
          ))}
        </div>
      )}
    </div>
  )
}
