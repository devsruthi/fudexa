/**
 * Application roles.
 * Active auth roles are customer | restaurant. Future roles remain typed for routing.
 */
export type UserRole = 'customer' | 'restaurant' | 'driver' | 'kitchen' | 'admin'

export type AuthRole = Extract<UserRole, 'customer' | 'restaurant'>

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: AuthRole
  phone?: string | null
  /** Populated for restaurant owners from their primary restaurant, when available. */
  restaurantName?: string | null
  avatarUrl?: string | null
  emailConfirmed: boolean
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
}
