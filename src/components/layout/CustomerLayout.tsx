import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, ShoppingBag } from 'lucide-react'
import { ThemeToggle } from '@/components/shared'
import { Button } from '@/components/ui'
import { useAuth } from '@/features/auth/hooks'
import { NotificationCenter } from '@/features/realtime'
import { getInitials } from '@/features/customer/utils'
import { useCartStore } from '@/store'
import { PATHS } from '@/routes/paths'
import { cn } from '@/utils'

const customerNav = [
  { to: PATHS.customer.home, label: 'Home', end: true },
  { to: PATHS.customer.restaurants, label: 'Restaurants' },
  { to: PATHS.customer.orders, label: 'Orders' },
  { to: PATHS.customer.profile, label: 'Profile' },
] as const

export function CustomerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  )

  const handleLogout = async () => {
    try {
      await logout()
      navigate(PATHS.auth.login, { replace: true })
    } catch {
      // Toast handled in auth context
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-page-gradient">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-[linear-gradient(180deg,_rgb(255_255_255_/_0.92)_0%,_rgb(255_245_242_/_0.88)_100%)] shadow-[0_1px_0_rgb(230_57_70_/_0.06)] backdrop-blur-xl">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-5">
            <Link
              to={PATHS.customer.home}
              className="group flex shrink-0 items-center gap-2.5"
              aria-label="Fudexa home"
            >
              <img
                src="/favicon-64.png"
                alt=""
                width={36}
                height={36}
                className="size-9 rounded-[0.7rem] shadow-[var(--shadow-sm)] ring-1 ring-primary/15 transition group-hover:ring-primary/30"
              />
              <span className="font-display text-xl font-semibold tracking-tight text-brand-gradient">
                Fudexa
              </span>
            </Link>

            <nav
              className="hidden items-center gap-0.5 rounded-full bg-muted/70 p-1 md:flex"
              aria-label="Customer"
            >
              {customerNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item ? item.end : false}
                  className={({ isActive }) =>
                    cn(
                      'rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-[var(--shadow-sm)]'
                        : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(PATHS.customer.cart)}
              aria-label={`Cart, ${itemCount} items`}
              className="relative rounded-full border-border/80 bg-surface/90"
            >
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-primary-foreground shadow-[var(--shadow-sm)]">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              ) : null}
            </Button>

            <NotificationCenter />
            <ThemeToggle />

            {/* Name + sign out grouped on the right */}
            <div className="ml-0.5 flex items-center gap-1.5 border-l border-border/70 pl-2 sm:ml-1 sm:gap-2 sm:pl-3">
              {user ? (
                <button
                  type="button"
                  onClick={() => navigate(PATHS.customer.profile)}
                  className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/90 py-1 pr-2.5 pl-1 text-left shadow-[var(--shadow-sm)] transition hover:border-primary/25 hover:bg-muted/50 sm:pr-3"
                  aria-label="Open profile"
                >
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-primary-foreground">
                    {getInitials(user.fullName || user.email || 'U')}
                  </span>
                  <span className="hidden max-w-28 truncate text-xs font-semibold text-foreground sm:inline">
                    {user.fullName}
                  </span>
                </button>
              ) : null}

              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleLogout()}
                aria-label="Sign out"
                className="rounded-full border-primary/20 bg-primary/5 text-primary hover:border-primary/35 hover:bg-primary/10"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </div>

        <nav
          className="flex gap-1.5 overflow-x-auto border-t border-border/50 px-4 py-2.5 md:hidden"
          aria-label="Customer mobile"
        >
          {customerNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                cn(
                  'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[var(--shadow-sm)]'
                    : 'bg-muted/80 text-muted-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:py-9">
        <Outlet />
      </main>
    </div>
  )
}
