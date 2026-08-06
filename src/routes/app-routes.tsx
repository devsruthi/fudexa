import { lazy, Suspense, type ComponentType } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { AuthLayout, CustomerLayout, RestaurantLayout } from '@/components/layout'
import { Spinner } from '@/components/ui'
import {
  ForgotPasswordPage,
  GuestRoute,
  LandingPage,
  LoginPage,
  NotFoundPage,
  ProtectedRoute,
  RegisterPage,
  ResetPasswordPage,
  RoleRoute,
  UnauthorizedPage,
} from '@/features/auth'
import { CustomerHomePage } from '@/features/customer/home'
import { CartPage } from '@/features/customer/cart'
import { CheckoutPage } from '@/features/customer/checkout'
import { MenuPage } from '@/features/customer/menu'
import { OrderDetailPage, OrdersPage } from '@/features/customer/orders'
import { ProfilePage } from '@/features/customer/profile'
import { RestaurantDetailPage, RestaurantsPage } from '@/features/customer/restaurants'
import { PATHS } from './paths'

function lazyPage(factory: () => Promise<{ [key: string]: ComponentType }>, exportName: string) {
  const Comp = lazy(() =>
    factory().then((mod) => ({ default: mod[exportName] as ComponentType })),
  )
  return (
    <Suspense
      fallback={
        <div className="flex min-h-48 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <Comp />
    </Suspense>
  )
}

const restaurant = {
  dashboard: () => lazyPage(() => import('@/features/restaurant/dashboard'), 'DashboardPage'),
  orders: () => lazyPage(() => import('@/features/restaurant/orders'), 'RestaurantOrdersPage'),
  orderDetail: () =>
    lazyPage(() => import('@/features/restaurant/orders'), 'RestaurantOrderDetailPage'),
  menu: () => lazyPage(() => import('@/features/restaurant/menu'), 'RestaurantMenuPage'),
  menuNew: () => lazyPage(() => import('@/features/restaurant/menu'), 'MenuItemNewPage'),
  menuEdit: () => lazyPage(() => import('@/features/restaurant/menu'), 'MenuItemEditPage'),
  categories: () => lazyPage(() => import('@/features/restaurant/categories'), 'CategoriesPage'),
  analytics: () => lazyPage(() => import('@/features/restaurant/analytics'), 'AnalyticsPage'),
  inventory: () => lazyPage(() => import('@/features/restaurant/inventory'), 'InventoryPage'),
  reviews: () => lazyPage(() => import('@/features/restaurant/reviews'), 'ReviewsPage'),
  settings: () => lazyPage(() => import('@/features/restaurant/settings'), 'SettingsPage'),
}

/**
 * Application route tree.
 * Role segments are isolated so new roles can mount without rewriting existing trees.
 */
export const appRoutes: RouteObject[] = [
  {
    path: PATHS.root,
    element: <LandingPage />,
  },
  {
    path: PATHS.unauthorized,
    element: <UnauthorizedPage />,
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: PATHS.auth.login, element: <LoginPage /> },
          { path: PATHS.auth.register, element: <RegisterPage /> },
          { path: PATHS.auth.forgotPassword, element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [{ path: PATHS.auth.resetPassword, element: <ResetPasswordPage /> }],
  },
  {
    path: '/auth',
    children: [
      { index: true, element: <Navigate to={PATHS.auth.login} replace /> },
      { path: 'login', element: <Navigate to={PATHS.auth.login} replace /> },
      { path: 'register', element: <Navigate to={PATHS.auth.register} replace /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={['customer']} />,
        children: [
          {
            path: PATHS.customer.root,
            element: <CustomerLayout />,
            children: [
              { index: true, element: <Navigate to={PATHS.customer.home} replace /> },
              { path: 'home', element: <CustomerHomePage /> },
              { path: 'restaurants', element: <RestaurantsPage /> },
              { path: 'restaurants/:restaurantId', element: <RestaurantDetailPage /> },
              { path: 'restaurants/:restaurantId/menu', element: <MenuPage /> },
              { path: 'cart', element: <CartPage /> },
              { path: 'checkout', element: <CheckoutPage /> },
              { path: 'orders', element: <OrdersPage /> },
              { path: 'orders/:orderId', element: <OrderDetailPage /> },
              { path: 'profile', element: <ProfilePage /> },
            ],
          },
        ],
      },
      {
        element: <RoleRoute allowedRoles={['restaurant']} />,
        children: [
          {
            path: PATHS.restaurant.root,
            element: <RestaurantLayout />,
            children: [
              { index: true, element: <Navigate to={PATHS.restaurant.dashboard} replace /> },
              { path: 'dashboard', element: restaurant.dashboard() },
              { path: 'orders', element: restaurant.orders() },
              { path: 'orders/:orderId', element: restaurant.orderDetail() },
              { path: 'menu', element: restaurant.menu() },
              { path: 'menu/new', element: restaurant.menuNew() },
              { path: 'menu/:itemId/edit', element: restaurant.menuEdit() },
              { path: 'categories', element: restaurant.categories() },
              { path: 'analytics', element: restaurant.analytics() },
              { path: 'inventory', element: restaurant.inventory() },
              { path: 'reviews', element: restaurant.reviews() },
              { path: 'settings', element: restaurant.settings() },
            ],
          },
        ],
      },
    ],
  },
  {
    path: PATHS.notFound,
    element: <NotFoundPage />,
  },
]
