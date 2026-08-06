import { Navigate, type RouteObject } from 'react-router-dom'
import { AuthLayout, CustomerLayout, RestaurantLayout } from '@/components/layout'
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
    // Legacy /auth/* redirects
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
              { path: 'dashboard', element: <DashboardPage /> },
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
    ],
  },
  {
    path: PATHS.notFound,
    element: <NotFoundPage />,
  },
]
