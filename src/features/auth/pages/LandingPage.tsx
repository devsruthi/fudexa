import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChefHat, LayoutDashboard, Radio, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { ThemeToggle } from '@/components/shared'
import { useAuth } from '@/features/auth/hooks'
import { PATHS } from '@/routes/paths'
import { getHomePathForRole } from '@/routes/role-config'

const HERO_DINING =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80'
const HERO_KITCHEN =
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80'
const HERO_PLATE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'

const features = [
  { icon: Radio, label: 'Live order sync', desc: 'Kitchen to customer in real time' },
  { icon: ChefHat, label: 'Menu & inventory', desc: 'One place for every dish' },
  { icon: LayoutDashboard, label: 'Owner dashboard', desc: 'Orders, reviews, analytics' },
] as const

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
})

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
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,_rgb(var(--color-muted))_0%,_rgb(var(--color-background))_45%,_rgb(var(--color-primary)/0.04)_100%),radial-gradient(ellipse_90%_70%_at_0%_-20%,_rgb(var(--color-primary)/0.2),_transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_0%,_rgb(var(--color-secondary)/0.16),_transparent_50%),radial-gradient(circle_at_80%_80%,_rgb(var(--color-primary)/0.08),_transparent_45%)]"
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, -12, 0], opacity: [0.4, 0.55, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-32 top-20 size-96 rounded-full bg-primary/15 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, 16, 0], opacity: [0.3, 0.45, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="pointer-events-none absolute -left-24 bottom-32 size-80 rounded-full bg-secondary/20 blur-3xl"
      />

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
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

      <main className="relative z-10 mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-10 lg:pb-28 lg:pt-4">
        {/* Copy */}
        <div className="flex flex-col gap-7">
          <motion.div
            {...fadeUp(0)}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-sm"
          >
            <Sparkles className="size-3.5" aria-hidden />
            Harbor Emerald · Built for the floor
          </motion.div>

          <div className="space-y-5">
            <motion.h1
              {...fadeUp(0.06)}
              className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]"
            >
              Run the floor.
              <br />
              <span className="bg-[linear-gradient(135deg,_rgb(var(--color-primary))_0%,_rgb(var(--color-secondary))_100%)] bg-clip-text text-transparent">
                Feed the city.
              </span>
            </motion.h1>
            <motion.p
              {...fadeUp(0.12)}
              className="max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              Real-time restaurant operations for merchants and diners — kitchen to checkout, in
              one calm console.
            </motion.p>
          </div>

          <motion.div {...fadeUp(0.18)} className="flex flex-wrap gap-3">
            <Button size="lg" onClick={handleGetStarted} className="gap-2 shadow-[var(--shadow-md)]">
              Get started
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            {!isAuthenticated ? (
              <Link to={PATHS.auth.register}>
                <Button size="lg" variant="outline">
                  Create account
                </Button>
              </Link>
            ) : null}
          </motion.div>

          <motion.ul
            {...fadeUp(0.24)}
            className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
          >
            {features.map(({ icon: Icon, label, desc }) => (
              <li
                key={label}
                className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border/70 bg-surface/60 p-3.5 backdrop-blur-sm"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
                </span>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Visual collage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
          <div
            aria-hidden
            className="absolute -inset-4 rounded-[2rem] bg-[linear-gradient(135deg,_rgb(var(--color-primary)/0.15),_rgb(var(--color-secondary)/0.12))] blur-2xl"
          />

          <div className="relative grid grid-cols-12 gap-3 sm:gap-4">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="col-span-7 row-span-2 overflow-hidden rounded-[var(--radius-xl)] border border-border/60 shadow-[var(--shadow-lg)]"
            >
              <img
                src={HERO_DINING}
                alt=""
                className="aspect-[4/5] size-full object-cover sm:aspect-[3/4]"
              />
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="col-span-5 overflow-hidden rounded-[var(--radius-xl)] border border-border/60 shadow-[var(--shadow-md)]"
            >
              <img src={HERO_KITCHEN} alt="" className="aspect-square size-full object-cover" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="col-span-5 overflow-hidden rounded-[var(--radius-xl)] border border-border/60 shadow-[var(--shadow-md)]"
            >
              <img src={HERO_PLATE} alt="" className="aspect-[4/3] size-full object-cover" />
            </motion.div>

            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="absolute -bottom-4 left-4 right-4 rounded-[var(--radius-xl)] border border-border/80 bg-surface/90 p-4 shadow-[var(--shadow-lg)] backdrop-blur-md sm:left-auto sm:right-6 sm:w-56"
            >
              <p className="text-xs font-medium tracking-wide text-secondary uppercase">
                Live now
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-foreground">11 venues</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Orders syncing across the city</p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                <span className="text-xs font-medium text-success">Realtime connected</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-border/60 bg-surface/40 py-6 backdrop-blur-sm">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} OrderFlow · Multi-restaurant ordering platform
        </p>
      </footer>
    </div>
  )
}
