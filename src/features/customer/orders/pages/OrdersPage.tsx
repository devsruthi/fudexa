import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Button, Spinner } from '@/components/ui'
import { EmptyState, ErrorState, OrderCard, SearchBar } from '@/features/customer/components'
import { useOrders } from '@/features/customer/hooks'
import { useCartStore } from '@/store'
import type { OrderStatus, OrderWithItems } from '@/features/customer/types'
import { PATHS } from '@/routes/paths'
import { toast } from 'sonner'
import { cn } from '@/utils'

const STATUS_FILTERS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Preparing', label: 'Preparing' },
  { value: 'OutForDelivery', label: 'Out for delivery' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
]

export function OrdersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const addItem = useCartStore((s) => s.addItem)
  const clearCart = useCartStore((s) => s.clearCart)

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status,
      page,
      pageSize: 8,
    }),
    [search, status, page],
  )

  const orders = useOrders(filters)
  const count = orders.data?.data.length ?? 0

  const handleReorder = (order: OrderWithItems) => {
    if (!order.order_items?.length) return
    clearCart()
    for (const line of order.order_items) {
      addItem({
        menuItemId: line.menu_item_id,
        restaurantId: order.restaurant_id,
        restaurantName: order.restaurant?.name ?? 'Restaurant',
        name: line.menu_item?.name ?? 'Item',
        price: Number(line.price),
        image: line.menu_item?.image ?? null,
        preparationTime: null,
        quantity: line.quantity,
      })
    }
    toast.success('Items added to cart')
    navigate(PATHS.customer.cart)
  }

  return (
    <div className="relative space-y-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-4 h-44 bg-[radial-gradient(ellipse_at_top_left,_rgb(230_57_70_/_0.1),_transparent_55%),radial-gradient(ellipse_at_top_right,_rgb(255_122_0_/_0.12),_transparent_50%)]"
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-secondary uppercase">
            Order history
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Your orders
          </h1>
          <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">
            Track live deliveries and reorder the meals you loved.
          </p>
        </div>
        {!orders.isLoading && count > 0 ? (
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-semibold text-foreground">{count}</span> on this page
          </p>
        ) : null}
      </div>

      <div className="relative space-y-4 rounded-2xl border border-border/60 bg-surface/70 p-4 shadow-[var(--shadow-sm)] backdrop-blur-sm sm:p-5">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          placeholder="Search by order number or address"
          className="w-full"
        />

        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatus(filter.value)
                setPage(1)
              }}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition',
                status === filter.value
                  ? 'bg-brand-gradient text-white shadow-[0_8px_18px_-10px_rgb(230_57_70_/_0.55)]'
                  : 'border border-border/70 bg-background/60 text-muted-foreground hover:border-primary/25 hover:text-foreground',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {orders.isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner label="Loading orders…" />
        </div>
      ) : orders.isError ? (
        <ErrorState onRetry={() => void orders.refetch()} />
      ) : count === 0 ? (
        <EmptyState
          title="No orders found"
          description="When you place an order, it will appear here."
          icon={Package}
          actionLabel="Order food"
          onAction={() => navigate(PATHS.customer.restaurants)}
        />
      ) : (
        <>
          <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            {orders.data?.data.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onReorder={() => handleReorder(order)}
              />
            ))}
          </div>

          <div className="relative flex items-center justify-center gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="rounded-full border border-border/70 bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-foreground">
              Page {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={!orders.data?.hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
