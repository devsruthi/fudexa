import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Button } from '@/components/ui'
import { EmptyState, ErrorState, OrderCard, SearchBar } from '@/features/customer/components'
import { useOrders } from '@/features/customer/hooks'
import { useCartStore } from '@/store'
import type { OrderStatus, OrderWithItems } from '@/features/customer/types'
import { PATHS } from '@/routes/paths'
import { Spinner } from '@/components/ui'
import { toast } from 'sonner'

const STATUS_FILTERS: Array<OrderStatus | 'all'> = [
  'all',
  'Pending',
  'Preparing',
  'OutForDelivery',
  'Completed',
  'Cancelled',
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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Your orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track live deliveries and reorder past favorites.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          placeholder="Search by order number or address"
          className="flex-1"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => {
              setStatus(filter)
              setPage(1)
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              status === filter
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter === 'all' ? 'All' : filter.replace(/([a-z])([A-Z])/g, '$1 $2')}
          </button>
        ))}
      </div>

      {orders.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner label="Loading orders…" />
        </div>
      ) : orders.isError ? (
        <ErrorState onRetry={() => void orders.refetch()} />
      ) : (orders.data?.data.length ?? 0) === 0 ? (
        <EmptyState
          title="No orders found"
          description="When you place an order, it will appear here."
          icon={Package}
          actionLabel="Order food"
          onAction={() => navigate(PATHS.customer.restaurants)}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {orders.data?.data.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onReorder={() => handleReorder(order)}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
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
