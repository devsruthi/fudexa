import { supabase, type Order, type OrderStatus } from '@/lib/supabase'
import type { OrderStatusEvent, OrderWithDetails } from '@/features/restaurant/types'

export interface MerchantOrderFilters {
  status?: OrderStatus | 'all' | 'active'
  search?: string
}

export class OrderConflictError extends Error {
  constructor(message = 'This order was updated on another device. Refresh and try again.') {
    super(message)
    this.name = 'OrderConflictError'
  }
}

export interface UpdateOrderStatusOptions {
  expectedUpdatedAt?: string
  expectedVersion?: number
}

export async function getOrders(
  restaurantId: string,
  filters: MerchantOrderFilters = {},
): Promise<OrderWithDetails[]> {
  let query = supabase
    .from('orders')
    .select(
      `
      *,
      customer:profiles!orders_customer_id_fkey(id, full_name, email, phone),
      order_items(*, menu_item:menu_items(id, name, image, preparation_time))
    `,
    )
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  if (filters.status === 'active') {
    query = query.in('status', ['Pending', 'Accepted', 'Preparing', 'Ready', 'OutForDelivery'])
  } else if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`
    query = query.or(`order_number.ilike.${term},delivery_address.ilike.${term},notes.ilike.${term}`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as OrderWithDetails[]
}

export async function getOrder(orderId: string, restaurantId: string): Promise<OrderWithDetails> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      customer:profiles!orders_customer_id_fkey(id, full_name, email, phone),
      order_items(*, menu_item:menu_items(id, name, image, preparation_time)),
      status_events:order_status_events(*)
    `,
    )
    .eq('id', orderId)
    .eq('restaurant_id', restaurantId)
    .single()

  if (error) throw error

  const row = data as unknown as OrderWithDetails & { status_events?: OrderStatusEvent[] }
  if (row.status_events) {
    row.status_events = [...row.status_events].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
  }
  return row
}

export async function updateOrderStatus(
  orderId: string,
  restaurantId: string,
  status: OrderStatus,
  options: UpdateOrderStatusOptions = {},
): Promise<Order> {
  let query = supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('restaurant_id', restaurantId)

  if (options.expectedVersion != null) {
    query = query.eq('version', options.expectedVersion)
  } else if (options.expectedUpdatedAt) {
    query = query.eq('updated_at', options.expectedUpdatedAt)
  }

  const { data, error } = await query.select('*').maybeSingle()
  if (error) throw error
  if (!data) {
    throw new OrderConflictError()
  }
  return data
}

export const merchantOrderService = {
  getOrders,
  getOrder,
  updateOrderStatus,
}
