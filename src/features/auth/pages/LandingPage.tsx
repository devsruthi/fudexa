import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { ThemeToggle } from '@/components/shared'
import { useAuth } from '@/features/auth/hooks'
import { PATHS } from '@/routes/paths'
import { getHomePathForRole } from '@/routes/role-config'

/** Public marketing landing — brand-first entry before auth. */
export function LandingPage() {
  const { isAuthenticated, user, loading } = useAuth()
  const navigate = useNavigate()

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      navigate(getHomePathForRole(user.role))
      return
    }
    navigate(PATHS.auth.login)
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,_rgb(var(--color-primary)/0.22),_transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_10%,_rgb(var(--color-secondary)/0.18),_transparent_50%),linear-gradient(to_bottom,_rgb(var(--color-muted)),_rgb(var(--color-background)))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,_rgb(var(--color-primary)/0.06),_transparent)]"
      />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <span className="font-display text-xl font-semibold tracking-tight text-foreground">
          OrderFlow
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!loading && !isAuthenticated ? (
            <Link to={PATHS.auth.login}>
              <Button size="sm">Sign in</Button>
            </Link>
          ) : null}
          {!loading && isAuthenticated ? (
            <Button size="sm" onClick={handleGetStarted}>
              Open app
            </Button>
          ) : null}
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-24 pt-20 sm:pt-28">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="font-display text-6xl font-semibold tracking-tight text-foreground sm:text-7xl"
        >
          OrderFlow
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
          className="max-w-xl text-lg text-muted-foreground sm:text-xl"
        >
          Real-time restaurant operations for merchants and diners — kitchen to checkout, in one
          calm console.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="mt-2 flex flex-wrap gap-3"
        >
          <Button size="lg" onClick={handleGetStarted}>
            Get started
          </Button>
          {!isAuthenticated ? (
            <Link to={PATHS.auth.register}>
              <Button size="lg" variant="outline">
                Create account
              </Button>
            </Link>
          ) : null}
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 text-xs font-medium tracking-wide text-secondary uppercase"
        >
          Harbor Emerald · Built for the floor
        </motion.p>
      </main>
    </div>
  )
}
