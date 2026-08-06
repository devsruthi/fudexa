import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { ThemeToggle } from '@/components/shared'
import { PATHS } from '@/routes/paths'

/** Public marketing landing — brand-first entry before auth. */
export function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(var(--color-primary)/0.18),_transparent_55%),linear-gradient(to_bottom,_rgb(var(--color-muted)),_rgb(var(--color-background)))]"
      />
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          OrderFlow
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to={PATHS.auth.login}>
            <Button size="sm">Sign in</Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-24 pt-16 sm:pt-24">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl"
        >
          OrderFlow
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="max-w-2xl text-xl font-medium text-foreground sm:text-2xl"
        >
          Real-time restaurant operations for merchants and diners.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="max-w-xl text-base text-muted-foreground"
        >
          Manage orders, menus, and fulfillment in one platform — inspired by modern merchant
          consoles, built for scale.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="flex flex-wrap gap-3"
        >
          <Link to={PATHS.auth.login}>
            <Button size="lg">Get started</Button>
          </Link>
          <Link to={PATHS.auth.register}>
            <Button size="lg" variant="secondary">
              Create account
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
