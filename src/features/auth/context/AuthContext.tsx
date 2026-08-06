import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { authService, getAuthErrorToast, type AuthServiceError } from '@/features/auth/services'
import {
  mapSession,
  type AuthActionResult,
  type AuthUser,
  type ForgotPasswordPayload,
  type ResetPasswordPayload,
  type SignInCredentials,
  type SignUpCredentials,
} from '@/features/auth/types'
import type { AuthSession } from '@/types'
import { getHomePathForRole } from '@/routes/role-config'
import { toast } from 'sonner'

interface AuthContextValue {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  isAuthenticated: boolean
  login: (credentials: SignInCredentials) => Promise<AuthActionResult>
  register: (credentials: SignUpCredentials) => Promise<AuthActionResult>
  logout: () => Promise<void>
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>
  getPostAuthRedirect: () => string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

async function resolveUserFromSession(session: Session | null): Promise<{
  user: AuthUser | null
  session: AuthSession | null
}> {
  if (!session?.user) {
    return { user: null, session: null }
  }

  const result = await authService.getCurrentSessionAndUser()
  return {
    user: result.user,
    session: result.session ?? mapSession(session),
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  const syncAuthState = useCallback(async (nextSession: Session | null) => {
    try {
      const resolved = await resolveUserFromSession(nextSession)
      setUser(resolved.user)
      setSession(resolved.session)
    } catch (error) {
      console.error('[Auth] Failed to sync session', error)
      setUser(null)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    void authService
      .getCurrentSessionAndUser()
      .then((result) => {
        if (!mounted) return
        setUser(result.user)
        setSession(result.session)
      })
      .catch((error) => {
        console.error('[Auth] Failed to restore session', error)
        if (!mounted) return
        setUser(null)
        setSession(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return

      // Avoid blocking the auth callback; resolve profile asynchronously.
      void (async () => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
          setLoading(false)
          return
        }

        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED' ||
          event === 'PASSWORD_RECOVERY' ||
          event === 'INITIAL_SESSION'
        ) {
          await syncAuthState(nextSession)
        }
      })()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [syncAuthState])

  const notifyError = useCallback((error: unknown) => {
    const { title, description } = getAuthErrorToast(error)
    toast.error(title, { description })
  }, [])

  const login = useCallback(
    async (credentials: SignInCredentials) => {
      try {
        const result = await authService.signIn(credentials)
        setUser(result.user)
        setSession(result.session)
        toast.success('Welcome back', {
          description: result.user ? `Signed in as ${result.user.fullName}` : undefined,
        })
        return result
      } catch (error) {
        notifyError(error)
        throw error
      }
    },
    [notifyError],
  )

  const register = useCallback(
    async (credentials: SignUpCredentials) => {
      try {
        const result = await authService.signUp(credentials)

        if (result.requiresEmailVerification) {
          toast.success('Verify your email', {
            description: 'We sent a confirmation link. Verify your email, then sign in.',
          })
          return result
        }

        setUser(result.user)
        setSession(result.session)
        toast.success('Account created', {
          description: 'You are signed in and ready to go.',
        })
        return result
      } catch (error) {
        notifyError(error)
        throw error
      }
    },
    [notifyError],
  )

  const logout = useCallback(async () => {
    try {
      await authService.signOut()
      setUser(null)
      setSession(null)
      toast.success('Signed out')
    } catch (error) {
      notifyError(error)
      throw error
    }
  }, [notifyError])

  const forgotPassword = useCallback(
    async (payload: ForgotPasswordPayload) => {
      try {
        await authService.forgotPassword(payload)
        toast.success('Check your email', {
          description: 'If an account exists, we sent a password reset link.',
        })
      } catch (error) {
        notifyError(error)
        throw error
      }
    },
    [notifyError],
  )

  const resetPassword = useCallback(
    async (payload: ResetPasswordPayload) => {
      try {
        await authService.resetPassword(payload)
        toast.success('Password updated', {
          description: 'You can now sign in with your new password.',
        })
      } catch (error) {
        notifyError(error)
        throw error as AuthServiceError
      }
    },
    [notifyError],
  )

  const getPostAuthRedirect = useCallback(() => {
    if (!user) return null
    return getHomePathForRole(user.role)
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      isAuthenticated: Boolean(user && session),
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      getPostAuthRedirect,
    }),
    [
      user,
      session,
      loading,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      getPostAuthRedirect,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook co-located with provider for a single auth entrypoint.
// eslint-disable-next-line react-refresh/only-export-components -- intentional
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
