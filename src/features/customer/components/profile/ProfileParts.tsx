import { Link } from 'react-router-dom'
import { Heart, MapPin, Store } from 'lucide-react'
import type { Profile, RestaurantWithMeta, SavedAddress } from '@/features/customer/types'
import { getInitials, restaurantDetailPath } from '@/features/customer/utils'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

interface ProfileCardProps {
  profile: Profile
  className?: string
}

export function ProfileCard({ profile, className }: ProfileCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-lg font-semibold text-primary">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="size-full object-cover" />
        ) : (
          getInitials(profile.full_name)
        )}
      </div>
      <div className="min-w-0">
        <h2 className="truncate font-display text-xl font-semibold text-foreground">
          {profile.full_name}
        </h2>
        <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
        {profile.phone ? (
          <p className="mt-1 text-sm text-muted-foreground">{profile.phone}</p>
        ) : null}
      </div>
    </div>
  )
}

interface AddressCardProps {
  address: SavedAddress
  onRemove?: () => void
  onSetDefault?: () => void
  className?: string
}

export function AddressCard({ address, onRemove, onSetDefault, className }: AddressCardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-[var(--radius-md)] bg-muted p-2 text-muted-foreground">
          <MapPin className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground">{address.label}</h3>
            {address.isDefault ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                Default
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{address.address}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!address.isDefault && onSetDefault ? (
              <Button size="sm" variant="outline" onClick={onSetDefault}>
                Set default
              </Button>
            ) : null}
            {onRemove ? (
              <Button size="sm" variant="ghost" onClick={onRemove}>
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

interface FavoriteRestaurantRowProps {
  restaurant: RestaurantWithMeta
  onRemove?: () => void
}

export function FavoriteRestaurantRow({ restaurant, onRemove }: FavoriteRestaurantRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-3">
      <div className="flex size-12 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-muted">
        {restaurant.logo ? (
          <img src={restaurant.logo} alt="" className="size-full object-cover" />
        ) : (
          <Store className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          to={restaurantDetailPath(restaurant.id)}
          className="font-medium text-foreground hover:text-primary"
        >
          {restaurant.name}
        </Link>
        <p className="text-xs text-muted-foreground">{restaurant.city}</p>
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-2 text-danger hover:bg-muted"
          aria-label={`Remove ${restaurant.name} from favorites`}
        >
          <Heart className="size-4 fill-danger" />
        </button>
      ) : null}
    </div>
  )
}
