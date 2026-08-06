/**
 * Centralized route path constants.
 * Prefer these over string literals so role redirects stay consistent.
 */
export const PATHS = {
  root: '/',
  unauthorized: '/unauthorized',
  notFound: '*',

  auth: {
    root: '/auth',
    login: '/auth/login',
    register: '/auth/register',
  },

  customer: {
    root: '/customer',
    home: '/customer',
    restaurants: '/customer/restaurants',
    restaurantDetail: '/customer/restaurants/:restaurantId',
    menu: '/customer/restaurants/:restaurantId/menu',
    cart: '/customer/cart',
    checkout: '/customer/checkout',
    orders: '/customer/orders',
    orderDetail: '/customer/orders/:orderId',
    profile: '/customer/profile',
  },

  restaurant: {
    root: '/restaurant',
    dashboard: '/restaurant',
    orders: '/restaurant/orders',
    orderDetail: '/restaurant/orders/:orderId',
    menu: '/restaurant/menu',
    analytics: '/restaurant/analytics',
    inventory: '/restaurant/inventory',
    reviews: '/restaurant/reviews',
    settings: '/restaurant/settings',
  },

  /** Future role entry points — register routes when features land. */
  driver: {
    root: '/driver',
  },
  kitchen: {
    root: '/kitchen',
  },
  admin: {
    root: '/admin',
  },
} as const
