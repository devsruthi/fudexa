export const customerKeys = {
  all: ['customer'] as const,
  restaurants: {
    all: ['customer', 'restaurants'] as const,
    lists: () => [...customerKeys.restaurants.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...customerKeys.restaurants.lists(), filters] as const,
    infinite: (filters: Record<string, unknown>) =>
      [...customerKeys.restaurants.all, 'infinite', filters] as const,
    details: () => [...customerKeys.restaurants.all, 'detail'] as const,
    detail: (id: string) => [...customerKeys.restaurants.details(), id] as const,
    popular: () => [...customerKeys.restaurants.all, 'popular'] as const,
    featured: () => [...customerKeys.restaurants.all, 'featured'] as const,
  },
  menu: {
    all: ['customer', 'menu'] as const,
    categories: (restaurantId: string) =>
      [...customerKeys.menu.all, 'categories', restaurantId] as const,
    items: (restaurantId: string, categoryId?: string | null) =>
      [...customerKeys.menu.all, 'items', restaurantId, categoryId ?? 'all'] as const,
    featured: () => [...customerKeys.menu.all, 'featured'] as const,
  },
  orders: {
    all: ['customer', 'orders'] as const,
    lists: () => [...customerKeys.orders.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...customerKeys.orders.lists(), filters] as const,
    details: () => [...customerKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...customerKeys.orders.details(), id] as const,
    recent: () => [...customerKeys.orders.all, 'recent'] as const,
  },
  favorites: {
    all: ['customer', 'favorites'] as const,
    list: () => [...customerKeys.favorites.all, 'list'] as const,
    ids: () => [...customerKeys.favorites.all, 'ids'] as const,
  },
  profile: {
    all: ['customer', 'profile'] as const,
    me: () => [...customerKeys.profile.all, 'me'] as const,
  },
  reviews: {
    all: ['customer', 'reviews'] as const,
    byRestaurant: (restaurantId: string) =>
      [...customerKeys.reviews.all, restaurantId] as const,
  },
}
