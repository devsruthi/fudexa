import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { PATHS } from '@/routes/paths'
import { getHomePathForRole } from '@/routes/role-config'
import type { UserRole } from '@/types'

const DEMO_ROLES: { role: UserRole; label: string }[] = [
  { role: 'customer', label: 'Continue as Customer' },
  { role: 'restaurant', label: 'Continue as Restaurant' },
]

/**
 * Placeholder login page.
 * Demo buttons simulate role-based redirects until Supabase Auth is wired.
 */
export function LoginPage() {
  const { setMockUser } = useAuth()
  const navigate = useNavigate()

  const handleDemoLogin = (role: UserRole) => {
    setMockUser({
      id: `demo-${role}`,
      email: `${role}@orderflow.dev`,
      fullName: `Demo ${role}`,
      role,
    })
    navigate(getHomePathForRole(role), { replace: true })
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground">
          Auth is scaffolded for Supabase. Use a demo role to explore routing.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {DEMO_ROLES.map(({ role, label }) => (
          <button
            key={role}
            type="button"
            onClick={() => handleDemoLogin(role)}
            className="rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-sm)] transition hover:opacity-90"
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link to={PATHS.auth.register} className="font-medium text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  )
}
