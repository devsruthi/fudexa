import { supabase, type Restaurant } from '@/lib/supabase'
import type { PaginatedResult, RestaurantFilters, RestaurantWithMeta } from '@/features/customer/types'
import { estimateDeliveryMinutes } from '@/features/customer/utils'

const PAGE_SIZE = 12

function applyRestaurantFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  filters: RestaurantFilters,
) {
  let next = query

  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`
    next = next.or(`name.ilike.${term},city.ilike.${term},description.ilike.${term}`)
  }

  if (filters.city?.trim()) {
    next = next.ilike('city', `%${filters.city.trim()}%`)
  }

  if (filters.openOnly) {
    next = next.eq('is_open', true)
  }

  if (filters.minRating && filters.minRating > 0) {
    next = next.gte('rating', filters.minRating)
  }

  switch (filters.sort) {
    case 'name':
      next = next.order('name', { ascending: true })
      break
    case 'newest':
      next = next.order('created_at', { ascending: false })
      break
    case 'open_first':
      next = next.order('is_open', { ascending: false }).order('rating', { ascending: false })
      break
    case 'rating':
    default:
      next = next.order('rating', { ascending: false }).order('total_reviews', { ascending: false })
      break
  }

  return next
}

function enrichRestaurant(restaurant: Restaurant): RestaurantWithMeta {
  return {
    ...restaurant,
    estimatedDeliveryMinutes: estimateDeliveryMinutes(25),
    cuisineTags: restaurant.city ? [restaurant.city] : [],
  }
}

export async function getRestaurants(
  filters: RestaurantFilters = {},
  page = 1,
  pageSize = PAGE_SIZE,
): Promise<PaginatedResult<RestaurantWithMeta>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from('restaurants').select('*', { count: 'exact' })
  query = applyRestaurantFilters(query, filters)
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  const rows = (data ?? []).map(enrichRestaurant)
  const total = count ?? 0

  return {
    data: rows,
    count: total,
    page,
    pageSize,
    hasMore: from + rows.length < total,
  }
}

export async function searchRestaurants(search: string): Promise<RestaurantWithMeta[]> {
  const result = await getRestaurants({ search, sort: 'rating' }, 1, 20)
  return result.data
}

export async function getRestaurant(id: string): Promise<RestaurantWithMeta> {
  const { data, error } = await supabase.from('restaurants').select('*').eq('id', id).single()
  if (error) throw error
  return enrichRestaurant(data)
}

export async function getPopularRestaurants(limit = 8): Promise<RestaurantWithMeta[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_open', true)
    .order('rating', { ascending: false })
    .order('total_reviews', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(enrichRestaurant)
}

export async function getFeaturedRestaurants(limit = 6): Promise<RestaurantWithMeta[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('total_reviews', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(enrichRestaurant)
}

export const restaurantService = {
  getRestaurants,
  getRestaurant,
  searchRestaurants,
  getPopularRestaurants,
  getFeaturedRestaurants,
}
