/** Canonical channel key builders — keep subscriptions deduplicated. */
export const channelKeys = {
  restaurantOrders: (restaurantId: string) => `rt-orders-restaurant-${restaurantId}`,
  orderDetail: (orderId: string) => `rt-orders-detail-${orderId}`,
  customerOrders: (customerId: string) => `rt-orders-customer-${customerId}`,
  inventory: (restaurantId: string) => `rt-inventory-${restaurantId}`,
  notifications: (userId: string) => `rt-notifications-${userId}`,
  reviews: (restaurantId: string) => `rt-reviews-${restaurantId}`,
  restaurant: (restaurantId: string) => `rt-restaurant-${restaurantId}`,
} as const
