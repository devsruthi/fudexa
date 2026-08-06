import { formatCurrency as formatMoney } from '@/features/customer/utils'
import type { OrderStatus } from '@/features/restaurant/types'

export { formatMoney as formatCurrency }

export function formatStatus(status: string): string {
  return status.replace(/([a-z])([A-Z])/g, '$1 $2')
}

export function orderDetailPath(orderId: string): string {
  return `/restaurant/orders/${orderId}`
}

export function menuEditPath(itemId: string): string {
  return `/restaurant/menu/${itemId}/edit`
}

export function startOfDay(date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function daysAgo(n: number): Date {
  const d = startOfDay()
  d.setDate(d.getDate() - n)
  return d
}

export function toISODate(date: Date): string {
  return date.toISOString()
}

export function playNewOrderSound(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gain.gain.value = 0.04
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.18)
    window.setTimeout(() => void ctx.close(), 300)
  } catch {
    // Audio may be blocked until user gesture
  }
}

export function statusTone(status: OrderStatus): string {
  switch (status) {
    case 'Pending':
      return 'bg-warning/15 text-warning border-warning/30'
    case 'Accepted':
    case 'Preparing':
      return 'bg-primary/15 text-primary border-primary/30'
    case 'Ready':
    case 'OutForDelivery':
      return 'bg-secondary/20 text-foreground border-border'
    case 'Completed':
      return 'bg-success/15 text-success border-success/30'
    case 'Cancelled':
      return 'bg-danger/15 text-danger border-danger/30'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function inventoryTone(status: string): string {
  if (status === 'OutOfStock') return 'bg-danger/15 text-danger'
  if (status === 'LowStock') return 'bg-warning/15 text-warning'
  return 'bg-success/15 text-success'
}

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
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
