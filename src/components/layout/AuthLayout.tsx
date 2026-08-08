import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeftRight,
  BarChart3,
  ChefHat,
  ClipboardList,
  Store,
  UtensilsCrossed,
  Utensils,
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared'

const AUTH_HERO =
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=2000&q=90'

const AUTH_HERO_MOBILE =
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=85'

const ACCENT_CHILI = '/auth/chili.png'
const ACCENT_BASIL = '/auth/basil.png'
const ACCENT_TOMATO = '/auth/tomato.png'

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
                <br />
                <span className="text-[#FFB347]">Hungry guests</span> order in.
              </h1>
              <div className="relative max-w-md overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07] p-4 shadow-[0_16px_40px_-20px_rgb(0_0_0_/_0.45)] backdrop-blur-md">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,_transparent,_#FF8A1F_40%,_#E63946_70%,_transparent)]"
                />
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFB347]/35 bg-[#FF6A00]/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#FFD08A]">
                    <Utensils className="size-3" aria-hidden />
                    Customer ordering
                  </span>
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/10 text-[#FFB347]">
                    <ArrowLeftRight className="size-3" aria-hidden />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white/90">
                    <Store className="size-3" aria-hidden />
                    Restaurant ops
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-white/85 xl:text-[0.95rem]">
                  One platform for{' '}
                  <span className="font-semibold text-white">both sides of the table</span>
                  {' — '}
                  guests order in, kitchens run smooth.
                </p>
                <div
                  aria-hidden
                  className="mt-3 h-1 w-24 rounded-full bg-[linear-gradient(90deg,_#FF8A1F,_#E63946,_transparent)]"
                />
              </div>
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

      {/* Right form panel — atmospheric gradients + shapes */}
      <section className="relative flex min-h-dvh min-w-0 flex-1 flex-col overflow-hidden bg-[#FFE5D4]">
        {/* Base warm gradient wash — stays peach through the bottom edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,_#FFF7F0_0%,_#FFE8D4_32%,_#FFD2B8_62%,_#FFC4A8_82%,_#FFB898_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_8%,_rgb(255_122_0_/_0.2),_transparent_46%),radial-gradient(ellipse_at_92%_100%,_rgb(230_57_70_/_0.28),_transparent_55%),radial-gradient(ellipse_at_60%_85%,_rgb(255_140_60_/_0.35),_transparent_50%),radial-gradient(ellipse_at_8%_92%,_rgb(230_57_70_/_0.14),_transparent_45%)]"
        />
        {/* Bottom-right color lock so it never falls back to white */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(to_top,_#FFB090_0%,_#FFC8A8_45%,_transparent_100%)]"
        />

        {/* Soft floating gradient orbs */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-20 size-[22rem] rounded-full bg-[radial-gradient(circle,_rgb(255_122_0_/_0.35)_0%,_rgb(255_122_0_/_0)_70%)] blur-2xl"
          animate={{ y: [0, 18, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-10 size-[26rem] rounded-full bg-[radial-gradient(circle,_rgb(255_120_70_/_0.45)_0%,_rgb(230_57_70_/_0.2)_40%,_transparent_70%)] blur-2xl"
          animate={{ y: [0, -14, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-1/3 left-1/2 size-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgb(255_200_120_/_0.35)_0%,_transparent_70%)] blur-3xl"
          animate={{ opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Geometric rings + arcs */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] size-full"
          viewBox="0 0 800 1000"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="formShapeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF8A1F" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#E63946" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="formShapeGradSoft" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFB347" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FF6A00" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <circle cx="700" cy="120" r="160" stroke="url(#formShapeGrad)" strokeWidth="1.5" />
          <circle cx="700" cy="120" r="110" stroke="url(#formShapeGradSoft)" strokeWidth="1.2" />
          <circle cx="80" cy="820" r="200" stroke="url(#formShapeGradSoft)" strokeWidth="1.4" />
          <path
            d="M520 40 C620 180 640 320 560 480"
            stroke="url(#formShapeGrad)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M40 200 C180 160 260 240 220 360 C180 480 60 520 -20 460"
            stroke="url(#formShapeGradSoft)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M640 640 C720 700 760 800 700 920"
            stroke="url(#formShapeGrad)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Soft filled blobs */}
          <ellipse cx="720" cy="880" rx="140" ry="90" fill="url(#formShapeGradSoft)" opacity="0.35" />
          <ellipse cx="60" cy="140" rx="90" ry="70" fill="url(#formShapeGrad)" opacity="0.12" />
        </svg>

        {/* Transparent food accents — soft shapes + cutout PNGs */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] hidden h-56 sm:block"
        >
          {/* Soft organic platforms — warm peach, not white */}
          <div className="absolute -bottom-10 -right-8 size-56 rotate-12 rounded-[2.5rem] bg-gradient-to-br from-[#FFD4B8]/90 via-[#FFC09A]/75 to-[#FF9A6A]/55 shadow-[0_20px_50px_-24px_rgb(230_57_70_/_0.4)]" />
          <div className="absolute bottom-6 right-36 size-36 -rotate-12 rounded-[2rem] bg-gradient-to-tr from-[#FFE0C8]/85 to-[#FFB080]/65 shadow-[0_16px_40px_-20px_rgb(255_122_0_/_0.4)]" />
          <div className="absolute bottom-20 right-8 size-24 rotate-6 rounded-full bg-[radial-gradient(circle,_rgb(255_122_0_/_0.35),_transparent_70%)] blur-md" />

          <motion.img
            src={ACCENT_TOMATO}
            alt=""
            initial={{ opacity: 0, y: 18, rotate: -8 }}
            animate={{ opacity: 1, y: [0, -6, 0], rotate: -8 }}
            transition={{
              opacity: { duration: 0.55 },
              y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute bottom-10 right-[11.5rem] w-[7.5rem] drop-shadow-[0_18px_28px_rgb(26_26_26_/_0.22)] lg:right-[13rem] lg:w-36"
          />
          <motion.img
            src={ACCENT_BASIL}
            alt=""
            initial={{ opacity: 0, y: 14, rotate: 18 }}
            animate={{ opacity: 1, y: [0, 5, 0], rotate: 18 }}
            transition={{
              opacity: { duration: 0.55, delay: 0.08 },
              y: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute bottom-[4.5rem] right-[7.5rem] w-28 drop-shadow-[0_14px_22px_rgb(26_26_26_/_0.18)] lg:w-32"
          />
          <motion.img
            src={ACCENT_CHILI}
            alt=""
            initial={{ opacity: 0, y: 20, rotate: -18 }}
            animate={{ opacity: 1, y: [0, -8, 0], rotate: -18 }}
            transition={{
              opacity: { duration: 0.6, delay: 0.12 },
              y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute -bottom-1 right-2 w-40 drop-shadow-[0_20px_32px_rgb(26_26_26_/_0.28)] lg:w-48"
          />
        </div>

        {/* Mobile hero */}
        <div className="relative z-[3] h-44 overflow-hidden lg:hidden">
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
