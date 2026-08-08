import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, ShoppingBag } from 'lucide-react'
import { ThemeToggle } from '@/components/shared'
import { Button } from '@/components/ui'
import { useAuth } from '@/features/auth/hooks'
import { NotificationCenter } from '@/features/realtime'
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
    <div className="relative flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/70 app-shell-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-6">
            <span className="font-display text-xl font-semibold tracking-tight text-brand-gradient">
              Fudexa
            </span>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Customer">
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
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <span className="hidden max-w-36 truncate rounded-full bg-muted/80 px-3 py-1 text-xs font-medium text-muted-foreground sm:inline">
                {user.fullName}
              </span>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(PATHS.customer.cart)}
              aria-label={`Cart, ${itemCount} items`}
              className="relative"
            >
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground shadow-[var(--shadow-sm)]">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              ) : null}
            </Button>
            <NotificationCenter />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleLogout()}
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
        <nav
          className="flex gap-1.5 overflow-x-auto border-t border-border/60 px-4 py-2.5 md:hidden"
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
