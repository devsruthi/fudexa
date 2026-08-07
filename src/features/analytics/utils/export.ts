import { formatCurrency } from '@/features/restaurant/utils'
import type { EnterpriseAnalyticsBundle } from '@/features/analytics/types'

export function downloadCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const escape = (value: unknown) => {
    const raw = String(value ?? '')
    if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
      return `"${raw.replaceAll('"', '""')}"`
    }
    return raw
  }
  const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join(
    '\n',
  )
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, filename)
}

export function downloadExcel(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => String(row[h] ?? '')).join(',')),
  ].join('\n')
  const blob = new Blob(['\ufeff' + csv], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  })
  triggerDownload(blob, filename.endsWith('.xls') ? filename : `${filename}.xls`)
}

export function exportAnalyticsCsv(bundle: EnterpriseAnalyticsBundle): void {
  downloadCsv(`orderflow-analytics-${Date.now()}.csv`, [
    { section: 'KPI', metric: 'Net revenue', value: bundle.kpis.netRevenue },
    { section: 'KPI', metric: 'Total orders', value: bundle.kpis.totalOrders },
    { section: 'KPI', metric: 'AOV', value: bundle.kpis.averageOrderValue },
    { section: 'KPI', metric: 'Completion rate', value: bundle.kpis.completionRate },
    ...bundle.menu.bestSellers.map((r) => ({
      section: 'Best sellers',
      metric: r.name,
      value: r.revenue,
      units: r.units,
    })),
    ...bundle.customers.topCustomers.map((c) => ({
      section: 'Top customers',
      metric: c.name,
      value: c.spent,
      units: c.orders,
    })),
  ])
}

export function exportAnalyticsExcel(bundle: EnterpriseAnalyticsBundle): void {
  downloadExcel(`orderflow-analytics-${Date.now()}.xls`, [
    ...bundle.revenue.series.map((p) => ({
      sheet: 'Revenue',
      label: p.label,
      value: p.value,
      movingAvg: p.secondary ?? '',
    })),
    ...bundle.orders.byHour.map((p) => ({
      sheet: 'Peak hours',
      label: p.name,
      value: p.value,
      movingAvg: '',
    })),
  ])
}

export function exportPdfSummary(bundle: EnterpriseAnalyticsBundle): void {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>OrderFlow Analytics</title>
<style>
  body{font-family:ui-sans-serif,system-ui,sans-serif;padding:32px;color:#0f172a}
  h1{font-size:24px;margin:0 0 8px} h2{font-size:16px;margin:24px 0 8px}
  .muted{color:#64748b;font-size:13px} .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .card{border:1px solid #e2e8f0;border-radius:12px;padding:12px}
  .val{font-size:20px;font-weight:700} ul{padding-left:18px}
  @media print{body{padding:12px}}
</style></head><body>
  <h1>OrderFlow Analytics Summary</h1>
  <p class="muted">${bundle.range.label} · ${bundle.range.from.toLocaleDateString()} – ${bundle.range.to.toLocaleDateString()}</p>
  <div class="grid">
    <div class="card"><div class="muted">Net revenue</div><div class="val">${formatCurrency(bundle.kpis.netRevenue)}</div></div>
    <div class="card"><div class="muted">Orders</div><div class="val">${bundle.kpis.totalOrders}</div></div>
    <div class="card"><div class="muted">AOV</div><div class="val">${formatCurrency(bundle.kpis.averageOrderValue)}</div></div>
    <div class="card"><div class="muted">Completion</div><div class="val">${bundle.kpis.completionRate}%</div></div>
    <div class="card"><div class="muted">Avg rating</div><div class="val">${bundle.kpis.averageRating.toFixed(1)}</div></div>
    <div class="card"><div class="muted">Inventory value</div><div class="val">${formatCurrency(bundle.kpis.inventoryValue)}</div></div>
  </div>
  <h2>Insights</h2>
  <ul>${bundle.insights.map((i) => `<li><strong>${i.title}</strong> — ${i.detail}</li>`).join('')}</ul>
  <h2>Top sellers</h2>
  <ul>${bundle.menu.bestSellers.slice(0, 5).map((i) => `<li>${i.name}: ${i.units} units · ${formatCurrency(i.revenue)}</li>`).join('')}</ul>
  <script>window.onload=()=>window.print()</script>
</body></html>`
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) {
    triggerDownload(blob, `orderflow-analytics-summary-${Date.now()}.html`)
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
