import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { PATHS } from '@/routes/paths'

interface ProtectedRouteProps {
  /** Optional custom redirect when unauthenticated. Defaults to login. */
  redirectTo?: string
}

/**
 * Ensures the user is authenticated before rendering child routes.
 * Role checks belong in RoleGuard — keep concerns separated.
 */
export function ProtectedRoute({ redirectTo = PATHS.auth.login }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  return <Outlet />
}
