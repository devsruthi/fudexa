import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui'
import {
  EmptyState,
  ErrorState,
  RestaurantCard,
  RestaurantCardSkeleton,
  SearchBar,
} from '@/features/customer/components'
import { useFavoriteIds, useRestaurants, useToggleFavorite } from '@/features/customer/hooks'
import type { RestaurantSort } from '@/features/customer/types'

export function RestaurantsPage() {
  const [params, setParams] = useSearchParams()
  const search = params.get('q') ?? ''
  const [sort, setSort] = useState<RestaurantSort>('rating')
  const [openOnly, setOpenOnly] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      sort,
      openOnly: openOnly || undefined,
      minRating: minRating > 0 ? minRating : undefined,
    }),
    [search, sort, openOnly, minRating],
  )

  const restaurants = useRestaurants(filters)
  const favoriteIds = useFavoriteIds()
  const toggleFavorite = useToggleFavorite()

  const items = restaurants.data?.pages.flatMap((page) => page.data) ?? []

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          restaurants.hasNextPage &&
          !restaurants.isFetchingNextPage
        ) {
          void restaurants.fetchNextPage()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [restaurants])

  const updateSearch = (value: string) => {
    const next = new URLSearchParams(params)
    if (value.trim()) next.set('q', value.trim())
    else next.delete('q')
    setParams(next, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Restaurants
        </h1>
        <p className="text-sm text-muted-foreground">
          Search by restaurant, city, or cuisine and filter what&apos;s open now.
        </p>
      </div>

      <div className="sticky top-14 z-20 space-y-3 rounded-[var(--radius-xl)] border border-border bg-surface/95 p-4 shadow-[var(--shadow-sm)] backdrop-blur">
        <SearchBar value={search} onChange={updateSearch} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <SlidersHorizontal className="size-3.5" />
            Filters
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as RestaurantSort)}
            className="h-9 rounded-[var(--radius-md)] border border-border bg-background px-3 text-sm"
            aria-label="Sort restaurants"
          >
            <option value="rating">Top rated</option>
            <option value="name">Name A–Z</option>
            <option value="newest">Newest</option>
            <option value="open_first">Open first</option>
          </select>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="h-9 rounded-[var(--radius-md)] border border-border bg-background px-3 text-sm"
            aria-label="Minimum rating"
          >
            <option value={0}>Any rating</option>
            <option value={3}>3+ stars</option>
            <option value={4}>4+ stars</option>
            <option value={4.5}>4.5+ stars</option>
          </select>
          <Button
            size="sm"
            variant={openOnly ? 'primary' : 'outline'}
            onClick={() => setOpenOnly((v) => !v)}
          >
            Open now
          </Button>
        </div>
      </div>

      {restaurants.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      ) : restaurants.isError ? (
        <ErrorState onRetry={() => void restaurants.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No restaurants found"
          description="Try a different search term or clear your filters."
          actionLabel="Clear filters"
          onAction={() => {
            updateSearch('')
            setOpenOnly(false)
            setMinRating(0)
            setSort('rating')
          }}
        />
      ) : (
        <>
          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((restaurant) => (
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
          </motion.div>
          <div ref={loadMoreRef} className="flex justify-center py-6">
            {restaurants.isFetchingNextPage ? (
              <p className="text-sm text-muted-foreground">Loading more…</p>
            ) : restaurants.hasNextPage ? (
              <Button variant="outline" onClick={() => void restaurants.fetchNextPage()}>
                Load more
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">You&apos;ve seen all restaurants</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
