import { Navigate, type RouteObject } from 'react-router-dom'
import { AuthLayout, CustomerLayout, RestaurantLayout } from '@/components/layout'
import { LoginPage, ProtectedRoute, RegisterPage, RoleGuard } from '@/features/auth'
import { LandingPage } from '@/features/auth/pages/LandingPage'
import { NotFoundPage, UnauthorizedPage } from '@/features/auth/pages/PublicPages'
import { CustomerHomePage } from '@/features/customer/home'
import { CartPage } from '@/features/customer/cart'
import { CheckoutPage } from '@/features/customer/checkout'
import { MenuPage } from '@/features/customer/menu'
import { OrderDetailPage, OrdersPage } from '@/features/customer/orders'
import { ProfilePage } from '@/features/customer/profile'
import { RestaurantDetailPage, RestaurantsPage } from '@/features/customer/restaurants'
import { AnalyticsPage } from '@/features/restaurant/analytics'
import { DashboardPage } from '@/features/restaurant/dashboard'
import { InventoryPage } from '@/features/restaurant/inventory'
import { RestaurantMenuPage } from '@/features/restaurant/menu'
import { RestaurantOrderDetailPage, RestaurantOrdersPage } from '@/features/restaurant/orders'
import { ReviewsPage } from '@/features/restaurant/reviews'
import { SettingsPage } from '@/features/restaurant/settings'
import { PATHS } from './paths'

/**
 * Application route tree.
 * Role segments are isolated so new roles (driver, kitchen, admin) can mount
 * alongside without rewriting existing trees.
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
    path: PATHS.auth.root,
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to={PATHS.auth.login} replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allowedRoles={['customer']} />,
        children: [
          {
            path: PATHS.customer.root,
            element: <CustomerLayout />,
            children: [
              { index: true, element: <CustomerHomePage /> },
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
        element: <RoleGuard allowedRoles={['restaurant']} />,
        children: [
          {
            path: PATHS.restaurant.root,
            element: <RestaurantLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'orders', element: <RestaurantOrdersPage /> },
              { path: 'orders/:orderId', element: <RestaurantOrderDetailPage /> },
              { path: 'menu', element: <RestaurantMenuPage /> },
              { path: 'analytics', element: <AnalyticsPage /> },
              { path: 'inventory', element: <InventoryPage /> },
              { path: 'reviews', element: <ReviewsPage /> },
              { path: 'settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
      // Future role mounts:
      // { element: <RoleGuard allowedRoles={['driver']} />, children: [...] },
      // { element: <RoleGuard allowedRoles={['kitchen']} />, children: [...] },
      // { element: <RoleGuard allowedRoles={['admin']} />, children: [...] },
    ],
  },
  {
    path: PATHS.notFound,
    element: <NotFoundPage />,
  },
]
