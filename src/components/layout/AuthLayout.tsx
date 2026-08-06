import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/shared'

export function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-foreground text-background lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgb(var(--color-primary)/0.45),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgb(56_189_248/0.25),_transparent_50%)]"
        />
        <div className="relative z-10">
          <p className="font-display text-2xl font-semibold tracking-tight">OrderFlow</p>
          <p className="mt-2 max-w-sm text-sm text-background/70">
            Real-time restaurant operations for merchants and diners.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10 space-y-6"
        >
          <div className="aspect-[4/3] w-full max-w-md rounded-[var(--radius-xl)] border border-background/15 bg-background/10 p-6 backdrop-blur">
            <div className="flex h-full flex-col justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded-full bg-background/30" />
                <div className="h-8 w-48 rounded-full bg-background/40" />
                <div className="h-3 w-40 rounded-full bg-background/20" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 rounded-[var(--radius-lg)] bg-background/15" />
                <div className="h-20 rounded-[var(--radius-lg)] bg-background/20" />
                <div className="h-20 rounded-[var(--radius-lg)] bg-background/10" />
              </div>
            </div>
          </div>
          <div>
            <p className="font-display text-3xl font-semibold tracking-tight">
              Run the floor.
              <br />
              Feed the city.
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-background/65">
              Accept orders, manage menus, and keep kitchens in sync — one platform for every role
              in your operation.
            </p>
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-background/50">
          © {new Date().getFullYear()} OrderFlow
        </p>
      </aside>

      <section className="relative flex flex-col bg-background">
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 lg:hidden">
              <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
                OrderFlow
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Restaurant operations, in real time
              </p>
            </div>
            <Outlet />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
