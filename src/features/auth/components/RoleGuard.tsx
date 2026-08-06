import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { PATHS } from '@/routes/paths'
import type { UserRole } from '@/types'

interface RoleGuardProps {
  /** Roles permitted to access the nested route tree. */
  allowedRoles: readonly UserRole[]
  /** Fallback when the user's role is not allowed. */
  fallbackPath?: string
}

/**
 * Restricts nested routes to one or more roles.
 * Compose with ProtectedRoute so authentication is verified first.
 */
export function RoleGuard({ allowedRoles, fallbackPath = PATHS.unauthorized }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.auth.login} replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />
  }

  return <Outlet />
}
