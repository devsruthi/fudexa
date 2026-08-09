import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Store, Utensils } from 'lucide-react'
import { Button } from '@/components/ui'
import { ThemeToggle } from '@/components/shared'
import { useAuth } from '@/features/auth/hooks'
import { PATHS } from '@/routes/paths'
import { getHomePathForRole } from '@/routes/role-config'

const HERO =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2400&q=90'

/** Public marketing landing — brand-first cinematic entry. */
export function LandingPage() {
  const { isAuthenticated, user, loading } = useAuth()
  const navigate = useNavigate()

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      navigate(getHomePathForRole(user.role))
      return
    }
    navigate(PATHS.auth.register)
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#120a08] text-white">
      {/* Full-bleed hero image */}
      <motion.img
        src={HERO}
        alt=""
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 size-full object-cover object-[center_35%]"
      />

      {/* Atmospheric overlays */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(105deg,_rgba(8,5,4,0.92)_0%,_rgba(14,8,6,0.72)_48%,_rgba(12,7,5,0.45)_72%,_rgba(10,6,4,0.55)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,_rgb(255_122_0_/_0.28),_transparent_50%),radial-gradient(ellipse_at_85%_15%,_rgb(230_57_70_/_0.2),_transparent_45%)]"
      />
      <motion.div
        aria-hidden
        animate={{ opacity: [0.35, 0.55, 0.35], y: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-20 top-1/3 size-[28rem] rounded-full bg-[radial-gradient(circle,_rgb(255_122_0_/_0.35),_transparent_70%)] blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ opacity: [0.25, 0.45, 0.25], x: [0, 14, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-16 bottom-0 size-[26rem] rounded-full bg-[radial-gradient(circle,_rgb(230_57_70_/_0.3),_transparent_70%)] blur-3xl"
      />

      {/* Soft geometric accents */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] size-full opacity-40"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="landingArc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF8A1F" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#E63946" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path
          d="M980 -40 C1100 180 1180 420 1080 680 C1020 820 920 900 780 960"
          stroke="url(#landingArc)"
          strokeWidth="2"
        />
        <circle cx="1220" cy="160" r="120" stroke="url(#landingArc)" strokeWidth="1.4" />
        <circle cx="180" cy="720" r="160" stroke="url(#landingArc)" strokeWidth="1.2" opacity="0.5" />
      </svg>

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-end px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!loading && !isAuthenticated ? (
            <Link to={PATHS.auth.login}>
              <Button
                size="sm"
                className="rounded-full border-0 bg-[linear-gradient(90deg,_#FF7A00_0%,_#E63946_100%)] text-white shadow-[0_10px_24px_-10px_rgb(230_57_70_/_0.55)]"
              >
                Sign in
              </Button>
            </Link>
          ) : null}
          {!loading && isAuthenticated ? (
            <Button
              size="sm"
              onClick={handleGetStarted}
              className="rounded-full border-0 bg-[linear-gradient(90deg,_#FF7A00_0%,_#E63946_100%)] text-white"
            >
              Open app
            </Button>
          ) : null}
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-6xl flex-col justify-center px-5 pb-16 pt-8 sm:px-8 lg:pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          {/* Left — brand + story */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex w-full flex-col items-start gap-4 self-start"
            >
              <img
                src="/fudexa-logo-light.png"
                alt="Fudexa"
                width={480}
                height={140}
                className="ml-0 block h-24 w-auto max-w-[min(100%,32rem)] self-start object-contain object-left drop-shadow-[0_10px_32px_rgb(0_0_0_/_0.55)] sm:h-28 lg:h-32"
              />
              <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-md">
                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rounded-full bg-[linear-gradient(90deg,_#FF8A1F,_#E63946)] shadow-[0_0_8px_rgb(255_122_0_/_0.7)]"
                />
                <span className="text-xs font-semibold tracking-[0.06em] text-white/90 uppercase">
                  Restaurant Operations Platform
                </span>
              </span>
              <div
                aria-hidden
                className="h-0.5 w-16 self-start rounded-full bg-[linear-gradient(90deg,_#FF8A1F,_#E63946,_transparent)]"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06 }}
              className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.25rem]"
            >
              Serve every <span className="text-[#FF6A00]">craving.</span>
              <br />
              Run every kitchen.
              <br />
              A <span className="text-[#FFB347]">dual platform</span> built for both.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14 }}
              className="max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
            >
              Customer food ordering and restaurant operations in one dual platform — diners order
              in, kitchens run the floor.
            </motion.p>
          </div>

          {/* Right — CTAs + audience pills */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="flex flex-col gap-5 lg:items-end lg:text-right"
          >
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="h-12 rounded-xl border-0 bg-[linear-gradient(90deg,_#FF7A00_0%,_#E63946_100%)] px-6 text-base text-white shadow-[0_14px_32px_-12px_rgb(230_57_70_/_0.6)]"
              >
                Get started
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              {!isAuthenticated ? (
                <Link to={PATHS.auth.login}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-xl border-white/30 bg-white/10 px-6 text-base text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
                  >
                    Sign in
                  </Button>
                </Link>
              ) : null}
            </div>

            <div className="flex w-full max-w-md flex-col gap-3 lg:ml-auto">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-left backdrop-blur-md">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#FF7A00,_#E63946)] text-white">
                  <Utensils className="size-3.5" aria-hidden />
                </span>
                <span className="pr-1">
                  <span className="block text-xs font-semibold text-white">For diners</span>
                  <span className="block text-[11px] text-white/60">Order & track in real time</span>
                </span>
              </div>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-left backdrop-blur-md">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#FF7A00,_#E63946)] text-white">
                  <Store className="size-3.5" aria-hidden />
                </span>
                <span className="pr-1">
                  <span className="block text-xs font-semibold text-white">For restaurants</span>
                  <span className="block text-[11px] text-white/60">Kitchen, menu & analytics</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom accent bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-auto flex items-end justify-between gap-6 pt-16"
        >
          <div className="h-1 w-28 rounded-full bg-[linear-gradient(90deg,_#FF8A1F,_#E63946,_transparent)]" />
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} Fudexa. All rights reserved.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
