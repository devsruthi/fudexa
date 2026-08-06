import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import { useAuth } from '@/features/auth/hooks'
import { getHomePathForRole } from '@/routes/role-config'
import { PATHS } from '@/routes/paths'
import type { AuthRole } from '@/types'

interface RoleRouteProps {
  allowedRoles: readonly AuthRole[]
  fallbackPath?: string
}

/**
 * Restricts nested routes to one or more roles.
 * Compose under ProtectedRoute so authentication is verified first.
 */
export function RoleRoute({ allowedRoles, fallbackPath }: RoleRouteProps) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Spinner label="Loading…" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.auth.login} replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath ?? getHomePathForRole(user.role)} replace />
  }

  return <Outlet />
}

/** @deprecated Prefer RoleRoute — kept for backwards-compatible imports. */
export const RoleGuard = RoleRoute
