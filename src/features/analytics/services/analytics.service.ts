import { supabase } from '@/lib/supabase'
import type {
  AnalyticsPreset,
  CustomerAnalytics,
  EnterpriseAnalyticsBundle,
  FinancialAnalytics,
  InventoryAnalytics,
  MenuAnalytics,
  OrdersAnalytics,
  RevenueAnalytics,
  ReviewAnalytics,
} from '@/features/analytics/types'
import {
  WEEKDAYS,
  growthPct,
  movingAverage,
  resolveDateRange,
  toISO,
} from '@/features/analytics/utils/date-range'
import { buildInsights } from '@/features/analytics/services/insights.service'
import { buildForecast } from '@/features/analytics/services/forecast.service'

type OrderRow = {
  id: string
  customer_id: string
  status: string
  total: number
  subtotal: number
  tax: number
  delivery_fee: number
  discount: number
  payment_status: string
  created_at: string
  updated_at: string
}

type OrderItemRow = {
  order_id: string
  menu_item_id: string
  quantity: number
  subtotal: number
  menu_item?: {
    id: string
    name: string
    preparation_time: number | null
    category_id: string | null
  } | null
}

function isPaidCompleted(o: OrderRow) {
  return o.status === 'Completed' && o.payment_status === 'Paid'
}

function sumRevenue(orders: OrderRow[]) {
  return orders.filter(isPaidCompleted).reduce((s, o) => s + Number(o.total), 0)
}

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function fetchOrders(restaurantId: string, from: Date, to: Date) {
  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, customer_id, status, total, subtotal, tax, delivery_fee, discount, payment_status, created_at, updated_at',
    )
    .eq('restaurant_id', restaurantId)
    .gte('created_at', toISO(from))
    .lte('created_at', toISO(to))
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as OrderRow[]
}

async function safeSingle<T>(promise: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  try {
    const { data, error } = await promise
    if (error) return null
    return data
  } catch {
    return null
  }
}

