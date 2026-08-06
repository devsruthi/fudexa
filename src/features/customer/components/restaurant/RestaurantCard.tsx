import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, MapPin, Star, Store } from 'lucide-react'
import type { RestaurantWithMeta } from '@/features/customer/types'
import { formatMinutes, isRestaurantOpenNow, restaurantDetailPath } from '@/features/customer/utils'
import { FavoriteButton } from '../shared/FavoriteButton'
import { cn } from '@/utils'

interface RestaurantCardProps {
  restaurant: RestaurantWithMeta
  isFavorite?: boolean
  onToggleFavorite?: () => void
  favoriteLoading?: boolean
  className?: string
}

export function RestaurantCard({
  restaurant,
  isFavorite,
  onToggleFavorite,
  favoriteLoading,
  className,
}: RestaurantCardProps) {
  const open = isRestaurantOpenNow(
    restaurant.is_open,
    restaurant.opening_time,
    restaurant.closing_time,
  )

  return (
    <motion.article
      layout
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)]',
        className,
      )}
    >
      <Link to={restaurantDetailPath(restaurant.id)} className="block focus:outline-none">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {restaurant.cover_image || restaurant.logo ? (
            <img
              src={restaurant.cover_image ?? restaurant.logo ?? undefined}
              alt=""
              className="size-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary)/0.25),_transparent_60%)]">
              <Store className="size-12 text-primary/70" aria-hidden />
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                open ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {open ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary">
              {restaurant.name}
            </h3>
            <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
              <Star className="size-3 fill-warning text-warning" aria-hidden />
              {Number(restaurant.rating).toFixed(1)}
            </div>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {restaurant.description || 'Fresh meals prepared to order.'}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {restaurant.city}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {formatMinutes(restaurant.estimatedDeliveryMinutes)}
            </span>
            <span>{restaurant.total_reviews} reviews</span>
          </div>
        </div>
      </Link>

      {onToggleFavorite ? (
        <div className="absolute right-3 top-3">
          <FavoriteButton
            isFavorite={Boolean(isFavorite)}
            onToggle={onToggleFavorite}
            loading={favoriteLoading}
            size="sm"
          />
        </div>
      ) : null}
    </motion.article>
  )
}
