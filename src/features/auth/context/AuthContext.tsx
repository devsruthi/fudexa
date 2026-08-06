import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AuthState, AuthUser, UserRole } from '@/types'
import { getHomePathForRole } from '@/routes/role-config'

const AUTH_STORAGE_KEY = 'orderflow.auth.user'

interface AuthContextValue extends AuthState {
  /** Placeholder — wire to Supabase Auth in a later iteration. */
  signIn: (email: string, password: string) => Promise<void>
  /** Placeholder — wire to Supabase Auth in a later iteration. */
  signUp: (email: string, password: string, role: UserRole) => Promise<void>
  /** Placeholder — wire to Supabase Auth in a later iteration. */
  signOut: () => Promise<void>
  /** Resolves the post-auth landing path for the current user. */
  getPostAuthRedirect: () => string | null
  /** Dev/scaffold helper to simulate an authenticated session by role. */
  setMockUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function buildState(user: AuthUser | null): AuthState {
  return {
    user,
    session: user
      ? {
          accessToken: 'mock',
          refreshToken: 'mock',
          expiresAt: Date.now() + 3_600_000,
        }
      : null,
    isAuthenticated: Boolean(user),
    isLoading: false,
  }
}

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Auth provider scaffold for Supabase Auth.
 * Business logic (session persistence, token refresh) is intentionally deferred.
 * Mock users are stored in sessionStorage so demo role redirects work across navigations.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(() => buildState(readStoredUser()))

  const signIn = useCallback(async (_email: string, _password: string) => {
    // TODO: Integrate supabase.auth.signInWithPassword
    throw new Error('signIn is not implemented yet')
  }, [])

  const signUp = useCallback(async (_email: string, _password: string, _role: UserRole) => {
    // TODO: Integrate supabase.auth.signUp + role metadata
    throw new Error('signUp is not implemented yet')
  }, [])

  const signOut = useCallback(async () => {
    // TODO: Integrate supabase.auth.signOut
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    setState(buildState(null))
  }, [])

  const setMockUser = useCallback((user: AuthUser | null) => {
    if (user) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    } else {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
    }
    setState(buildState(user))
  }, [])

  const getPostAuthRedirect = useCallback(() => {
    if (!state.user) return null
    return getHomePathForRole(state.user.role)
  }, [state.user])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
      getPostAuthRedirect,
      setMockUser,
    }),
    [state, signIn, signUp, signOut, getPostAuthRedirect, setMockUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook lives alongside provider; consumers import via features/auth barrel.
// eslint-disable-next-line react-refresh/only-export-components -- intentional co-location
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
