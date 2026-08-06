import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ClipboardList,
  DollarSign,
  Package,
  Star,
  Users,
  UtensilsCrossed,
  CheckCircle2,
} from 'lucide-react'
import {
  DashboardCard,
  DashboardSkeleton,
  EmptyState,
  ErrorState,
  OrdersChart,
  PageHeader,
  RevenueChart,
} from '@/features/restaurant/components'
import { useDashboardData } from '@/features/restaurant/hooks'
import { formatCurrency, formatStatus, orderDetailPath } from '@/features/restaurant/utils'
import { PATHS } from '@/routes/paths'
import { Button } from '@/components/ui'

export function DashboardPage() {
  const navigate = useNavigate()
  const {
    restaurantQuery,
    stats,
    recentOrders,
    latestReviews,
    popularCategories,
    analyticsPreview,
  } = useDashboardData()

  if (restaurantQuery.isError) {
    return (
      <ErrorState
        title="Restaurant not found"
        description={(restaurantQuery.error as Error)?.message}
        onRetry={() => void restaurantQuery.refetch()}
      />
    )
  }

  if (stats.isLoading || restaurantQuery.isLoading) {
    return (
      <>
        <PageHeader title="Dashboard" description="Today’s performance at a glance." />
        <DashboardSkeleton />
      </>
    )
  }

  if (stats.isError) {
    return (
      <ErrorState
        description={(stats.error as Error).message}
        onRetry={() => void stats.refetch()}
      />
    )
  }

  const s = stats.data!
  const restaurantName = restaurantQuery.data?.restaurant.name

  return (
    <div className="space-y-6">
      <PageHeader
        title={restaurantName ?? 'Dashboard'}
        description="Live operations overview for your restaurant."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(PATHS.restaurant.orders)}>
              Live orders
            </Button>
            <Button size="sm" onClick={() => navigate(PATHS.restaurant.menuNew)}>
              Add menu item
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Today's revenue"
          value={formatCurrency(s.todayRevenue)}
          icon={DollarSign}
          tone="success"
        />
        <DashboardCard title="Today's orders" value={s.todayOrders} icon={ClipboardList} />
        <DashboardCard
          title="Pending orders"
          value={s.pendingOrders}
          icon={AlertTriangle}
          tone="warning"
        />
        <DashboardCard
          title="Completed today"
          value={s.completedOrders}
          icon={CheckCircle2}
          tone="success"
        />
        <DashboardCard title="Average rating" value={s.averageRating.toFixed(1)} icon={Star} />
        <DashboardCard title="Total customers" value={s.totalCustomers} icon={Users} />
        <DashboardCard
          title="Best seller"
          value={s.bestSellingItem?.name ?? '—'}
          subtitle={s.bestSellingItem ? `${s.bestSellingItem.units} sold` : undefined}
          icon={UtensilsCrossed}
        />
        <DashboardCard
          title="Low stock alerts"
          value={s.lowStockCount}
          icon={Package}
          tone={s.lowStockCount > 0 ? 'danger' : 'default'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueChart
          title="Revenue (last 7 days)"
          data={analyticsPreview.data?.revenueSeries ?? []}
        />
        <OrdersChart
          title="Orders (last 7 days)"
          data={analyticsPreview.data?.ordersSeries ?? []}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Popular categories</h2>
          {(popularCategories.data ?? []).length === 0 ? (
            <EmptyState title="No category data yet" className="border-0 py-8" />
          ) : (
            <ul className="space-y-2">
              {(popularCategories.data ?? []).map((row) => (
                <li
                  key={String(row.category_name)}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{String(row.category_name)}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {Number(row.units_sold)} sold
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link to={PATHS.restaurant.orders} className="text-xs text-primary">
              View all
            </Link>
          </div>
          {(recentOrders.data ?? []).length === 0 ? (
            <EmptyState title="No orders yet" className="border-0 py-8" />
          ) : (
            <ul className="space-y-2">
              {(recentOrders.data ?? []).map((order) => {
                const customer = Array.isArray(order.customer)
                  ? order.customer[0]
                  : order.customer
                return (
                  <li key={order.id}>
                    <Link
                      to={orderDetailPath(order.id)}
                      className="flex items-center justify-between rounded-[var(--radius-md)] px-2 py-2 text-sm hover:bg-muted"
                    >
                      <div>
                        <p className="font-medium">#{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {(customer as { full_name?: string } | null)?.full_name ?? 'Customer'} ·{' '}
                          {formatStatus(order.status)}
                        </p>
                      </div>
                      <span className="tabular-nums">{formatCurrency(Number(order.total))}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Latest reviews</h2>
            <Link to={PATHS.restaurant.reviews} className="text-xs text-primary">
              View all
            </Link>
          </div>
          {(latestReviews.data ?? []).length === 0 ? (
            <EmptyState title="No reviews yet" className="border-0 py-8" />
          ) : (
            <ul className="space-y-3">
              {(latestReviews.data ?? []).map((review) => {
                const customer = Array.isArray(review.customer)
                  ? review.customer[0]
                  : review.customer
                return (
                  <li key={review.id} className="text-sm">
                    <p className="font-medium">
                      {(customer as { full_name?: string } | null)?.full_name ?? 'Customer'} ·{' '}
                      {review.rating}★
                    </p>
                    <p className="line-clamp-2 text-muted-foreground">{review.review}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          {[
            [PATHS.restaurant.orders, 'Manage orders'],
            [PATHS.restaurant.menu, 'Edit menu'],
            [PATHS.restaurant.inventory, 'Update inventory'],
            [PATHS.restaurant.analytics, 'View analytics'],
            [PATHS.restaurant.settings, 'Restaurant settings'],
          ].map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
