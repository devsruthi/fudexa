import type { Session } from '@supabase/supabase-js'
import type { AuthRole, AuthSession, AuthUser } from '@/types'
import type { Profile } from '@/lib/supabase'

export type { AuthRole, AuthSession, AuthUser }

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  fullName: string
  role: AuthRole
  restaurantName?: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  password: string
}

export interface AuthActionResult {
  user: AuthUser | null
  session: AuthSession | null
  /** True when signup succeeded but email confirmation is still required. */
  requiresEmailVerification?: boolean
}

export function mapSession(session: Session | null): AuthSession | null {
  if (!session) return null

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? 0,
  }
}

export function mapProfileToAuthUser(
  profile: Profile,
  emailConfirmed: boolean,
  restaurantName?: string | null,
): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    phone: profile.phone,
    restaurantName: restaurantName ?? null,
    avatarUrl: profile.avatar_url,
    emailConfirmed,
  }
}

export function isAuthRole(value: unknown): value is AuthRole {
  return value === 'customer' || value === 'restaurant'
}
