import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, MapPin, Star, Store } from 'lucide-react'
import {
  CategoryFilter,
  EmptyState,
  ErrorState,
  FavoriteButton,
  MenuItemCard,
  MenuItemSkeleton,
  SearchBar,
} from '@/features/customer/components'
import {
  useCategories,
  useFavoriteIds,
  useMenu,
  useRestaurant,
  useToggleFavorite,
} from '@/features/customer/hooks'
import { useCartStore } from '@/store'
import {
  formatMinutes,
  isRestaurantOpenNow,
} from '@/features/customer/utils'
import { PATHS } from '@/routes/paths'
import { Spinner } from '@/components/ui'

export function RestaurantDetailPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>()
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [menuSearch, setMenuSearch] = useState('')

  const restaurant = useRestaurant(restaurantId)
  const categories = useCategories(restaurantId)
  const menu = useMenu(restaurantId, { categoryId, search: menuSearch })
  const favoriteIds = useFavoriteIds()
  const toggleFavorite = useToggleFavorite()
  const addItem = useCartStore((s) => s.addItem)

  const open = useMemo(() => {
    if (!restaurant.data) return false
    return isRestaurantOpenNow(
      restaurant.data.is_open,
      restaurant.data.opening_time,
      restaurant.data.closing_time,
    )
  }, [restaurant.data])

  if (restaurant.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Loading restaurant…" />
      </div>
    )
  }

  if (restaurant.isError || !restaurant.data) {
    return (
      <ErrorState
        title="Restaurant unavailable"
        description="We couldn’t find this restaurant."
        onRetry={() => void restaurant.refetch()}
      />
    )
  }

  const data = restaurant.data
  const isFavorite = Boolean(favoriteIds.data?.has(data.id))

  return (
    <div className="space-y-6">
      <Link
        to={PATHS.customer.restaurants}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to restaurants
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[var(--shadow-sm)]"
      >
        <div className="relative aspect-[21/9] min-h-48 bg-muted">
          {data.cover_image || data.logo ? (
            <img
              src={data.cover_image ?? data.logo ?? undefined}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_center,_rgb(var(--color-primary)/0.2),_transparent_65%)]">
              <Store className="size-16 text-primary/60" />
            </div>
          )}
          <div className="absolute right-4 top-4">
            <FavoriteButton
              isFavorite={isFavorite}
              onToggle={() =>
                toggleFavorite.mutate({ restaurantId: data.id, isFavorite })
              }
              loading={toggleFavorite.isPending}
            />
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${
                    open
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {open ? 'Open' : 'Closed'}
                </span>
                {data.opening_time && data.closing_time ? (
                  <span className="text-xs text-muted-foreground">
                    Hours {data.opening_time.slice(0, 5)} – {data.closing_time.slice(0, 5)}
                  </span>
                ) : null}
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
                {data.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {data.description || 'Quality food prepared with care.'}
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] bg-muted px-4 py-3 text-center">
              <div className="inline-flex items-center gap-1 text-lg font-semibold">
                <Star className="size-4 fill-warning text-warning" />
                {Number(data.rating).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">{data.total_reviews} reviews</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" />
              {data.address}, {data.city}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" />
              {formatMinutes(data.estimatedDeliveryMinutes)}
            </span>
          </div>
        </div>
      </motion.section>

      {!open ? (
        <div className="rounded-[var(--radius-lg)] border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground">
          This restaurant is currently closed. You can browse the menu, but ordering is disabled.
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">Menu</h2>
          <SearchBar
            value={menuSearch}
            onChange={setMenuSearch}
            placeholder="Search menu…"
            className="sm:max-w-xs"
            aria-label="Search menu"
          />
        </div>

        {categories.data ? (
          <CategoryFilter
            categories={categories.data}
            value={categoryId}
            onChange={setCategoryId}
          />
        ) : null}

        {menu.isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <MenuItemSkeleton key={i} />
            ))}
          </div>
        ) : menu.isError ? (
          <ErrorState onRetry={() => void menu.refetch()} />
        ) : (menu.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No menu items"
            description="Try another category or clear your search."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {menu.data?.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                restaurantId={data.id}
                restaurantName={data.name}
                disabled={!open}
                onAdd={(quantity) =>
                  addItem({
                    menuItemId: item.id,
                    restaurantId: data.id,
                    restaurantName: data.name,
                    name: item.name,
                    price: Number(item.price),
                    image: item.image,
                    preparationTime: item.preparation_time,
                    quantity,
                  })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
