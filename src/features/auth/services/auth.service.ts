import type { Session, User } from '@supabase/supabase-js'
import { supabase, type Profile } from '@/lib/supabase'
import {
  isAuthRole,
  mapProfileToAuthUser,
  mapSession,
  type AuthActionResult,
  type AuthUser,
  type ForgotPasswordPayload,
  type ResetPasswordPayload,
  type SignInCredentials,
  type SignUpCredentials,
} from '@/features/auth/types'
import { AuthServiceError, mapAuthError } from './auth-errors'

function getRedirectUrl(path: string): string {
  const base = import.meta.env.VITE_APP_URL || window.location.origin
  return `${base.replace(/\/$/, '')}${path}`
}

async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

  if (error || !data) {
    throw mapAuthError(error ?? new Error('Unable to load user profile.'))
  }

  return data
}

function buildFallbackProfile(user: User): Profile {
  const metadata = user.user_metadata ?? {}
  const roleValue = metadata.role
  const role = isAuthRole(roleValue) ? roleValue : 'customer'

  return {
    id: user.id,
    email: user.email ?? '',
    full_name:
      typeof metadata.full_name === 'string' && metadata.full_name.trim()
        ? metadata.full_name
        : (user.email?.split('@')[0] ?? 'User'),
    role,
    phone: typeof metadata.phone === 'string' ? metadata.phone : null,
    avatar_url: typeof metadata.avatar_url === 'string' ? metadata.avatar_url : null,
    created_at: user.created_at,
    updated_at: user.updated_at ?? user.created_at,
  }
}

async function fetchPrimaryRestaurantName(ownerId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('name')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<{ name: string }>()

  if (error) return null
  return data?.name ?? null
}

async function resolveAuthUser(user: User): Promise<AuthUser> {
  const emailConfirmed = Boolean(user.email_confirmed_at)

  try {
    const profile = await fetchProfile(user.id)
    const restaurantName =
      profile.role === 'restaurant' ? await fetchPrimaryRestaurantName(profile.id) : null
    return mapProfileToAuthUser(profile, emailConfirmed, restaurantName)
  } catch {
    const fallback = buildFallbackProfile(user)
    const metadataName =
      typeof user.user_metadata?.restaurant_name === 'string'
        ? user.user_metadata.restaurant_name
        : null
    return mapProfileToAuthUser(fallback, emailConfirmed, metadataName)
  }
}

async function toActionResult(
  session: Session | null,
  user: User | null,
): Promise<AuthActionResult> {
  if (!session || !user) {
    return { user: null, session: null }
  }

  return {
    user: await resolveAuthUser(user),
    session: mapSession(session),
  }
}

export async function signIn({ email, password }: SignInCredentials): Promise<AuthActionResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return toActionResult(data.session, data.user)
  } catch (error) {
    throw mapAuthError(error)
  }
}

export async function signUp(credentials: SignUpCredentials): Promise<AuthActionResult> {
  try {
    const { email, password, fullName, role, restaurantName } = credentials

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl('/login'),
        data: {
          full_name: fullName,
          role,
          restaurant_name: role === 'restaurant' ? restaurantName?.trim() : null,
        },
      },
    })

    if (error) throw error

    const requiresEmailVerification = Boolean(data.user) && !data.session

    if (data.user && data.session) {
      return {
        ...(await toActionResult(data.session, data.user)),
        requiresEmailVerification: false,
      }
    }

    if (data.user && requiresEmailVerification) {
      return {
        user: await resolveAuthUser(data.user),
        session: null,
        requiresEmailVerification: true,
      }
    }

    throw new AuthServiceError('Unable to create account. Please try again.')
  } catch (error) {
    throw mapAuthError(error)
  }
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    throw mapAuthError(error)
  }
}

export async function forgotPassword({ email }: ForgotPasswordPayload): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getRedirectUrl('/reset-password'),
    })
    if (error) throw error
  } catch (error) {
    throw mapAuthError(error)
  }
}

export async function resetPassword({ password }: ResetPasswordPayload): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  } catch (error) {
    throw mapAuthError(error)
  }
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return mapSession(data.session)
  } catch (error) {
    throw mapAuthError(error)
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!data.user) return null
    return resolveAuthUser(data.user)
  } catch (error) {
    throw mapAuthError(error)
  }
}

export async function getCurrentSessionAndUser(): Promise<AuthActionResult> {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    if (!data.session?.user) {
      return { user: null, session: null }
    }
    return toActionResult(data.session, data.session.user)
  } catch (error) {
    throw mapAuthError(error)
  }
}

export const authService = {
  signIn,
  signUp,
  signOut,
  forgotPassword,
  resetPassword,
  getSession,
  getCurrentUser,
  getCurrentSessionAndUser,
}
