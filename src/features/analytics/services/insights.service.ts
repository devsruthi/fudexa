import type {
  BusinessInsight,
  CustomerAnalytics,
  EnterpriseAnalyticsBundle,
  InventoryAnalytics,
  MenuAnalytics,
  OrdersAnalytics,
  RevenueAnalytics,
  ReviewAnalytics,
} from '@/features/analytics/types'
import { growthPct } from '@/features/analytics/utils/date-range'

export function buildInsights(bundle: {
  revenue: RevenueAnalytics
  orders: OrdersAnalytics
  customers: CustomerAnalytics
  menu: MenuAnalytics
  inventory: InventoryAnalytics
  reviews: ReviewAnalytics
  kpis: EnterpriseAnalyticsBundle['kpis']
}): BusinessInsight[] {
  const insights: BusinessInsight[] = []
  const revChange = bundle.revenue.comparison.changePct

  if (revChange !== 0) {
    insights.push({
      id: 'revenue-growth',
      tone: revChange >= 0 ? 'positive' : 'warning',
      title: `Revenue ${revChange >= 0 ? 'up' : 'down'} ${Math.abs(revChange)}%`,
      detail: `Compared with the previous period (${bundle.revenue.comparison.previous.toFixed(0)} → ${bundle.revenue.comparison.current.toFixed(0)}).`,
      metric: `${revChange >= 0 ? '+' : ''}${revChange}%`,
    })
  }

  const topItem = bundle.menu.bestSellers[0]
  if (topItem) {
    insights.push({
      id: 'best-seller',
      tone: 'info',
      title: `${topItem.name} leads the menu`,
      detail: `${topItem.units} units sold generating strong ticket attach.`,
      metric: `${topItem.units} sold`,
    })
  }

  const peakDay = [...bundle.revenue.byWeekday].sort((a, b) => b.value - a.value)[0]
  if (peakDay && peakDay.value > 0) {
    insights.push({
      id: 'peak-day',
      tone: 'info',
      title: `${peakDay.name} evenings drive revenue`,
      detail: `${peakDay.name} is your strongest weekday in this range.`,
      metric: peakDay.name,
    })
  }

  if (bundle.inventory.lowStock.length > 0) {
    const item = bundle.inventory.lowStock[0]
    insights.push({
      id: 'low-stock',
      tone: 'critical',
      title: `Inventory for ${item.name} is running low`,
      detail: `Only ${item.stock} left (limit ${item.limit}). Restock soon to avoid lost sales.`,
      metric: `${item.stock} left`,
    })
  }

  const combo = bundle.menu.combinations[0]
  if (combo && combo.rate >= 20) {
    insights.push({
      id: 'combo',
      tone: 'positive',
      title: `Customers often order ${combo.pair}`,
      detail: `Appears together in about ${combo.rate}% of multi-item orders — consider a bundle.`,
      metric: `${combo.rate}%`,
    })
  }

  if (bundle.orders.averagePrepMinutes > 0) {
    insights.push({
      id: 'prep-time',
      tone: bundle.orders.averagePrepMinutes <= 20 ? 'positive' : 'warning',
      title:
        bundle.orders.averagePrepMinutes <= 20
          ? 'Prep time looks healthy'
          : 'Prep time may be slowing tickets',
      detail: `Average menu prep estimate is ${bundle.orders.averagePrepMinutes} minutes.`,
      metric: `${bundle.orders.averagePrepMinutes} min`,
    })
  }

  if (bundle.customers.repeatPurchaseRate > 0) {
    insights.push({
      id: 'repeat',
      tone: 'positive',
      title: `${bundle.customers.repeatPurchaseRate}% repeat purchase rate`,
      detail: `${bundle.customers.returningCustomers} returning guests contributed to retention this period.`,
      metric: `${bundle.customers.repeatPurchaseRate}%`,
    })
  }

  if (bundle.reviews.averageRating > 0) {
    insights.push({
      id: 'rating',
      tone: bundle.reviews.averageRating >= 4 ? 'positive' : 'warning',
      title: `Average rating ${bundle.reviews.averageRating.toFixed(1)}★`,
      detail: `${bundle.reviews.totalReviews} reviews · ${bundle.reviews.responseRate}% response rate.`,
      metric: `${bundle.reviews.averageRating.toFixed(1)}★`,
    })
  }

  const cancel = bundle.orders.cancellationRate
  if (cancel >= 8) {
    insights.push({
      id: 'cancel-rate',
      tone: 'warning',
      title: `Cancellation rate at ${cancel}%`,
      detail: 'Investigate rejected tickets, stockouts, or long wait times.',
      metric: `${cancel}%`,
    })
  }

  const aovGrowth = growthPct(bundle.kpis.averageOrderValue, bundle.revenue.comparison.previous / Math.max(bundle.kpis.completedOrders, 1))
  if (Number.isFinite(aovGrowth) && Math.abs(aovGrowth) >= 5) {
    insights.push({
      id: 'aov',
      tone: aovGrowth >= 0 ? 'positive' : 'info',
      title: `Average order value ${aovGrowth >= 0 ? 'improved' : 'softened'}`,
      detail: `AOV is ${bundle.kpis.averageOrderValue.toFixed(2)} for the selected range.`,
      metric: `${aovGrowth >= 0 ? '+' : ''}${aovGrowth}%`,
    })
  }

  return insights.slice(0, 8)
}
