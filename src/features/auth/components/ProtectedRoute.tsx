import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import { useAuth } from '@/features/auth/hooks'
import { PATHS } from '@/routes/paths'

interface ProtectedRouteProps {
  redirectTo?: string
}

/**
 * Ensures the user is authenticated before rendering child routes.
 */
export function ProtectedRoute({ redirectTo = PATHS.auth.login }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Spinner label="Checking session…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  return <Outlet />
}
