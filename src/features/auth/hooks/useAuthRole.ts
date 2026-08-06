import { useAuth } from './useAuth'

/** Convenience hook for role-aware UI. */
export function useAuthRole() {
  const { user, isAuthenticated } = useAuth()
  return {
    role: user?.role ?? null,
    isCustomer: user?.role === 'customer',
    isRestaurant: user?.role === 'restaurant',
    isAuthenticated,
  }
}
