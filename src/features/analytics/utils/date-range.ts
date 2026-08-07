import type { AnalyticsPreset, DateRange } from '@/features/analytics/types'

export function startOfDay(date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date = new Date()): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function toISO(date: Date): string {
  return date.toISOString()
}

export function growthPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

export function movingAverage(values: number[], window = 3): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1)
    const slice = values.slice(start, i + 1)
    return Math.round((slice.reduce((a, b) => a + b, 0) / slice.length) * 100) / 100
  })
}

/** Simple linear regression forecast for next n periods. */
export function linearForecast(
  series: number[],
  periods: number,
): { predicted: number; lower: number; upper: number }[] {
  const n = series.length
  if (n < 2) {
    const last = series[n - 1] ?? 0
    return Array.from({ length: periods }, () => ({
      predicted: last,
      lower: last * 0.85,
      upper: last * 1.15,
    }))
  }

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += series[i]
    sumXY += i * series[i]
    sumXX += i * i
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1)
  const intercept = (sumY - slope * sumX) / n
  const residuals = series.map((y, i) => y - (intercept + slope * i))
  const rmse = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / n) || series[n - 1] * 0.1

  return Array.from({ length: periods }, (_, i) => {
    const x = n + i
    const predicted = Math.max(0, Math.round((intercept + slope * x) * 100) / 100)
    return {
      predicted,
      lower: Math.max(0, Math.round((predicted - 1.28 * rmse) * 100) / 100),
      upper: Math.round((predicted + 1.28 * rmse) * 100) / 100,
    }
  })
}

export function resolveDateRange(
  preset: AnalyticsPreset,
  customFrom?: string,
  customTo?: string,
): DateRange {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const withPrevious = (from: Date, to: Date, label: string): DateRange => {
    const duration = to.getTime() - from.getTime()
    const previousTo = new Date(from.getTime() - 1)
    const previousFrom = new Date(previousTo.getTime() - duration)
    return { from, to, label, previousFrom, previousTo }
  }

  switch (preset) {
    case 'today':
      return withPrevious(todayStart, todayEnd, 'Today')
    case 'yesterday': {
      const y = addDays(todayStart, -1)
      return withPrevious(startOfDay(y), endOfDay(y), 'Yesterday')
    }
    case '7d':
      return withPrevious(addDays(todayStart, -6), todayEnd, 'Last 7 days')
    case '30d':
      return withPrevious(addDays(todayStart, -29), todayEnd, 'Last 30 days')
    case '90d':
      return withPrevious(addDays(todayStart, -89), todayEnd, 'Last 90 days')
    case 'this_month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return withPrevious(startOfDay(from), todayEnd, 'This month')
    }
    case 'last_month': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0))
      return withPrevious(startOfDay(from), to, 'Last month')
    }
    case 'this_year': {
      const from = new Date(now.getFullYear(), 0, 1)
      return withPrevious(startOfDay(from), todayEnd, 'This year')
    }
    case 'custom': {
      const from = customFrom ? startOfDay(new Date(customFrom)) : addDays(todayStart, -29)
      const to = customTo ? endOfDay(new Date(customTo)) : todayEnd
      return withPrevious(from, to, 'Custom range')
    }
    default:
      return withPrevious(addDays(todayStart, -6), todayEnd, 'Last 7 days')
  }
}

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(Math.round(n * 100) / 100)
}
