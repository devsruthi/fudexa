import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Star,
  UtensilsCrossed,
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared'
import { Button } from '@/components/ui'
import { useAuth } from '@/features/auth/hooks'
import { PATHS } from '@/routes/paths'
import { cn } from '@/utils'

const restaurantNav = [
  { to: PATHS.restaurant.dashboard, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: PATHS.restaurant.orders, label: 'Orders', icon: ClipboardList },
  { to: PATHS.restaurant.menu, label: 'Menu', icon: UtensilsCrossed },
  { to: PATHS.restaurant.analytics, label: 'Analytics', icon: BarChart3 },
  { to: PATHS.restaurant.inventory, label: 'Inventory', icon: Package },
  { to: PATHS.restaurant.reviews, label: 'Reviews', icon: Star },
  { to: PATHS.restaurant.settings, label: 'Settings', icon: Settings },
] as const

export function RestaurantLayout() {
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
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            OrderFlow
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {restaurantNav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="space-y-3 border-t border-border p-3">
          {user ? (
            <div className="px-1">
              <p className="truncate text-sm font-medium text-foreground">{user.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.restaurantName || user.email}
              </p>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2">
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
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
          <span className="font-display text-lg font-semibold md:hidden">OrderFlow</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => void handleLogout()}
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
