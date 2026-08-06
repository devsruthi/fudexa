export const restaurantKeys = {
  all: ['restaurant'] as const,
  context: () => [...restaurantKeys.all, 'context'] as const,
  dashboard: (restaurantId: string) => [...restaurantKeys.all, 'dashboard', restaurantId] as const,
  orders: {
    all: (restaurantId: string) => [...restaurantKeys.all, 'orders', restaurantId] as const,
    list: (restaurantId: string, filters: Record<string, unknown>) =>
      [...restaurantKeys.orders.all(restaurantId), 'list', filters] as const,
    detail: (orderId: string) => [...restaurantKeys.all, 'order', orderId] as const,
  },
  menu: {
    all: (restaurantId: string) => [...restaurantKeys.all, 'menu', restaurantId] as const,
    list: (restaurantId: string, filters: Record<string, unknown>) =>
      [...restaurantKeys.menu.all(restaurantId), filters] as const,
    detail: (itemId: string) => [...restaurantKeys.all, 'menu-item', itemId] as const,
  },
  categories: {
    all: (restaurantId: string) => [...restaurantKeys.all, 'categories', restaurantId] as const,
  },
  inventory: {
    all: (restaurantId: string) => [...restaurantKeys.all, 'inventory', restaurantId] as const,
    movements: (restaurantId: string) =>
      [...restaurantKeys.inventory.all(restaurantId), 'movements'] as const,
  },
  reviews: {
    all: (restaurantId: string) => [...restaurantKeys.all, 'reviews', restaurantId] as const,
    list: (restaurantId: string, filters: Record<string, unknown>) =>
      [...restaurantKeys.reviews.all(restaurantId), filters] as const,
  },
  analytics: {
    all: (restaurantId: string) => [...restaurantKeys.all, 'analytics', restaurantId] as const,
    bundle: (restaurantId: string, range: string, from?: string, to?: string) =>
      [...restaurantKeys.analytics.all(restaurantId), range, from ?? '', to ?? ''] as const,
  },
  settings: (restaurantId: string) => [...restaurantKeys.all, 'settings', restaurantId] as const,
}
