import type { ForecastAnalytics, NamedValue } from '@/features/analytics/types'
import { WEEKDAYS, linearForecast } from '@/features/analytics/utils/date-range'

export function buildForecast(input: {
  revenueSeries: number[]
  orderSeries: number[]
  byHour: NamedValue[]
  byWeekday: NamedValue[]
  topItems: { name: string; units: number }[]
}): ForecastAnalytics {
  const revenueForecast = linearForecast(input.revenueSeries, 7)
  const orderForecast = linearForecast(input.orderSeries, 7)

  const labels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  })

  return {
    revenue: revenueForecast.map((p, i) => ({ label: labels[i], ...p })),
    orders: orderForecast.map((p, i) => ({ label: labels[i], ...p })),
    peakHours: [...input.byHour].sort((a, b) => b.value - a.value).slice(0, 5),
    busyDays: WEEKDAYS.map((name, weekday) => {
      const found = input.byWeekday.find((d) => d.name === name)
      return { name, value: found?.value ?? 0, weekday }
    })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map(({ name, value }) => ({ name, value })),
    inventoryDemand: input.topItems.slice(0, 6).map((item) => ({
      name: item.name,
      predictedUnits: Math.max(1, Math.ceil(item.units * 1.15)),
    })),
  }
}
