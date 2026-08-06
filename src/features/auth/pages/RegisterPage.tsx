import { Link } from 'react-router-dom'
import { PATHS } from '@/routes/paths'

/** Placeholder registration page. */
export function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Create account
        </h1>
        <p className="text-sm text-muted-foreground">
          Registration flow will connect to Supabase Auth in a later iteration.
        </p>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 text-sm text-muted-foreground shadow-[var(--shadow-sm)]">
        Form fields (email, password, role) will live here with React Hook Form + Zod.
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={PATHS.auth.login} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
