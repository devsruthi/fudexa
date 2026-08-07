/**
 * Centralized route path constants.
 * Prefer these over string literals so role redirects stay consistent.
 */
export const PATHS = {
  root: '/',
  unauthorized: '/unauthorized',
  notFound: '*',

  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },

  customer: {
    root: '/customer',
    home: '/customer/home',
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
    dashboard: '/restaurant/dashboard',
    orders: '/restaurant/orders',
    orderDetail: '/restaurant/orders/:orderId',
    kitchen: '/restaurant/kitchen',
    menu: '/restaurant/menu',
    menuNew: '/restaurant/menu/new',
    menuEdit: '/restaurant/menu/:itemId/edit',
    categories: '/restaurant/categories',
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
