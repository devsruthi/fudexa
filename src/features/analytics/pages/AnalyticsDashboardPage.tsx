import { useState } from 'react'
import {
  DollarSign,
  Package,
  Percent,
  RefreshCw,
  ShoppingBag,
  Star,
  Users,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui'
import {
  AreaTrendChart,
  BarMetricChart,
  DonutChart,
  ForecastChart,
  HorizontalBarChart,
  PeakHeatmap,
} from '@/features/analytics/components/Charts'
import { DateRangeFilter } from '@/features/analytics/components/DateRangeFilter'
import { InsightCards } from '@/features/analytics/components/InsightCards'
import { KpiCard } from '@/features/analytics/components/KpiCard'
import { useEnterpriseAnalytics } from '@/features/analytics/hooks'
import type { AnalyticsPreset } from '@/features/analytics/types'
import {
  exportAnalyticsCsv,
  exportAnalyticsExcel,
  exportPdfSummary,
} from '@/features/analytics/utils/export'
import {
  EmptyState,
  ErrorState,
  PageHeader,
  TableSkeleton,
} from '@/features/restaurant/components'
import { formatCurrency, formatStatus } from '@/features/restaurant/utils'

export function AnalyticsDashboardPage() {
  const [preset, setPreset] = useState<AnalyticsPreset>('7d')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const query = useEnterpriseAnalytics(
    preset,
    preset === 'custom' ? from || undefined : undefined,
    preset === 'custom' ? to || undefined : undefined,
  )

  if (query.isError) {
    return (
      <ErrorState
        description={(query.error as Error).message}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const data = query.data

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description={
          data
            ? `${data.range.label} · vs previous period`
            : 'Business intelligence for your restaurant'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!data}
              onClick={() => data && exportAnalyticsCsv(data)}
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!data}
              onClick={() => data && exportAnalyticsExcel(data)}
            >
              Export Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!data}
              onClick={() => data && exportPdfSummary(data)}
            >
              PDF summary
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Refresh analytics"
              onClick={() => void query.refetch()}
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
        }
      />

      <DateRangeFilter
        preset={preset}
        from={from}
        to={to}
        onPresetChange={setPreset}
        onFromChange={setFrom}
        onToChange={setTo}
      />

      {query.isLoading || !data ? (
        <TableSkeleton rows={10} />
      ) : data.kpis.totalOrders === 0 && data.kpis.netRevenue === 0 ? (
        <EmptyState
          title="No analytics data yet"
          description="Completed orders in this range will unlock KPIs, charts, and insights."
        />
      ) : (
        <>
          <section aria-label="Key performance indicators">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Today's revenue"
                value={data.kpis.todayRevenue}
                format="currency"
                icon={DollarSign}
                tone="success"
              />
              <KpiCard
                title="Weekly revenue"
                value={data.kpis.weeklyRevenue}
                format="currency"
                icon={Wallet}
              />
              <KpiCard
                title="Monthly revenue"
                value={data.kpis.monthlyRevenue}
                format="currency"
                changePct={data.financial.monthlyGrowth}
                icon={DollarSign}
              />
              <KpiCard
                title="Annual revenue"
                value={data.kpis.annualRevenue}
                format="currency"
                icon={DollarSign}
              />
              <KpiCard
                title="Total orders"
                value={data.kpis.totalOrders}
                changePct={data.kpis.orderGrowth.changePct}
                icon={ShoppingBag}
              />
              <KpiCard title="Completed" value={data.kpis.completedOrders} tone="success" />
              <KpiCard
                title="Cancelled"
                value={data.kpis.cancelledOrders}
                tone="danger"
              />
              <KpiCard title="Pending" value={data.kpis.pendingOrders} tone="warning" />
              <KpiCard
                title="Avg order value"
                value={data.kpis.averageOrderValue}
                format="currency"
                icon={Wallet}
              />
              <KpiCard
                title="Avg rating"
                value={data.kpis.averageRating}
                icon={Star}
                subtitle={`${data.reviews.totalReviews} reviews`}
              />
              <KpiCard title="New customers" value={data.kpis.newCustomers} icon={Users} />
              <KpiCard
                title="Returning"
                value={data.kpis.returningCustomers}
                icon={Users}
                subtitle={`${data.kpis.repeatCustomerRate}% repeat`}
              />
              <KpiCard
                title="Gross profit (est.)"
                value={data.kpis.grossProfit}
                format="currency"
                tone="success"
              />
              <KpiCard
                title="Net revenue"
                value={data.kpis.netRevenue}
                format="currency"
                changePct={data.kpis.revenueGrowth.changePct}
              />
              <KpiCard
                title="Inventory value"
                value={data.kpis.inventoryValue}
                format="currency"
                icon={Package}
              />
              <KpiCard
                title="Completion rate"
                value={data.kpis.completionRate}
                format="percent"
                icon={Percent}
              />
            </div>
          </section>

          <section aria-label="Business insights">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Business insights</h2>
            <InsightCards insights={data.insights} />
          </section>

          <section className="grid gap-4 lg:grid-cols-2" aria-label="Revenue and orders">
            <AreaTrendChart
              title="Revenue (with moving average)"
              data={data.revenue.series}
              valuePrefix="$"
            />
            <BarMetricChart title="Orders over time" data={data.orders.series} />
            <BarMetricChart
              title="Revenue by weekday"
              data={data.revenue.byWeekday.map((d) => ({ label: d.name, value: d.value }))}
            />
            <DonutChart
              title="Order status mix"
              data={data.orders.statusBreakdown.map((s) => ({
                name: formatStatus(s.name),
                value: s.value,
              }))}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2" aria-label="Peaks and customers">
            <PeakHeatmap title="Orders by hour" hours={data.orders.byHour} />
            <HorizontalBarChart title="Peak hours" data={data.orders.peakHours} />
            <HorizontalBarChart
              title="Top customers"
              data={data.customers.topCustomers.map((c) => ({
                name: c.name,
                value: c.spent,
              }))}
            />
            <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold">Customer health</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Retention</dt>
                  <dd className="text-lg font-semibold">{data.customers.retentionRate}%</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Repeat purchase</dt>
                  <dd className="text-lg font-semibold">{data.customers.repeatPurchaseRate}%</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Avg spend</dt>
                  <dd className="text-lg font-semibold">
                    {formatCurrency(data.customers.averageSpend)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Lifetime value (top)</dt>
                  <dd className="text-lg font-semibold">
                    {formatCurrency(data.customers.lifetimeValue)}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2" aria-label="Menu analytics">
            <HorizontalBarChart
              title="Best-selling items"
              data={data.menu.bestSellers.map((i) => ({ name: i.name, value: i.units }))}
            />
            <HorizontalBarChart
              title="Most profitable items"
              data={data.menu.mostProfitable.map((i) => ({ name: i.name, value: i.revenue }))}
            />
            <DonutChart
              title="Revenue by category"
              data={data.menu.topCategories.map((c) => ({ name: c.name, value: c.revenue }))}
            />
            <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold">Popular combinations</h3>
              {data.menu.combinations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enough multi-item orders yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {data.menu.combinations.map((c) => (
                    <li key={c.pair} className="flex justify-between gap-2">
                      <span>{c.pair}</span>
                      <span className="tabular-nums text-muted-foreground">{c.rate}%</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                Avg prep estimate: {data.menu.averagePrepMinutes || '—'} min
              </p>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2" aria-label="Inventory and reviews">
            <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold">Inventory alerts</h3>
              <div className="mb-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-success/10 p-2">
                  <p className="text-xs text-muted-foreground">In stock</p>
                  <p className="font-semibold">{data.inventory.skuCounts.inStock}</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-2">
                  <p className="text-xs text-muted-foreground">Low</p>
                  <p className="font-semibold">{data.inventory.skuCounts.lowStock}</p>
                </div>
                <div className="rounded-lg bg-danger/10 p-2">
                  <p className="text-xs text-muted-foreground">Out</p>
                  <p className="font-semibold">{data.inventory.skuCounts.outOfStock}</p>
                </div>
              </div>
              <p className="text-sm">
                Value: <strong>{formatCurrency(data.inventory.inventoryValue)}</strong>
                <span className="text-muted-foreground">
                  {' '}
                  · turnover {data.inventory.turnoverEstimate}x
                </span>
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {data.inventory.restockRecommendations.slice(0, 5).map((r) => (
                  <li key={r.name} className="flex justify-between gap-2">
                    <span>
                      {r.name}
                      <span className="block text-xs text-muted-foreground">{r.reason}</span>
                    </span>
                    <span className="tabular-nums">+{r.suggested}</span>
                  </li>
                ))}
                {data.inventory.restockRecommendations.length === 0 ? (
                  <li className="text-muted-foreground">Stock levels look healthy.</li>
                ) : null}
              </ul>
            </div>

            <div className="space-y-4">
              <DonutChart title="Rating distribution" data={data.reviews.distribution} />
              <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
                <h3 className="mb-2 text-sm font-semibold">Review keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {data.reviews.keywords.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No keyword signals yet.</p>
                  ) : (
                    data.reviews.keywords.map((k) => (
                      <span
                        key={k.word}
                        className={
                          k.sentiment === 'positive'
                            ? 'rounded-full bg-success/15 px-2.5 py-1 text-xs text-success'
                            : k.sentiment === 'negative'
                              ? 'rounded-full bg-danger/15 px-2.5 py-1 text-xs text-danger'
                              : 'rounded-full bg-muted px-2.5 py-1 text-xs'
                        }
                      >
                        {k.word} · {k.count}
                      </span>
                    ))
                  )}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Response rate {data.reviews.responseRate}% ·{' '}
                  {data.reviews.positiveCount} positive / {data.reviews.negativeCount} negative
                  in range
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2" aria-label="Financial and forecast">
            <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold">Financial summary</h3>
              <dl className="space-y-2 text-sm">
                {[
                  ['Revenue', formatCurrency(data.financial.revenue)],
                  ['Discounts', formatCurrency(data.financial.discounts)],
                  ['Taxes', formatCurrency(data.financial.taxes)],
                  ['Delivery fees', formatCurrency(data.financial.deliveryFees)],
                  ['Refunds', formatCurrency(data.financial.refunds)],
                  ['Profit estimate', formatCurrency(data.financial.profitEstimate)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-border/60 py-1.5 last:border-0">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <ForecastChart title="7-day revenue forecast" data={data.forecast.revenue} />
            <ForecastChart title="7-day order forecast" data={data.forecast.orders} />
            <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold">Demand forecast</h3>
              <ul className="space-y-2 text-sm">
                {data.forecast.inventoryDemand.map((d) => (
                  <li key={d.name} className="flex justify-between gap-2">
                    <span>{d.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      ~{d.predictedUnits} units
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Busy days:{' '}
                {data.forecast.busyDays.map((d) => d.name).join(', ') || '—'}
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