export async function getEnterpriseAnalytics(
  restaurantId: string,
  preset: AnalyticsPreset,
  customFrom?: string,
  customTo?: string,
): Promise<EnterpriseAnalyticsBundle> {
  const range = resolveDateRange(preset, customFrom, customTo)
  const now = new Date()

  const yearStart = new Date(now.getFullYear(), 0, 1)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
  weekStart.setHours(0, 0, 0, 0)
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const [
    periodOrders,
    previousOrders,
    todayOrders,
    weekOrders,
    monthOrders,
    yearOrders,
  ] = await Promise.all([
    fetchOrders(restaurantId, range.from, range.to),
    fetchOrders(restaurantId, range.previousFrom, range.previousTo),
    fetchOrders(restaurantId, todayStart, now),
    fetchOrders(restaurantId, weekStart, now),
    fetchOrders(restaurantId, monthStart, now),
    fetchOrders(restaurantId, yearStart, now),
  ])

  const periodIds = periodOrders.map((o) => o.id)
  let orderItems: OrderItemRow[] = []
  if (periodIds.length > 0) {
    const { data, error } = await supabase
      .from('order_items')
      .select(
        'order_id, menu_item_id, quantity, subtotal, menu_item:menu_items(id, name, preparation_time, category_id)',
      )
      .in('order_id', periodIds)
    if (error) throw error
    orderItems = (data ?? []) as unknown as OrderItemRow[]
  }

  const [
    bestRes,
    catRes,
    topCustRes,
    reviewStats,
    reviewsRes,
    inventoryVal,
    inventoryRes,
    restaurantRes,
  ] = await Promise.all([
    supabase
      .from('analytics_best_selling_menu_items')
      .select('menu_item_name, units_sold, revenue, order_count')
      .eq('restaurant_id', restaurantId)
      .order('units_sold', { ascending: false }),
    supabase
      .from('analytics_popular_categories')
      .select('category_name, units_sold, revenue')
      .eq('restaurant_id', restaurantId)
      .order('units_sold', { ascending: false })
      .limit(10),
    supabase
      .from('analytics_top_customers')
      .select('customer_name, order_count, total_spent')
      .eq('restaurant_id', restaurantId)
      .order('total_spent', { ascending: false })
      .limit(8),
    safeSingle(
      supabase
        .from('analytics_review_stats')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .maybeSingle(),
    ),
    supabase
      .from('reviews')
      .select('rating, review, reply, created_at')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', toISO(range.from))
      .lte('created_at', toISO(range.to))
      .order('created_at', { ascending: true }),
    safeSingle(
      supabase
        .from('analytics_inventory_value')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .maybeSingle(),
    ),
    supabase
      .from('inventory')
      .select('stock, low_stock_limit, status, menu_item:menu_items(name, price)')
      .eq('restaurant_id', restaurantId),
    supabase.from('restaurants').select('rating, total_reviews').eq('id', restaurantId).single(),
  ])

  if (reviewsRes.error) throw reviewsRes.error
  if (inventoryRes.error) throw inventoryRes.error

  const periodRevenue = sumRevenue(periodOrders)
  const previousRevenue = sumRevenue(previousOrders)
  const completed = periodOrders.filter((o) => o.status === 'Completed')
  const cancelled = periodOrders.filter((o) => o.status === 'Cancelled')
  const pending = periodOrders.filter((o) =>
    ['Pending', 'Accepted', 'Preparing', 'Ready', 'OutForDelivery'].includes(o.status),
  )

  const dayMap = new Map<string, { revenue: number; orders: number }>()
  const hourMap = new Map<number, number>()
  const weekdayRev = new Map<number, number>()
  const weekdayOrders = new Map<number, number>()
  const statusMap = new Map<string, number>()

  for (const o of periodOrders) {
    const key = dayKey(o.created_at)
    const entry = dayMap.get(key) ?? { revenue: 0, orders: 0 }
    entry.orders += 1
    if (isPaidCompleted(o)) entry.revenue += Number(o.total)
    dayMap.set(key, entry)

    const hour = new Date(o.created_at).getHours()
    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1)
    const dow = new Date(o.created_at).getDay()
    weekdayOrders.set(dow, (weekdayOrders.get(dow) ?? 0) + 1)
    if (isPaidCompleted(o)) {
      weekdayRev.set(dow, (weekdayRev.get(dow) ?? 0) + Number(o.total))
    }
    statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1)
  }

  const revenueSeries = [...dayMap.entries()].map(([label, v]) => ({
    label,
    value: Math.round(v.revenue * 100) / 100,
  }))
  const orderSeriesPts = [...dayMap.entries()].map(([label, v]) => ({
    label,
    value: v.orders,
  }))
  const ma = movingAverage(
    revenueSeries.map((p) => p.value),
    3,
  )

  const revenue: RevenueAnalytics = {
    series: revenueSeries.map((p, i) => ({ ...p, secondary: ma[i] })),
    movingAverage: revenueSeries.map((p, i) => ({ label: p.label, value: ma[i] })),
    byWeekday: WEEKDAYS.map((name, i) => ({
      name,
      value: Math.round((weekdayRev.get(i) ?? 0) * 100) / 100,
    })),
    comparison: {
      current: periodRevenue,
      previous: previousRevenue,
      changePct: growthPct(periodRevenue, previousRevenue),
    },
    total: periodRevenue,
  }

  const byHour = Array.from({ length: 24 }, (_, h) => ({
    name: `${String(h).padStart(2, '0')}:00`,
    value: hourMap.get(h) ?? 0,
  }))

  const prepTimes = orderItems
    .map((i) => i.menu_item?.preparation_time ?? 0)
    .filter((t) => t > 0)
  const avgPrep =
    prepTimes.length === 0
      ? 0
      : Math.round(prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length)

  const ordersAnalytics: OrdersAnalytics = {
    series: orderSeriesPts,
    byHour,
    byWeekday: WEEKDAYS.map((name, i) => ({ name, value: weekdayOrders.get(i) ?? 0 })),
    statusBreakdown: [...statusMap.entries()].map(([name, value]) => ({ name, value })),
    peakHours: [...byHour].sort((a, b) => b.value - a.value).slice(0, 6),
    completionRate:
      periodOrders.length === 0
        ? 0
        : Math.round((completed.length / periodOrders.length) * 1000) / 10,
    cancellationRate:
      periodOrders.length === 0
        ? 0
        : Math.round((cancelled.length / periodOrders.length) * 1000) / 10,
    averagePrepMinutes: avgPrep,
    trends: orderSeriesPts,
  }

  const firstOrderByCustomer = new Map<string, string>()
  for (const o of [...previousOrders, ...periodOrders].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )) {
    if (!firstOrderByCustomer.has(o.customer_id)) {
      firstOrderByCustomer.set(o.customer_id, o.created_at)
    }
  }
  const periodCustomers = new Set(periodOrders.map((o) => o.customer_id))
  let newCustomers = 0
  let returningCustomers = 0
  for (const id of periodCustomers) {
    const first = firstOrderByCustomer.get(id)
    if (first && new Date(first) >= range.from) newCustomers += 1
    else returningCustomers += 1
  }
  const customerOrderCounts = new Map<string, number>()
  for (const o of periodOrders) {
    customerOrderCounts.set(o.customer_id, (customerOrderCounts.get(o.customer_id) ?? 0) + 1)
  }
  const repeatBuyers = [...customerOrderCounts.values()].filter((c) => c > 1).length
  const paid = periodOrders.filter(isPaidCompleted)
  const avgSpend = paid.length ? periodRevenue / paid.length : 0

  const customers: CustomerAnalytics = {
    newCustomers,
    returningCustomers,
    retentionRate:
      periodCustomers.size === 0
        ? 0
        : Math.round((returningCustomers / periodCustomers.size) * 1000) / 10,
    averageSpend: Math.round(avgSpend * 100) / 100,
    topCustomers: (topCustRes.data ?? []).map((c) => ({
      name: String(c.customer_name ?? 'Customer'),
      orders: Number(c.order_count ?? 0),
      spent: Number(c.total_spent ?? 0),
    })),
    growthSeries: orderSeriesPts.map((p) => ({ label: p.label, value: p.value })),
    lifetimeValue:
      (topCustRes.data ?? []).reduce((s, c) => s + Number(c.total_spent ?? 0), 0) /
        Math.max((topCustRes.data ?? []).length, 1) || 0,
    repeatPurchaseRate:
      periodCustomers.size === 0
        ? 0
        : Math.round((repeatBuyers / periodCustomers.size) * 1000) / 10,
  }

  const itemAgg = new Map<
    string,
    { name: string; units: number; revenue: number; orders: Set<string> }
  >()
  const orderItemGroups = new Map<string, string[]>()
  for (const line of orderItems) {
    const name = line.menu_item?.name ?? 'Item'
    const agg = itemAgg.get(line.menu_item_id) ?? {
      name,
      units: 0,
      revenue: 0,
      orders: new Set<string>(),
    }
    agg.units += line.quantity
    agg.revenue += Number(line.subtotal)
    agg.orders.add(line.order_id)
    itemAgg.set(line.menu_item_id, agg)

    const names = orderItemGroups.get(line.order_id) ?? []
    names.push(name)
    orderItemGroups.set(line.order_id, names)
  }

  const ranked = [...itemAgg.values()].sort((a, b) => b.units - a.units)
  const byRevenue = [...itemAgg.values()].sort((a, b) => b.revenue - a.revenue)

  const pairCounts = new Map<string, number>()
  let multiItemOrders = 0
  for (const names of orderItemGroups.values()) {
    const unique = [...new Set(names)].sort()
    if (unique.length < 2) continue
    multiItemOrders += 1
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        const key = `${unique[i]} + ${unique[j]}`
        pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1)
      }
    }
  }

  const menu: MenuAnalytics = {
    bestSellers: ranked.slice(0, 8).map((r) => ({
      name: r.name,
      units: r.units,
      revenue: Math.round(r.revenue * 100) / 100,
    })),
    worstSellers: ranked
      .filter((r) => r.units > 0)
      .slice(-5)
      .reverse()
      .map((r) => ({
        name: r.name,
        units: r.units,
        revenue: Math.round(r.revenue * 100) / 100,
      })),
    mostProfitable: byRevenue.slice(0, 8).map((r) => ({
      name: r.name,
      revenue: Math.round(r.revenue * 100) / 100,
      units: r.units,
    })),
    leastProfitable: byRevenue
      .filter((r) => r.revenue > 0)
      .slice(-5)
      .reverse()
      .map((r) => ({
        name: r.name,
        revenue: Math.round(r.revenue * 100) / 100,
        units: r.units,
      })),
    topCategories: (catRes.data ?? []).map((c) => ({
      name: String(c.category_name ?? 'Category'),
      units: Number(c.units_sold ?? 0),
      revenue: Number(c.revenue ?? 0),
    })),
    averagePrepMinutes: avgPrep,
    combinations: [...pairCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pair, count]) => ({
        pair,
        count,
        rate: multiItemOrders === 0 ? 0 : Math.round((count / multiItemOrders) * 1000) / 10,
      })),
    reorderFavorites: ranked
      .filter((r) => r.orders.size > 1)
      .slice(0, 6)
      .map((r) => ({ name: r.name, orders: r.orders.size })),
  }

  if (menu.bestSellers.length === 0 && bestRes.data?.length) {
    menu.bestSellers = bestRes.data.slice(0, 8).map((r) => ({
      name: String(r.menu_item_name ?? 'Item'),
      units: Number(r.units_sold ?? 0),
      revenue: Number(r.revenue ?? 0),
    }))
    menu.worstSellers = [...bestRes.data]
      .sort((a, b) => Number(a.units_sold) - Number(b.units_sold))
      .slice(0, 5)
      .map((r) => ({
        name: String(r.menu_item_name ?? 'Item'),
        units: Number(r.units_sold ?? 0),
        revenue: Number(r.revenue ?? 0),
      }))
  }

  const invRows = inventoryRes.data ?? []
  const lowStock = invRows
    .filter((r) => r.status === 'LowStock')
    .map((r) => {
      const mi = Array.isArray(r.menu_item) ? r.menu_item[0] : r.menu_item
      return {
        name: (mi as { name?: string } | null)?.name ?? 'Item',
        stock: r.stock,
        limit: r.low_stock_limit,
      }
    })
  const outOfStock = invRows
    .filter((r) => r.status === 'OutOfStock')
    .map((r) => {
      const mi = Array.isArray(r.menu_item) ? r.menu_item[0] : r.menu_item
      return { name: (mi as { name?: string } | null)?.name ?? 'Item', stock: r.stock }
    })

  const invVal = inventoryVal as {
    inventory_value?: number
    in_stock_count?: number
    low_stock_count?: number
    out_of_stock_count?: number
  } | null

  const inventoryValue =
    Number(invVal?.inventory_value ?? 0) ||
    invRows.reduce((s, r) => {
      const mi = Array.isArray(r.menu_item) ? r.menu_item[0] : r.menu_item
      const price = Number((mi as { price?: number } | null)?.price ?? 0)
      return s + r.stock * price
    }, 0)

  const inventory: InventoryAnalytics = {
    inventoryValue: Math.round(inventoryValue * 100) / 100,
    lowStock,
    outOfStock,
    mostConsumed: menu.bestSellers.slice(0, 6).map((i) => ({ name: i.name, units: i.units })),
    turnoverEstimate:
      inventoryValue === 0 ? 0 : Math.round((periodRevenue / inventoryValue) * 100) / 100,
    wasteEstimate: Math.round(outOfStock.length * 12.5 * 100) / 100,
    restockRecommendations: [
      ...lowStock.map((i) => ({
        name: i.name,
        suggested: Math.max(i.limit * 3, 10),
        reason: 'Below low-stock threshold',
      })),
      ...outOfStock.map((i) => ({
        name: i.name,
        suggested: 20,
        reason: 'Out of stock — restore availability',
      })),
    ].slice(0, 8),
    skuCounts: {
      inStock: Number(invVal?.in_stock_count ?? invRows.filter((r) => r.status === 'InStock').length),
      lowStock: Number(invVal?.low_stock_count ?? lowStock.length),
      outOfStock: Number(invVal?.out_of_stock_count ?? outOfStock.length),
    },
  }

  const periodReviews = reviewsRes.data ?? []
  const reviewStatsRow = reviewStats as Record<string, number> | null
  const positiveWords = ['great', 'amazing', 'delicious', 'love', 'excellent', 'best', 'fresh', 'fast']
  const negativeWords = ['cold', 'late', 'slow', 'bad', 'worst', 'dirty', 'wrong', 'expensive']
  const wordCount = new Map<string, { count: number; sentiment: 'positive' | 'negative' | 'neutral' }>()
  for (const r of periodReviews) {
    const text = (r.review ?? '').toLowerCase()
    for (const w of [...positiveWords, ...negativeWords]) {
      if (!text.includes(w)) continue
      const sentiment = positiveWords.includes(w) ? 'positive' : 'negative'
      const prev = wordCount.get(w) ?? { count: 0, sentiment }
      wordCount.set(w, { count: prev.count + 1, sentiment })
    }
  }

  const reviewTrendMap = new Map<string, number[]>()
  for (const r of periodReviews) {
    const key = dayKey(r.created_at)
    const arr = reviewTrendMap.get(key) ?? []
    arr.push(r.rating)
    reviewTrendMap.set(key, arr)
  }

  const reviews: ReviewAnalytics = {
    averageRating: Number(
      reviewStatsRow?.average_rating ?? restaurantRes.data?.rating ?? 0,
    ),
    totalReviews: Number(
      reviewStatsRow?.total_reviews ?? restaurantRes.data?.total_reviews ?? 0,
    ),
    distribution: [1, 2, 3, 4, 5].map((star) => ({
      name: `${star}★`,
      value: Number(
        reviewStatsRow?.[`rating_${star}`] ??
          periodReviews.filter((r) => r.rating === star).length,
      ),
    })),
    trend: [...reviewTrendMap.entries()].map(([label, ratings]) => ({
      label,
      value: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
    })),
    keywords: [...wordCount.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([word, meta]) => ({ word, count: meta.count, sentiment: meta.sentiment })),
    positiveCount: periodReviews.filter((r) => r.rating >= 4).length,
    negativeCount: periodReviews.filter((r) => r.rating <= 2).length,
    responseRate: Number(
      reviewStatsRow?.response_rate_pct ??
        (periodReviews.length
          ? Math.round(
              (periodReviews.filter((r) => r.reply).length / periodReviews.length) * 1000,
            ) / 10
          : 0),
    ),
  }

  const discounts = periodOrders.reduce((s, o) => s + Number(o.discount), 0)
  const taxes = paid.reduce((s, o) => s + Number(o.tax), 0)
  const deliveryFees = paid.reduce((s, o) => s + Number(o.delivery_fee), 0)
  const refunds = periodOrders
    .filter((o) => o.payment_status === 'Refunded')
    .reduce((s, o) => s + Number(o.total), 0)
  const cogs = paid.reduce((s, o) => s + Number(o.subtotal) * 0.32, 0)
  const grossProfit = Math.round((periodRevenue - cogs) * 100) / 100
  const netRevenue = Math.round((periodRevenue - discounts - refunds) * 100) / 100

  const financial: FinancialAnalytics = {
    revenue: periodRevenue,
    discounts: Math.round(discounts * 100) / 100,
    taxes: Math.round(taxes * 100) / 100,
    deliveryFees: Math.round(deliveryFees * 100) / 100,
    refunds: Math.round(refunds * 100) / 100,
    profitEstimate: grossProfit,
    monthlyGrowth: growthPct(sumRevenue(monthOrders), previousRevenue),
    dailyComparison: revenueSeries,
  }

  const aov = paid.length ? periodRevenue / paid.length : 0

  const kpis = {
    todayRevenue: sumRevenue(todayOrders),
    weeklyRevenue: sumRevenue(weekOrders),
    monthlyRevenue: sumRevenue(monthOrders),
    annualRevenue: sumRevenue(yearOrders),
    totalOrders: periodOrders.length,
    completedOrders: completed.length,
    cancelledOrders: cancelled.length,
    pendingOrders: pending.length,
    averageOrderValue: Math.round(aov * 100) / 100,
    averageRating: reviews.averageRating,
    newCustomers,
    returningCustomers,
    repeatCustomerRate: customers.repeatPurchaseRate,
    grossProfit,
    netRevenue,
    inventoryValue: inventory.inventoryValue,
    discounts: financial.discounts,
    taxes: financial.taxes,
    deliveryFees: financial.deliveryFees,
    completionRate: ordersAnalytics.completionRate,
    cancellationRate: ordersAnalytics.cancellationRate,
    revenueGrowth: revenue.comparison,
    orderGrowth: {
      current: periodOrders.length,
      previous: previousOrders.length,
      changePct: growthPct(periodOrders.length, previousOrders.length),
    },
  }

  const forecast = buildForecast({
    revenueSeries: revenueSeries.map((p) => p.value),
    orderSeries: orderSeriesPts.map((p) => p.value),
    byHour,
    byWeekday: ordersAnalytics.byWeekday,
    topItems: menu.bestSellers,
  })

  const insights = buildInsights({
    revenue,
    orders: ordersAnalytics,
    customers,
    menu,
    inventory,
    reviews,
    kpis,
  })

  return {
    range,
    kpis,
    revenue,
    orders: ordersAnalytics,
    customers,
    menu,
    inventory,
    reviews,
    financial,
    insights,
    forecast,
  }
}

export const analyticsService = {
  getEnterpriseAnalytics,
}
