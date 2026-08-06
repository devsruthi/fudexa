import { useMemo, useState } from 'react'
import {
  EmptyState,
  ErrorState,
  InventoryTable,
  PageHeader,
  TableSkeleton,
} from '@/features/restaurant/components'
import {
  useInventoryMovements,
  useMerchantInventory,
  useUpdateInventory,
} from '@/features/restaurant/hooks'
import { inventoryTone } from '@/features/restaurant/utils'
import { cn } from '@/utils'

type Filter = 'all' | 'LowStock' | 'OutOfStock' | 'InStock'

export function InventoryPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const inventory = useMerchantInventory()
  const movements = useInventoryMovements()
  const update = useUpdateInventory()

  const rows = useMemo(() => {
    const list = inventory.data ?? []
    if (filter === 'all') return list
    return list.filter((r) => r.status === filter)
  }, [inventory.data, filter])

  const counts = useMemo(() => {
    const list = inventory.data ?? []
    return {
      all: list.length,
      InStock: list.filter((r) => r.status === 'InStock').length,
      LowStock: list.filter((r) => r.status === 'LowStock').length,
      OutOfStock: list.filter((r) => r.status === 'OutOfStock').length,
    }
  }, [inventory.data])

  if (inventory.isError) {
    return (
      <ErrorState
        description={(inventory.error as Error).message}
        onRetry={() => void inventory.refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track stock levels and respond to low-stock alerts."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {(
          [
            ['all', 'All'],
            ['InStock', 'In stock'],
            ['LowStock', 'Low stock'],
            ['OutOfStock', 'Out of stock'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              'rounded-[var(--radius-xl)] border px-4 py-3 text-left transition',
              filter === key
                ? 'border-primary bg-primary/10'
                : 'border-border bg-surface hover:bg-muted',
            )}
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{counts[key]}</p>
          </button>
        ))}
      </div>

      {inventory.isLoading ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState title="No inventory rows" description="Menu items with inventory will appear here." />
      ) : (
        <InventoryTable
          rows={rows}
          saving={update.isPending}
          onSave={(id, stock, low_stock_limit) =>
            update.mutate({ id, stock, low_stock_limit })
          }
        />
      )}

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Recent inventory history</h2>
        {(movements.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            No movements yet. Run migration 011 to enable inventory history tracking.
          </p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {(movements.data ?? []).slice(0, 20).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                <div>
                  <p className="font-medium">{m.menu_item?.name ?? 'Item'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString()}
                    {m.reason ? ` · ${m.reason}` : ''}
                  </p>
                </div>
                <span
                  className={cn(
                    'tabular-nums font-medium',
                    m.delta < 0 ? 'text-danger' : 'text-success',
                  )}
                >
                  {m.delta > 0 ? '+' : ''}
                  {m.delta} ({m.previous_stock}→{m.new_stock})
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(counts.LowStock > 0 || counts.OutOfStock > 0) && (
        <p className={cn('text-sm', inventoryTone('LowStock'), 'rounded-lg px-3 py-2')}>
          Automatic warning: {counts.LowStock} low-stock and {counts.OutOfStock} out-of-stock
          items need attention.
        </p>
      )}
    </div>
  )
}
