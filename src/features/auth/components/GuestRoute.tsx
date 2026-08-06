import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import { useAuth } from '@/features/auth/hooks'
import { getHomePathForRole } from '@/routes/role-config'

/**
 * Redirects authenticated users away from auth pages (login/register).
 */
export function GuestRoute() {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Spinner label="Loading…" />
      </div>
    )
  }

  if (isAuthenticated && user) {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
    return <Navigate to={from || getHomePathForRole(user.role)} replace />
  }

  return <Outlet />
}
