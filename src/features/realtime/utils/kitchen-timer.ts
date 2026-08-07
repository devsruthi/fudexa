/** Kitchen timing helpers — elapsed, countdown, urgency colors. */

export type KitchenUrgency = 'green' | 'orange' | 'red'

export function getPrepMinutes(order: {
  order_items?: { menu_item?: { preparation_time?: number | null } | null }[]
}): number {
  const times =
    order.order_items?.map((i) => i.menu_item?.preparation_time ?? 0).filter((t) => t > 0) ?? []
  if (!times.length) return 20
  return Math.max(...times)
}

export function getElapsedSeconds(createdAt: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 1000))
}

export function getRemainingSeconds(createdAt: string, prepMinutes: number, now: number): number {
  const deadline = new Date(createdAt).getTime() + prepMinutes * 60_000
  return Math.ceil((deadline - now) / 1000)
}

export function getUrgency(remainingSeconds: number, elapsedSeconds: number, prepMinutes: number): KitchenUrgency {
  if (remainingSeconds < 0) return 'red'
  const total = prepMinutes * 60
  const ratio = elapsedSeconds / Math.max(total, 1)
  if (ratio >= 0.75) return 'orange'
  return 'green'
}

export function formatDuration(totalSeconds: number): string {
  const abs = Math.abs(totalSeconds)
  const m = Math.floor(abs / 60)
  const s = abs % 60
  const core = `${m}:${String(s).padStart(2, '0')}`
  return totalSeconds < 0 ? `+${core}` : core
}

export const urgencyClasses: Record<KitchenUrgency, string> = {
  green: 'border-success/40 bg-success/5 ring-success/20',
  orange: 'border-warning/50 bg-warning/10 ring-warning/30',
  red: 'border-danger/50 bg-danger/10 ring-danger/40 animate-pulse',
}

export const urgencyTimerClasses: Record<KitchenUrgency, string> = {
  green: 'text-success',
  orange: 'text-warning',
  red: 'text-danger font-bold',
}
