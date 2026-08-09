import { supabase } from '@/lib/supabase'
import type {
  AnalyticsBundle,
  AnalyticsRange,
  ChartPoint,
  DashboardStats,
} from '@/features/restaurant/types'
import { daysAgo, startOfDay, toISODate } from '@/features/restaurant/utils'

function rangeBounds(range: AnalyticsRange, from?: string, to?: string): { from: Date; to: Date } {
  const end = startOfDay()
  end.setHours(23, 59, 59, 999)
  if (range === 'today') return { from: startOfDay(), to: end }
  if (range === '7d') return { from: daysAgo(6), to: end }
  if (range === '30d') return { from: daysAgo(29), to: end }
  return {
    from: from ? new Date(from) : daysAgo(29),
    to: to ? new Date(to) : end,
  }
}

export async function getDashboardStats(restaurantId: string): Promise<DashboardStats> {
  const todayStart = toISODate(startOfDay())

  const [ordersRes, reviewsRes, customersRes, inventoryRes, bestSellerRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, status, total, payment_status, created_at')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', todayStart),
    supabase.from('restaurants').select('rating, total_reviews').eq('id', restaurantId).single(),
    supabase
      .from('orders')
      .select('customer_id')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'Completed'),
    supabase
      .from('inventory')
      .select('id', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .in('status', ['LowStock', 'OutOfStock']),
    supabase
      .from('analytics_best_selling_menu_items')
      .select('menu_item_id, menu_item_name, units_sold')
      .eq('restaurant_id', restaurantId)
      .order('units_sold', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (ordersRes.error) throw ordersRes.error
  if (reviewsRes.error) throw reviewsRes.error
  if (customersRes.error) throw customersRes.error
  if (inventoryRes.error) throw inventoryRes.error

  const todayOrders = ordersRes.data ?? []
  const uniqueCustomers = new Set((customersRes.data ?? []).map((o) => o.customer_id))

  return {
    todayRevenue: todayOrders
      .filter((o) => o.status === 'Completed' && o.payment_status === 'Paid')
      .reduce((sum, o) => sum + Number(o.total), 0),
    todayOrders: todayOrders.length,
    pendingOrders: todayOrders.filter((o) =>
      ['Pending', 'Accepted', 'Preparing', 'Ready', 'OutForDelivery'].includes(o.status),
    ).length,
    completedOrders: todayOrders.filter((o) => o.status === 'Completed').length,
    averageRating: Number(reviewsRes.data?.rating ?? 0),
    totalCustomers: uniqueCustomers.size,
    bestSellingItem: bestSellerRes.data
      ? {
          id: String(bestSellerRes.data.menu_item_id ?? ''),
          name: String(bestSellerRes.data.menu_item_name ?? '—'),
          units: Number(bestSellerRes.data.units_sold ?? 0),
        }
      : null,
    lowStockCount: inventoryRes.count ?? 0,
  }
}

export async function getAnalyticsBundle(
  restaurantId: string,
  range: AnalyticsRange,
  from?: string,
  to?: string,
): Promise<AnalyticsBundle> {
  const bounds = rangeBounds(range, from, to)
  const fromIso = toISODate(bounds.from)
  const toIso = toISODate(bounds.to)

  const [ordersRes, bestRes, catRes, aovRes, monthlyRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, status, total, payment_status, created_at')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', fromIso)
      .lte('created_at', toIso),
    supabase
      .from('analytics_best_selling_menu_items')
      .select('menu_item_name, units_sold, revenue')
      .eq('restaurant_id', restaurantId)
      .order('units_sold', { ascending: false })
      .limit(8),
    supabase
      .from('analytics_popular_categories')
      .select('category_name, units_sold, revenue')
      .eq('restaurant_id', restaurantId)
      .order('units_sold', { ascending: false })
      .limit(8),
    supabase
      .from('analytics_average_order_value')
      .select('average_order_value')
      .eq('restaurant_id', restaurantId)
      .maybeSingle(),
    supabase
      .from('analytics_monthly_sales')
      .select('month_start, revenue, completed_orders')
      .eq('restaurant_id', restaurantId)
      .order('month_start', { ascending: false })
      .limit(2),
  ])

  if (ordersRes.error) throw ordersRes.error

  const orders = ordersRes.data ?? []
  const dayKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const dayLabel = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const dayMap = new Map<string, { revenue: number; count: number }>()
  const hourMap = new Map<number, number>()
  const statusMap = new Map<string, number>()

  for (const order of orders) {
    const created = new Date(order.created_at)
    const key = dayKey(created)
    const hour = created.getHours()
    const entry = dayMap.get(key) ?? { revenue: 0, count: 0 }
    entry.count += 1
    if (order.status === 'Completed' && order.payment_status === 'Paid') {
      entry.revenue += Number(order.total)
    }
    dayMap.set(key, entry)
    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1)
    statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1)
  }

  // Continuous chronological series (oldest → newest), zeros for quiet days
  const revenueSeries: ChartPoint[] = []
  const ordersSeries: ChartPoint[] = []
  const cursor = new Date(bounds.from)
  cursor.setHours(0, 0, 0, 0)
  const endDay = new Date(bounds.to)
  endDay.setHours(0, 0, 0, 0)
  while (cursor <= endDay) {
    const key = dayKey(cursor)
    const entry = dayMap.get(key) ?? { revenue: 0, count: 0 }
    const label = dayLabel(cursor)
    revenueSeries.push({ label, value: Math.round(entry.revenue * 100) / 100 })
    ordersSeries.push({ label, value: entry.count })
    cursor.setDate(cursor.getDate() + 1)
  }

  const months = monthlyRes.data ?? []
  const current = Number(months[0]?.revenue ?? 0)
  const previous = Number(months[1]?.revenue ?? 0)
  const monthlyGrowth = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100

  return {
    revenueSeries,
    ordersSeries,
    bestSellers: (bestRes.data ?? []).map((row) => ({
      name: String(row.menu_item_name ?? 'Item'),
      units: Number(row.units_sold ?? 0),
      revenue: Number(row.revenue ?? 0),
    })),
    popularCategories: (catRes.data ?? []).map((row) => ({
      name: String(row.category_name ?? 'Category'),
      units: Number(row.units_sold ?? 0),
      revenue: Number(row.revenue ?? 0),
    })),
    statusBreakdown: [...statusMap.entries()].map(([status, count]) => ({ status, count })),
    peakHours: [...hourMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([hour, count]) => ({
        hour: `${String(hour).padStart(2, '0')}:00`,
        count,
      })),
    averageOrderValue: Number(aovRes.data?.average_order_value ?? 0),
    totalRevenue: revenueSeries.reduce((s, p) => s + p.value, 0),
    totalOrders: orders.length,
    monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
  }
}

export async function getRecentOrders(restaurantId: string, limit = 6) {
  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, order_number, status, total, created_at, customer:profiles!orders_customer_id_fkey(full_name)',
    )
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function getLatestReviews(restaurantId: string, limit = 4) {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, review, created_at, customer:profiles!reviews_customer_id_fkey(full_name)')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function getPopularCategories(restaurantId: string, limit = 5) {
  const { data, error } = await supabase
    .from('analytics_popular_categories')
    .select('category_name, units_sold, revenue')
    .eq('restaurant_id', restaurantId)
    .order('units_sold', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export const merchantAnalyticsService = {
  getDashboardStats,
  getAnalyticsBundle,
  getRecentOrders,
  getLatestReviews,
  getPopularCategories,
}
