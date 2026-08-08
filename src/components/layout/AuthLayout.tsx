import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, ChefHat, ClipboardList, UtensilsCrossed } from 'lucide-react'
import { ThemeToggle } from '@/components/shared'

const AUTH_HERO =
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=2000&q=90'

const AUTH_HERO_MOBILE =
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=85'

const ACCENT_CHILI =
  'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?auto=format&fit=crop&w=480&q=80'

const ACCENT_HERBS =
  'https://images.unsplash.com/photo-1628773822503-930a7eaecf80?auto=format&fit=crop&w=480&q=80'

const features = [
  {
    icon: ClipboardList,
    label: 'Order Management',
    desc: 'Real-time order tracking',
  },
  {
    icon: UtensilsCrossed,
    label: 'Menu Control',
    desc: 'Update menu and prices instantly',
  },
  {
    icon: ChefHat,
    label: 'Kitchen Sync',
    desc: 'Streamline kitchen operations',
  },
  {
    icon: BarChart3,
    label: 'Business Insights',
    desc: 'Track performance and grow',
  },
] as const

export function AuthLayout() {
  const location = useLocation()

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#F7F1EB] lg:flex">
      {/* Left brand panel — curve is clipped here only, never overlays the form */}
      <aside className="relative hidden min-h-dvh w-[min(58%,42rem)] shrink-0 lg:block xl:w-[min(56%,46rem)]">
        <div className="absolute inset-0 overflow-hidden [clip-path:ellipse(100%_92%_at_0%_50%)]">
          <motion.img
            src={AUTH_HERO}
            alt=""
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 size-full object-cover object-[center_35%]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(115deg,_rgb(8_6_6_/_0.92)_0%,_rgb(20_12_10_/_0.72)_52%,_rgb(12_8_8_/_0.55)_100%)]"
          />

          <div className="relative z-10 flex h-full flex-col justify-between px-10 py-10 pr-16 xl:px-14 xl:pr-24 xl:py-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="space-y-2"
            >
              <img
                src="/fudexa-logo-light.png"
                alt="Fudexa"
                width={420}
                height={172}
                className="h-[4.75rem] w-auto max-w-[min(100%,24rem)] object-contain drop-shadow-[0_6px_24px_rgb(0_0_0_/_0.55)] xl:h-[5.5rem]"
              />
              <p className="text-sm font-medium text-white/70">Restaurant Operations Platform</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="max-w-md space-y-5"
            >
              <h1 className="font-display text-[2.5rem] font-semibold leading-[1.12] tracking-tight text-white xl:text-[2.85rem] 2xl:text-5xl">
                Run your <span className="text-[#FF6A00]">restaurant.</span>
                <br />
                Delight every order.
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-white/75 xl:text-base">
                Manage orders, menus, kitchens, and customers from one powerful platform.
              </p>
            </motion.div>

            <div className="space-y-8">
              <motion.ul
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.18 }}
                className="grid max-w-xl grid-cols-2 gap-x-5 gap-y-5 xl:grid-cols-4 xl:gap-4"
              >
                {features.map(({ icon: Icon, label, desc }) => (
                  <li key={label} className="space-y-2.5">
                    <span className="inline-flex size-11 items-center justify-center rounded-full border border-white/35 bg-white/5 text-white backdrop-blur-sm">
                      <Icon className="size-5" strokeWidth={1.6} aria-hidden />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">{label}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-white/55">{desc}</p>
                    </div>
                  </li>
                ))}
              </motion.ul>
              <p className="text-xs text-white/40">
                © {new Date().getFullYear()} Fudexa. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Orange edge following the same ellipse — decorative only */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="authCurveStroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF8A1F" />
              <stop offset="100%" stopColor="#E63946" />
            </linearGradient>
          </defs>
          <ellipse
            cx="0"
            cy="50"
            rx="100"
            ry="92"
            fill="none"
            stroke="url(#authCurveStroke)"
            strokeWidth="0.7"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </aside>

      {/* Right form panel — full remaining width, never under the curve */}
      <section className="relative flex min-h-dvh min-w-0 flex-1 flex-col overflow-hidden bg-[#F7F1EB]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgb(255_122_0_/_0.08),_transparent_40%),radial-gradient(circle_at_20%_80%,_rgb(230_57_70_/_0.06),_transparent_45%)]"
        />

        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 hidden opacity-[0.12] lg:block"
          viewBox="0 0 600 800"
          fill="none"
        >
          <g stroke="#E85D04" strokeWidth="1.4">
            <circle cx="480" cy="160" r="34" />
            <path d="M480 126c10 14 10 34 0 48M458 148c18 6 30 18 34 34" />
            <path d="M90 520c20-40 70-40 90 0 18 36-10 70-45 70s-63-34-45-70z" />
            <path d="M135 520c0-28 8-48 20-66" />
            <path d="M420 620c30-10 58 12 52 42-8 36-54 40-72 12-12-18-4-48 20-54z" />
            <path d="M510 700c18-22 48-18 58 8 10 28-14 48-40 44-22-4-34-28-18-52z" />
          </g>
        </svg>

        <img
          src={ACCENT_CHILI}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-6 -right-1 z-[1] hidden w-36 rotate-[-14deg] drop-shadow-2xl sm:block lg:w-40"
        />
        <img
          src={ACCENT_HERBS}
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-14 right-24 z-[1] hidden w-28 rotate-12 opacity-95 drop-shadow-xl sm:block"
        />

        {/* Mobile hero */}
        <div className="relative h-44 overflow-hidden lg:hidden">
          <img src={AUTH_HERO_MOBILE} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgb(12_8_8_/_0.4),_rgb(12_8_8_/_0.88))]" />
          <div className="relative z-10 flex h-full flex-col items-start justify-end gap-2 px-5 pb-5">
            <img
              src="/fudexa-logo-light.png"
              alt="Fudexa"
              className="h-14 w-auto max-w-[18rem] object-contain drop-shadow-[0_4px_16px_rgb(0_0_0_/_0.55)]"
            />
            <p className="text-xs font-medium text-white/75">Restaurant Operations Platform</p>
          </div>
        </div>

        <div className="absolute right-4 top-4 z-20 lg:right-6 lg:top-6">
          <ThemeToggle />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-10 sm:px-10 sm:py-14 lg:px-12 xl:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
