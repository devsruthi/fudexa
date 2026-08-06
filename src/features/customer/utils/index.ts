import { DEFAULT_DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, TAX_RATE, type CartLineItem, type CartTotals } from '../types'

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '25–35 min'
  const low = Math.max(15, minutes)
  const high = low + 10
  return `${low}–${high} min`
}

export function estimateDeliveryMinutes(avgPrep?: number | null): number {
  const prep = avgPrep && avgPrep > 0 ? avgPrep : 20
  return prep + 15
}

export function calculateCartTotals(items: CartLineItem[], discount = 0): CartTotals {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0))
  const tax = roundMoney(subtotal * TAX_RATE)
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || items.length === 0 ? 0 : DEFAULT_DELIVERY_FEE
  const safeDiscount = roundMoney(Math.min(discount, subtotal))
  const total = roundMoney(subtotal + tax + deliveryFee - safeDiscount)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return { subtotal, tax, deliveryFee, discount: safeDiscount, total, itemCount }
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function restaurantDetailPath(restaurantId: string): string {
  return `/customer/restaurants/${restaurantId}`
}

export function orderDetailPath(orderId: string): string {
  return `/customer/orders/${orderId}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function isRestaurantOpenNow(
  isOpen: boolean,
  openingTime?: string | null,
  closingTime?: string | null,
): boolean {
  if (!isOpen) return false
  if (!openingTime || !closingTime) return isOpen

  const now = new Date()
  const current = now.getHours() * 60 + now.getMinutes()
  const [openH, openM] = openingTime.split(':').map(Number)
  const [closeH, closeM] = closingTime.split(':').map(Number)
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  if (openMinutes === closeMinutes) return isOpen
  if (closeMinutes > openMinutes) {
    return current >= openMinutes && current < closeMinutes
  }
  // Overnight window
  return current >= openMinutes || current < closeMinutes
}

export function formatOrderStatus(status: string): string {
  return status.replace(/([a-z])([A-Z])/g, '$1 $2')
}

export { addressSchema, checkoutSchema, profileSchema } from './schemas'
export type { AddressSchema, CheckoutSchema, ProfileSchema } from './schemas'
