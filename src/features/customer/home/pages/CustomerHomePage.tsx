import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock3, Search, Sparkles, Utensils } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAuth } from '@/features/auth'
import {
  EmptyState,
  ErrorState,
  MenuItemSkeleton,
  RestaurantCard,
  RestaurantCardSkeleton,
  SearchBar,
} from '@/features/customer/components'
import {
  useFavoriteIds,
  useFeaturedMenuItems,
  useFavorites,
  usePopularRestaurants,
  useRecentOrders,
  useToggleFavorite,
} from '@/features/customer/hooks'
import { useCartStore } from '@/store'
import { formatCurrency, restaurantDetailPath } from '@/features/customer/utils'
import { PATHS } from '@/routes/paths'
import { OrderCard } from '@/features/customer/components'

export function CustomerHomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const popular = usePopularRestaurants(8)
  const favorites = useFavorites()
  const recentOrders = useRecentOrders(4)
  const featuredMenu = useFeaturedMenuItems(6)
  const favoriteIds = useFavoriteIds()
  const toggleFavorite = useToggleFavorite()
  const addItem = useCartStore((s) => s.addItem)

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    navigate(`${PATHS.customer.restaurants}?${params.toString()}`)
  }

  const categoryShortcuts = ['Starters', 'Mains', 'Sides', 'Drinks', 'Desserts']

  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgb(var(--color-primary)/0.18),_transparent_55%)]"
        />
        <div className="relative z-10 max-w-2xl space-y-4">
          <p className="text-sm font-medium text-primary">
            {greeting}
            {user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            What are you craving tonight?
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Discover nearby kitchens, reorder favorites, and track deliveries in real time.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchBar
              value={search}
              onChange={setSearch}
              className="flex-1"
              placeholder="Search restaurants or dishes"
            />
            <Button onClick={handleSearch} className="sm:w-auto">
              <Search className="size-4" />
              Search
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {categoryShortcuts.map((category) => (
              <Link
                key={category}
                to={`${PATHS.customer.restaurants}?q=${encodeURIComponent(category)}`}
                className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      <section className="space-y-4">
        <SectionHeader
          title="Popular near you"
          actionLabel="See all"
          actionTo={PATHS.customer.restaurants}
          icon={<Sparkles className="size-4 text-primary" />}
        />
        {popular.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : popular.isError ? (
          <ErrorState onRetry={() => void popular.refetch()} />
        ) : (popular.data?.length ?? 0) === 0 ? (
          <EmptyState title="No restaurants yet" description="Check back soon for nearby kitchens." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popular.data?.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isFavorite={favoriteIds.data?.has(restaurant.id)}
                favoriteLoading={toggleFavorite.isPending}
                onToggleFavorite={() =>
                  toggleFavorite.mutate({
                    restaurantId: restaurant.id,
                    isFavorite: Boolean(favoriteIds.data?.has(restaurant.id)),
                  })
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Your favorites"
          actionLabel="Manage"
          actionTo={PATHS.customer.profile}
          icon={<Sparkles className="size-4 text-primary" />}
        />
        {favorites.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : (favorites.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No favorites yet"
            description="Tap the heart on any restaurant to save it here."
            actionLabel="Browse restaurants"
            onAction={() => navigate(PATHS.customer.restaurants)}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.data?.slice(0, 6).map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isFavorite
                onToggleFavorite={() =>
                  toggleFavorite.mutate({ restaurantId: restaurant.id, isFavorite: true })
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Featured dishes"
          icon={<Utensils className="size-4 text-primary" />}
        />
        {featuredMenu.isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <MenuItemSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {featuredMenu.data?.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  addItem({
                    menuItemId: item.id,
                    restaurantId: item.restaurant_id,
                    restaurantName: 'Restaurant',
                    name: item.name,
                    price: Number(item.price),
                    image: item.image,
                    preparationTime: item.preparation_time,
                  })
                }}
                className="flex items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-4 text-left transition hover:border-primary/40 hover:shadow-[var(--shadow-sm)]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(Number(item.price))}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Add <ArrowRight className="size-3.5" />
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Recent orders"
          actionLabel="Order history"
          actionTo={PATHS.customer.orders}
          icon={<Clock3 className="size-4 text-primary" />}
        />
        {recentOrders.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : (recentOrders.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Your recent orders will show up here after checkout."
            actionLabel="Find food"
            onAction={() => navigate(PATHS.customer.restaurants)}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recentOrders.data?.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-center pb-4">
        <Link
          to={PATHS.customer.restaurants}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Browse all restaurants
          <ArrowRight className="size-4" />
        </Link>
        <span className="sr-only">
          Or open a restaurant via {restaurantDetailPath('id')}
        </span>
      </div>
    </div>
  )
}

function SectionHeader({
  title,
  actionLabel,
  actionTo,
  icon,
}: {
  title: string
  actionLabel?: string
  actionTo?: string
  icon?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="text-sm font-medium text-primary hover:underline">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
