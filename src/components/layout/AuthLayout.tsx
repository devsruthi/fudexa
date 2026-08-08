import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Radio, Users } from 'lucide-react'
import { ThemeToggle } from '@/components/shared'

/** Moody plated steak / fine dining — left hero */
const AUTH_HERO =
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1800&q=85'

const AUTH_HERO_MOBILE =
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=85'

const ACCENT_CHILI =
  'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?auto=format&fit=crop&w=480&q=80'

const ACCENT_HERBS =
  'https://images.unsplash.com/photo-1628773822503-930a7eaecf80?auto=format&fit=crop&w=480&q=80'

const features = [
  { icon: Radio, label: 'Real-time Orders', desc: 'Live kitchen sync' },
  { icon: LayoutDashboard, label: 'Smart Dashboard', desc: 'Ops at a glance' },
  { icon: Users, label: 'Team Management', desc: 'Roles that fit' },
] as const

export function AuthLayout() {
  const location = useLocation()

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#FFF8F5] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* Left brand panel */}
      <aside className="relative hidden min-h-dvh overflow-hidden lg:block">
        <motion.img
          src={AUTH_HERO}
          alt=""
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(115deg,_rgb(12_8_8_/_0.88)_0%,_rgb(40_16_16_/_0.72)_45%,_rgb(20_10_10_/_0.55)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgb(255_122_0_/_0.22),_transparent_50%)]"
        />

        {/* Soft curved edge toward form */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -right-px z-20 h-full w-16"
          viewBox="0 0 64 900"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="authCurve" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF7A00" />
              <stop offset="100%" stopColor="#E63946" />
            </linearGradient>
          </defs>
          {/* Gentle single-wave divider (less aggressive S-curve) */}
          <path
            d="M64 0 C48 120 36 280 40 450 C44 620 52 780 64 900 L64 900 L64 0 Z"
            fill="#FFF8F5"
          />
          <path
            d="M40 0 C32 120 28 280 32 450 C36 620 44 780 52 900"
            fill="none"
            stroke="url(#authCurve)"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="relative z-10 flex h-full flex-col justify-between px-10 py-10 xl:px-14 xl:py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <img
              src="/fudexa-logo-light.png"
              alt="Fudexa"
              width={220}
              height={110}
              className="h-12 w-auto object-contain drop-shadow-[0_2px_12px_rgb(0_0_0_/_0.45)] sm:h-14"
            />
            <p className="text-xs font-medium tracking-wide text-white/65">
              Restaurant Operations Platform
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="max-w-md space-y-5"
          >
            <h1 className="font-display text-5xl font-semibold leading-[1.08] tracking-tight text-white xl:text-6xl">
              Order faster.
              <br />
              <span className="text-[#FF8A1F]">Deliver hunger.</span>
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-white/70 xl:text-base">
              Accept orders, manage menus, and keep kitchens in sync — one calm console for every
              role in your operation.
            </p>
          </motion.div>

          <div className="space-y-6">
            <motion.ul
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="grid max-w-lg grid-cols-3 gap-2"
            >
              {features.map(({ icon: Icon, label, desc }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-2.5 py-2 backdrop-blur-md"
                >
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <p className="truncate text-[11px] font-semibold leading-tight text-white">
                      {label}
                    </p>
                    <p className="truncate text-[10px] leading-tight text-white/60">{desc}</p>
                  </span>
                </li>
              ))}
            </motion.ul>
            <p className="text-xs text-white/45">
              © {new Date().getFullYear()} Fudexa. All rights reserved.
            </p>
          </div>
        </div>
      </aside>

      {/* Right form panel */}
      <section className="relative flex min-h-dvh flex-col overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,_rgb(255_122_0_/_0.08),_transparent_40%),radial-gradient(circle_at_90%_80%,_rgb(230_57_70_/_0.08),_transparent_45%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(230 57 70 / 0.12) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* Decorative produce */}
        <img
          src={ACCENT_CHILI}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-6 -right-4 z-[1] hidden w-36 rotate-[-18deg] drop-shadow-xl sm:block lg:w-44"
        />
        <img
          src={ACCENT_HERBS}
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-8 right-24 z-[1] hidden w-28 rotate-12 opacity-90 drop-shadow-lg sm:block lg:right-32 lg:w-32"
        />

        {/* Mobile hero */}
        <div className="relative h-40 overflow-hidden lg:hidden">
          <img src={AUTH_HERO_MOBILE} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgb(20_10_10_/_0.45),_rgb(20_10_10_/_0.85))]" />
          <div className="relative z-10 flex h-full flex-col items-start justify-end gap-1.5 px-5 pb-5">
            <img
              src="/fudexa-logo-light.png"
              alt="Fudexa"
              className="h-9 w-auto object-contain drop-shadow-[0_2px_10px_rgb(0_0_0_/_0.5)]"
            />
            <p className="text-xs text-white/70">Taste. Delivered.</p>
          </div>
        </div>

        <div className="absolute right-4 top-4 z-20 lg:top-6">
          <ThemeToggle />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[26rem]"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
