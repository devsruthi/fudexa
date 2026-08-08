import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/shared'

const AUTH_HERO =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80'

const AUTH_HERO_MOBILE =
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80'

export function AuthLayout() {
  const location = useLocation()

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel — full-bleed atmosphere */}
      <aside className="relative hidden overflow-hidden lg:block">
        <motion.img
          key="auth-hero"
          src={AUTH_HERO}
          alt=""
          initial={{ scale: 1.12, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 size-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(160deg,_rgb(2_44_34_/_0.88)_0%,_rgb(6_78_59_/_0.55)_42%,_rgb(28_25_23_/_0.75)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgb(180_139_74_/_0.28),_transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-display text-3xl font-semibold tracking-tight">Fudexa</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              Real-time restaurant operations for merchants and diners.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg space-y-4"
          >
            <p className="font-display text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
              Run the floor.
              <br />
              <span className="text-secondary">Feed the city.</span>
            </p>
            <p className="max-w-md text-sm leading-relaxed text-primary-foreground/70">
              Accept orders, manage menus, and keep kitchens in sync — one calm console for every
              role in your operation.
            </p>
            <motion.div
              aria-hidden
              className="h-px w-24 origin-left bg-secondary/80"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="text-xs text-primary-foreground/45"
          >
            © {new Date().getFullYear()} Fudexa
          </motion.p>
        </div>
      </aside>

      {/* Form panel */}
      <section className="relative flex flex-col overflow-hidden bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,_rgb(var(--color-muted))_0%,_rgb(var(--color-background))_40%,_rgb(var(--color-primary)/0.06)_100%),radial-gradient(ellipse_90%_60%_at_110%_-10%,_rgb(var(--color-primary)/0.22),_transparent_50%),radial-gradient(ellipse_70%_50%_at_-10%_110%,_rgb(var(--color-secondary)/0.18),_transparent_48%),radial-gradient(circle_at_70%_55%,_rgb(var(--color-primary)/0.1),_transparent_42%)]"
        />

        {/* Mobile brand strip */}
        <div className="relative h-36 overflow-hidden lg:hidden">
          <img src={AUTH_HERO_MOBILE} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgb(2_44_34_/_0.55),_rgb(2_44_34_/_0.82))]" />
          <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-5 text-primary-foreground">
            <p className="font-display text-2xl font-semibold tracking-tight">Fudexa</p>
            <p className="mt-0.5 text-xs text-primary-foreground/70">
              Restaurant operations, in real time
            </p>
          </div>
        </div>

        <div className="absolute right-4 z-20 top-[8.75rem] lg:top-5">
          <ThemeToggle />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-8 sm:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
