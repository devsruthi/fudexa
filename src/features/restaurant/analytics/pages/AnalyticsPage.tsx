import { useMemo, useState } from 'react'
import {
  AnalyticsChart,
  DashboardCard,
  DashboardSkeleton,
  ErrorState,
  OrdersChart,
  PageHeader,
  RevenueChart,
} from '@/features/restaurant/components'
import { useAnalytics } from '@/features/restaurant/hooks'
import type { AnalyticsRange } from '@/features/restaurant/types'
import { downloadCsv, formatCurrency, formatStatus } from '@/features/restaurant/utils'
import { Button, Input } from '@/components/ui'
import { DollarSign, ShoppingBag, TrendingUp, Wallet } from 'lucide-react'

export function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>('7d')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const analytics = useAnalytics(range, from || undefined, to || undefined)

  const statusData = useMemo(
    () =>
      (analytics.data?.statusBreakdown ?? []).map((s) => ({
        name: formatStatus(s.status),
        value: s.count,
      })),
    [analytics.data],
  )

  const peakData = useMemo(
    () =>
      (analytics.data?.peakHours ?? []).map((h) => ({
        name: h.hour,
        value: h.count,
      })),
    [analytics.data],
  )

  if (analytics.isError) {
    return (
      <ErrorState
        description={(analytics.error as Error).message}
        onRetry={() => void analytics.refetch()}
      />
    )
  }

  const exportCsv = () => {
    const rows = (analytics.data?.bestSellers ?? []).map((r) => ({
      item: r.name,
      units: r.units,
      revenue: r.revenue,
    }))
    downloadCsv(`analytics-${range}.csv`, rows)
  }

  const exportExcel = () => {
    // Excel-compatible CSV (UTF-8 BOM)
    const rows = (analytics.data?.revenueSeries ?? []).map((r) => ({
      date: r.label,
      revenue: r.value,
    }))
    if (!rows.length) return
    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => String(row[h as keyof typeof row])).join(',')),
    ].join('\n')
    const blob = new Blob(['\ufeff' + csv], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${range}.xls`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Revenue, demand, and menu performance."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={exportCsv}>
              Export CSV
            </Button>
            <Button size="sm" variant="outline" onClick={exportExcel}>
              Export Excel
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-end gap-2">
        {(
          [
            ['today', 'Today'],
            ['7d', 'Last 7 days'],
            ['30d', 'Last 30 days'],
            ['custom', 'Custom'],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            size="sm"
            variant={range === id ? 'primary' : 'outline'}
            onClick={() => setRange(id)}
          >
            {label}
          </Button>
        ))}
        {range === 'custom' ? (
          <>
            <Input
              type="date"
              className="h-9 w-auto"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="From date"
            />
            <Input
              type="date"
              className="h-9 w-auto"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="To date"
            />
          </>
        ) : null}
      </div>

      {analytics.isLoading || !analytics.data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard
              title="Total revenue"
              value={formatCurrency(analytics.data.totalRevenue)}
              icon={DollarSign}
              tone="success"
            />
            <DashboardCard
              title="Total orders"
              value={analytics.data.totalOrders}
              icon={ShoppingBag}
            />
            <DashboardCard
              title="Avg order value"
              value={formatCurrency(analytics.data.averageOrderValue)}
              icon={Wallet}
            />
            <DashboardCard
              title="Monthly growth"
              value={`${analytics.data.monthlyGrowth}%`}
              icon={TrendingUp}
              tone={analytics.data.monthlyGrowth >= 0 ? 'success' : 'danger'}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <RevenueChart title="Revenue" data={analytics.data.revenueSeries} />
            <OrdersChart title="Orders" data={analytics.data.ordersSeries} />
            <AnalyticsChart
              title="Best selling items"
              data={analytics.data.bestSellers.map((b) => ({ name: b.name, value: b.units }))}
            />
            <AnalyticsChart
              title="Popular categories"
              data={analytics.data.popularCategories.map((c) => ({
                name: c.name,
                value: c.units,
              }))}
            />
            <AnalyticsChart title="Order status" data={statusData} type="pie" />
            <AnalyticsChart title="Peak hours" data={peakData} />
          </div>
        </>
      )}
    </div>
  )
}
