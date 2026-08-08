import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Star,
  UtensilsCrossed,
  CookingPot,
  X,
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared'
import { Button } from '@/components/ui'
import { useAuth } from '@/features/auth/hooks'
import { NotificationCenter, RestaurantRealtimeBridge } from '@/features/realtime'
import { useMerchantOrders } from '@/features/restaurant/hooks'
import { PATHS } from '@/routes/paths'
import { cn } from '@/utils'

const restaurantNav = [
  { to: PATHS.restaurant.dashboard, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: PATHS.restaurant.orders, label: 'Orders', icon: ClipboardList },
  { to: PATHS.restaurant.kitchen, label: 'Kitchen', icon: CookingPot },
  { to: PATHS.restaurant.menu, label: 'Menu', icon: UtensilsCrossed },
  { to: PATHS.restaurant.categories, label: 'Categories', icon: FolderTree },
  { to: PATHS.restaurant.inventory, label: 'Inventory', icon: Package },
  { to: PATHS.restaurant.reviews, label: 'Reviews', icon: Star },
  { to: PATHS.restaurant.analytics, label: 'Analytics', icon: BarChart3 },
  { to: PATHS.restaurant.settings, label: 'Settings', icon: Settings },
] as const

const mobileNav = [
  restaurantNav[0],
  restaurantNav[1],
  restaurantNav[2],
  restaurantNav[3],
  restaurantNav[5],
] as const

export function RestaurantLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pendingOrders = useMerchantOrders({ status: 'Pending' })
  const pendingCount = pendingOrders.data?.length ?? 0

  const handleLogout = async () => {
    try {
      await logout()
      navigate(PATHS.auth.login, { replace: true })
    } catch {
      // Toast handled in auth context
    }
  }

  const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {restaurantNav.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : false}
            onClick={onNavigate}
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
            <span className="flex-1">{item.label}</span>
            {item.to === PATHS.restaurant.orders && pendingCount > 0 ? (
              <span className="rounded-full bg-warning px-1.5 py-0.5 text-[10px] font-bold text-warning-foreground">
                {pendingCount}
              </span>
            ) : null}
          </NavLink>
        )
      })}
    </>
  )

  return (
    <div className="flex min-h-dvh bg-background">
      <RestaurantRealtimeBridge />
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            Fudexa
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Restaurant">
          <NavItems />
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

      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-64 flex-col bg-surface shadow-[var(--shadow-lg)]">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="font-display text-lg font-semibold">Fudexa</span>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Close sidebar"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              <NavItems onNavigate={() => setSidebarOpen(false)} />
            </nav>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
            <span className="font-display text-lg font-semibold md:hidden">Fudexa</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationCenter />
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
        <main className="flex-1 overflow-auto p-4 pb-24 md:p-8 md:pb-8">
          <Outlet />
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface md:hidden"
          aria-label="Mobile restaurant navigation"
        >
          {mobileNav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )
                }
              >
                <Icon className="size-4" />
                {item.label}
                {item.to === PATHS.restaurant.orders && pendingCount > 0 ? (
                  <span className="absolute top-1 right-[calc(50%-18px)] size-2 rounded-full bg-warning" />
                ) : null}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
