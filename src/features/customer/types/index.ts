import type {
  Category,
  Favorite,
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
  Favorite,
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

export type RestaurantSort = 'rating' | 'name' | 'newest' | 'open_first'

export interface RestaurantFilters {
  search?: string
  city?: string
  openOnly?: boolean
  minRating?: number
  sort?: RestaurantSort
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface RestaurantWithMeta extends Restaurant {
  isFavorite?: boolean
  estimatedDeliveryMinutes?: number
  cuisineTags?: string[]
}

export interface MenuItemWithCategory extends MenuItem {
  category?: Category | null
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    menu_item?: Pick<MenuItem, 'id' | 'name' | 'image' | 'preparation_time'> | null
  })[]
  restaurant?: Pick<Restaurant, 'id' | 'name' | 'logo' | 'city'> | null
}

export interface CartLineItem {
  menuItemId: string
  restaurantId: string
  restaurantName: string
  name: string
  price: number
  image: string | null
  quantity: number
  preparationTime: number | null
}

export interface CartTotals {
  subtotal: number
  tax: number
  deliveryFee: number
  discount: number
  total: number
  itemCount: number
}

export interface CheckoutFormValues {
  deliveryAddress: string
  phone: string
  notes?: string
  paymentMethod: PaymentMethod
}

export interface CreateOrderPayload {
  restaurantId: string
  deliveryAddress: string
  phone: string
  notes?: string
  paymentMethod: PaymentMethod
  items: { menuItemId: string; quantity: number; price: number }[]
  subtotal: number
  tax: number
  deliveryFee: number
  discount: number
  total: number
}

export interface SavedAddress {
  id: string
  label: string
  address: string
  isDefault?: boolean
}

export interface ProfileUpdatePayload {
  fullName: string
  phone?: string | null
  avatarUrl?: string | null
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'Pending',
  'Accepted',
  'Preparing',
  'Ready',
  'OutForDelivery',
  'Completed',
]

export const TAX_RATE = 0.08
export const DEFAULT_DELIVERY_FEE = 3.99
export const FREE_DELIVERY_THRESHOLD = 40
