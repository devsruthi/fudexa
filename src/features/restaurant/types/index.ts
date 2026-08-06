import type {
  Category,
  Inventory,
  InventoryStatus,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Profile,
  Restaurant,
  Review,
} from '@/lib/supabase'

export type {
  Category,
  Inventory,
  InventoryStatus,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Profile,
  Restaurant,
  Review,
}

export type AnalyticsRange = 'today' | '7d' | '30d' | 'custom'

export interface RestaurantContext {
  restaurant: Restaurant
  restaurantId: string
}

export interface OrderWithDetails extends Order {
  order_items: (OrderItem & {
    menu_item?: Pick<MenuItem, 'id' | 'name' | 'image' | 'preparation_time'> | null
  })[]
  customer?: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone'> | null
  status_events?: OrderStatusEvent[]
}

export interface OrderStatusEvent {
  id: string
  order_id: string
  from_status: OrderStatus | null
  to_status: OrderStatus
  changed_by: string | null
  note: string | null
  created_at: string
}

export interface MenuItemWithRelations extends MenuItem {
  category?: Category | null
  inventory?: Inventory | null
}

export interface InventoryWithItem extends Inventory {
  menu_item?: Pick<MenuItem, 'id' | 'name' | 'image' | 'price' | 'is_available'> | null
}

export interface InventoryMovement {
  id: string
  inventory_id: string
  restaurant_id: string
  menu_item_id: string
  previous_stock: number
  new_stock: number
  delta: number
  reason: string | null
  changed_by: string | null
  created_at: string
  menu_item?: Pick<MenuItem, 'id' | 'name'> | null
}

export interface ReviewWithCustomer extends Review {
  customer?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export interface DashboardStats {
  todayRevenue: number
  todayOrders: number
  pendingOrders: number
  completedOrders: number
  averageRating: number
  totalCustomers: number
  bestSellingItem: { id: string; name: string; units: number } | null
  lowStockCount: number
}

export interface ChartPoint {
  label: string
  value: number
}

export interface AnalyticsBundle {
  revenueSeries: ChartPoint[]
  ordersSeries: ChartPoint[]
  bestSellers: { name: string; units: number; revenue: number }[]
  popularCategories: { name: string; units: number; revenue: number }[]
  statusBreakdown: { status: string; count: number }[]
  peakHours: { hour: string; count: number }[]
  averageOrderValue: number
  totalRevenue: number
  totalOrders: number
  monthlyGrowth: number
}

export const ORDER_STATUS_ACTIONS: Partial<
  Record<OrderStatus, { label: string; next: OrderStatus; variant?: 'primary' | 'danger' | 'secondary' }[]>
> = {
  Pending: [
    { label: 'Accept', next: 'Accepted', variant: 'primary' },
    { label: 'Reject', next: 'Cancelled', variant: 'danger' },
  ],
  Accepted: [
    { label: 'Start preparing', next: 'Preparing', variant: 'primary' },
    { label: 'Cancel', next: 'Cancelled', variant: 'danger' },
  ],
  Preparing: [
    { label: 'Mark ready', next: 'Ready', variant: 'primary' },
    { label: 'Cancel', next: 'Cancelled', variant: 'danger' },
  ],
  Ready: [
    { label: 'Out for delivery', next: 'OutForDelivery', variant: 'primary' },
    { label: 'Complete', next: 'Completed', variant: 'secondary' },
  ],
  OutForDelivery: [{ label: 'Complete', next: 'Completed', variant: 'primary' }],
}

export const LIVE_ORDER_COLUMNS: OrderStatus[] = [
  'Pending',
  'Accepted',
  'Preparing',
  'Ready',
  'OutForDelivery',
  'Completed',
  'Cancelled',
]
