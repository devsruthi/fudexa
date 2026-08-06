import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { customerKeys } from '@/features/customer/api'
import { restaurantService } from '@/features/customer/services'
import type { RestaurantFilters } from '@/features/customer/types'

export function useRestaurants(filters: RestaurantFilters, pageSize = 12) {
  return useInfiniteQuery({
    queryKey: customerKeys.restaurants.infinite(filters as Record<string, unknown>),
    queryFn: ({ pageParam }) => restaurantService.getRestaurants(filters, pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  })
}

export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: customerKeys.restaurants.detail(id ?? ''),
    queryFn: () => restaurantService.getRestaurant(id!),
    enabled: Boolean(id),
  })
}

export function usePopularRestaurants(limit = 8) {
  return useQuery({
    queryKey: customerKeys.restaurants.popular(),
    queryFn: () => restaurantService.getPopularRestaurants(limit),
  })
}

export function useFeaturedRestaurants(limit = 6) {
  return useQuery({
    queryKey: customerKeys.restaurants.featured(),
    queryFn: () => restaurantService.getFeaturedRestaurants(limit),
  })
}

export function useSearchRestaurants(search: string) {
  return useQuery({
    queryKey: customerKeys.restaurants.list({ search }),
    queryFn: () => restaurantService.searchRestaurants(search),
    enabled: search.trim().length >= 2,
  })
}
