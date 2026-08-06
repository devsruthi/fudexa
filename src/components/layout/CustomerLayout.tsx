import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/shared'
import { Button } from '@/components/ui'
import { useAuth } from '@/features/auth/hooks'
import { PATHS } from '@/routes/paths'
import { cn } from '@/utils'

const customerNav = [
  { to: PATHS.customer.home, label: 'Home', end: true },
  { to: PATHS.customer.restaurants, label: 'Restaurants' },
  { to: PATHS.customer.cart, label: 'Cart' },
  { to: PATHS.customer.orders, label: 'Orders' },
  { to: PATHS.customer.profile, label: 'Profile' },
] as const

export function CustomerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate(PATHS.auth.login, { replace: true })
    } catch {
      // Toast handled in auth context
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              OrderFlow
            </span>
            <nav className="hidden items-center gap-1 sm:flex">
              {customerNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item ? item.end : false}
                  className={({ isActive }) =>
                    cn(
                      'rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
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
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {user.fullName}
              </span>
            ) : null}
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
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
