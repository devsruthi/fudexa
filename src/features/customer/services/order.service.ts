import { supabase, type Order, type OrderStatus } from '@/lib/supabase'
import type { CreateOrderPayload, OrderWithItems, PaginatedResult } from '@/features/customer/types'
import { estimateDeliveryMinutes } from '@/features/customer/utils'

export interface OrderListFilters {
  search?: string
  status?: OrderStatus | 'all'
  page?: number
  pageSize?: number
}

export async function createOrder(customerId: string, payload: CreateOrderPayload): Promise<Order> {
  const estimated = new Date()
  estimated.setMinutes(estimated.getMinutes() + estimateDeliveryMinutes(30))

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      restaurant_id: payload.restaurantId,
      status: 'Pending',
      subtotal: payload.subtotal,
      tax: payload.tax,
      delivery_fee: payload.deliveryFee,
      discount: payload.discount,
      total: payload.total,
      payment_status: payload.paymentMethod === 'Cash' ? 'Pending' : 'Paid',
      payment_method: payload.paymentMethod,
      delivery_address: payload.deliveryAddress,
      notes: payload.notes
        ? `${payload.notes}${payload.phone ? ` | Phone: ${payload.phone}` : ''}`
        : payload.phone
          ? `Phone: ${payload.phone}`
          : null,
      estimated_delivery: estimated.toISOString(),
    })
    .select('*')
    .single()

  if (orderError) throw orderError

  const lines = payload.items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menuItemId,
    quantity: item.quantity,
    price: item.price,
    subtotal: Math.round(item.price * item.quantity * 100) / 100,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(lines)
  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id)
    throw itemsError
  }

  // Persist phone on profile when provided
  if (payload.phone) {
    await supabase.from('profiles').update({ phone: payload.phone }).eq('id', customerId)
  }

  return order
}

export async function getOrders(
  customerId: string,
  filters: OrderListFilters = {},
): Promise<PaginatedResult<OrderWithItems>> {
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('orders')
    .select(
      `
      *,
      restaurant:restaurants(id, name, logo, city),
      order_items(*, menu_item:menu_items(id, name, image, preparation_time))
    `,
      { count: 'exact' },
    )
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`
    query = query.or(`order_number.ilike.${term},delivery_address.ilike.${term}`)
  }

  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  const rows = (data ?? []) as unknown as OrderWithItems[]
  const total = count ?? 0

  return {
    data: rows,
    count: total,
    page,
    pageSize,
    hasMore: from + rows.length < total,
  }
}

export async function getOrder(orderId: string, customerId: string): Promise<OrderWithItems> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      restaurant:restaurants(id, name, logo, city, phone, address),
      order_items(*, menu_item:menu_items(id, name, image, preparation_time))
    `,
    )
    .eq('id', orderId)
    .eq('customer_id', customerId)
    .single()

  if (error) throw error
  return data as unknown as OrderWithItems
}

export async function getRecentOrders(customerId: string, limit = 5): Promise<OrderWithItems[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      restaurant:restaurants(id, name, logo, city),
      order_items(*, menu_item:menu_items(id, name, image, preparation_time))
    `,
    )
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as unknown as OrderWithItems[]
}

export const orderService = {
  createOrder,
  getOrders,
  getOrder,
  getRecentOrders,
}
