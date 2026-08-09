import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Package,
  Star,
  Users,
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
  const { restaurantQuery, stats, recentOrders, latestReviews, analyticsPreview } =
    useDashboardData()

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
    <div className="relative space-y-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 h-48 bg-[radial-gradient(ellipse_at_top_left,_rgb(230_57_70_/_0.1),_transparent_55%),radial-gradient(ellipse_at_top_right,_rgb(255_122_0_/_0.1),_transparent_50%)]"
      />

      <PageHeader
        title={restaurantName ?? 'Dashboard'}
        description="A calm view of today’s floor."
        className="relative mb-2"
        actions={
          <div className="relative flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => navigate(PATHS.restaurant.orders)}
            >
              Live orders
            </Button>
            <Button
              size="sm"
              className="rounded-full border-0 bg-brand-gradient"
              onClick={() => navigate(PATHS.restaurant.menuNew)}
            >
              Add menu item
            </Button>
          </div>
        }
      />

      {/* Primary KPIs — only what matters today */}
      <div className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Revenue today"
          value={formatCurrency(s.todayRevenue)}
          icon={DollarSign}
          tone="success"
        />
        <DashboardCard title="Orders today" value={s.todayOrders} icon={ClipboardList} />
        <DashboardCard
          title="Pending"
          value={s.pendingOrders}
          icon={AlertTriangle}
          tone={s.pendingOrders > 0 ? 'warning' : 'default'}
        />
        <DashboardCard
          title="Completed"
          value={s.completedOrders}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      {/* Compact secondary pulse */}
      <div className="relative flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-border/60 bg-surface/70 px-5 py-3.5 text-sm backdrop-blur-sm">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Star className="size-3.5 text-secondary" aria-hidden />
          <span className="font-medium text-foreground">{s.averageRating.toFixed(1)}</span>
          avg rating
        </span>
        <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Users className="size-3.5 text-primary" aria-hidden />
          <span className="font-medium text-foreground">{s.totalCustomers}</span>
          customers
        </span>
        <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Package className="size-3.5 text-primary" aria-hidden />
          <span className="font-medium text-foreground">{s.lowStockCount}</span>
          low stock
        </span>
        {s.bestSellingItem ? (
          <>
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
            <span className="text-muted-foreground">
              Best seller{' '}
              <span className="font-medium text-foreground">{s.bestSellingItem.name}</span>
              <span className="text-muted-foreground"> · {s.bestSellingItem.units} sold</span>
            </span>
          </>
        ) : null}
      </div>

      <div className="relative grid gap-4 lg:grid-cols-2">
        <RevenueChart
          title="Revenue · 7 days"
          data={analyticsPreview.data?.revenueSeries ?? []}
        />
        <OrdersChart title="Orders · 7 days" data={analyticsPreview.data?.ordersSeries ?? []} />
      </div>

      <div className="relative grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/70 bg-surface/90 p-5 shadow-[var(--shadow-sm)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">Recent orders</h2>
            <Link
              to={PATHS.restaurant.orders}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:gap-1.5"
            >
              View all
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          {(recentOrders.data ?? []).length === 0 ? (
            <EmptyState title="No orders yet" className="border-0 py-10" />
          ) : (
            <ul className="divide-y divide-border/60">
              {(recentOrders.data ?? []).slice(0, 5).map((order) => {
                const customer = Array.isArray(order.customer)
                  ? order.customer[0]
                  : order.customer
                return (
                  <li key={order.id}>
                    <Link
                      to={orderDetailPath(order.id)}
                      className="flex items-center justify-between gap-3 py-3 text-sm transition hover:opacity-80"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">#{order.order_number}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {(customer as { full_name?: string } | null)?.full_name ?? 'Customer'} ·{' '}
                          {formatStatus(order.status)}
                        </p>
                      </div>
                      <span className="shrink-0 tabular-nums font-medium text-foreground">
                        {formatCurrency(Number(order.total))}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border/70 bg-surface/90 p-5 shadow-[var(--shadow-sm)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">Latest reviews</h2>
            <Link
              to={PATHS.restaurant.reviews}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:gap-1.5"
            >
              View all
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          {(latestReviews.data ?? []).length === 0 ? (
            <EmptyState title="No reviews yet" className="border-0 py-10" />
          ) : (
            <ul className="divide-y divide-border/60">
              {(latestReviews.data ?? []).slice(0, 4).map((review) => {
                const customer = Array.isArray(review.customer)
                  ? review.customer[0]
                  : review.customer
                return (
                  <li key={review.id} className="py-3 text-sm">
                    <p className="font-medium text-foreground">
                      {(customer as { full_name?: string } | null)?.full_name ?? 'Customer'}
                      <span className="ml-2 text-secondary">{review.rating}★</span>
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-muted-foreground">{review.review}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
