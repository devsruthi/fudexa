export type AnalyticsPreset =
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | '90d'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom'

export interface DateRange {
  from: Date
  to: Date
  label: string
  previousFrom: Date
  previousTo: Date
}

export interface ChartPoint {
  label: string
  value: number
  secondary?: number
}

export interface NamedValue {
  name: string
  value: number
  meta?: string
}

export interface GrowthMetric {
  current: number
  previous: number
  changePct: number
}

export interface AnalyticsKpis {
  todayRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  annualRevenue: number
  totalOrders: number
  completedOrders: number
  cancelledOrders: number
  pendingOrders: number
  averageOrderValue: number
  averageRating: number
  newCustomers: number
  returningCustomers: number
  repeatCustomerRate: number
  grossProfit: number
  netRevenue: number
  inventoryValue: number
  discounts: number
  taxes: number
  deliveryFees: number
  completionRate: number
  cancellationRate: number
  revenueGrowth: GrowthMetric
  orderGrowth: GrowthMetric
}

export interface RevenueAnalytics {
  series: ChartPoint[]
  movingAverage: ChartPoint[]
  byWeekday: NamedValue[]
  comparison: GrowthMetric
  total: number
}

export interface OrdersAnalytics {
  series: ChartPoint[]
  byHour: NamedValue[]
  byWeekday: NamedValue[]
  statusBreakdown: NamedValue[]
  peakHours: NamedValue[]
  completionRate: number
  cancellationRate: number
  averagePrepMinutes: number
  trends: ChartPoint[]
}

export interface CustomerAnalytics {
  newCustomers: number
  returningCustomers: number
  retentionRate: number
  averageSpend: number
  topCustomers: { name: string; orders: number; spent: number }[]
  growthSeries: ChartPoint[]
  lifetimeValue: number
  repeatPurchaseRate: number
}

export interface MenuAnalytics {
  bestSellers: { name: string; units: number; revenue: number }[]
  worstSellers: { name: string; units: number; revenue: number }[]
  mostProfitable: { name: string; revenue: number; units: number }[]
  leastProfitable: { name: string; revenue: number; units: number }[]
  topCategories: { name: string; units: number; revenue: number }[]
  averagePrepMinutes: number
  combinations: { pair: string; count: number; rate: number }[]
  reorderFavorites: { name: string; orders: number }[]
}

export interface InventoryAnalytics {
  inventoryValue: number
  lowStock: { name: string; stock: number; limit: number }[]
  outOfStock: { name: string; stock: number }[]
  mostConsumed: { name: string; units: number }[]
  turnoverEstimate: number
  wasteEstimate: number
  restockRecommendations: { name: string; suggested: number; reason: string }[]
  skuCounts: { inStock: number; lowStock: number; outOfStock: number }
}

export interface ReviewAnalytics {
  averageRating: number
  totalReviews: number
  distribution: NamedValue[]
  trend: ChartPoint[]
  keywords: { word: string; count: number; sentiment: 'positive' | 'negative' | 'neutral' }[]
  positiveCount: number
  negativeCount: number
  responseRate: number
}

export interface FinancialAnalytics {
  revenue: number
  discounts: number
  taxes: number
  deliveryFees: number
  refunds: number
  profitEstimate: number
  monthlyGrowth: number
  dailyComparison: ChartPoint[]
}

export interface BusinessInsight {
  id: string
  tone: 'positive' | 'warning' | 'info' | 'critical'
  title: string
  detail: string
  metric?: string
}

export interface ForecastPoint {
  label: string
  predicted: number
  lower: number
  upper: number
}

export interface ForecastAnalytics {
  revenue: ForecastPoint[]
  orders: ForecastPoint[]
  peakHours: NamedValue[]
  busyDays: NamedValue[]
  inventoryDemand: { name: string; predictedUnits: number }[]
}

export interface EnterpriseAnalyticsBundle {
  range: DateRange
  kpis: AnalyticsKpis
  revenue: RevenueAnalytics
  orders: OrdersAnalytics
  customers: CustomerAnalytics
  menu: MenuAnalytics
  inventory: InventoryAnalytics
  reviews: ReviewAnalytics
  financial: FinancialAnalytics
  insights: BusinessInsight[]
  forecast: ForecastAnalytics
}
