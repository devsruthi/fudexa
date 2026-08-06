/**
 * Application roles.
 * Extend this union when adding driver, kitchen, or admin experiences.
 */
export type UserRole = 'customer' | 'restaurant' | 'driver' | 'kitchen' | 'admin'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: UserRole
  avatarUrl?: string
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
