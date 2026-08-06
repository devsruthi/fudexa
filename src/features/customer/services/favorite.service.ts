import { supabase, type Favorite, type Restaurant } from '@/lib/supabase'
import type { RestaurantWithMeta } from '@/features/customer/types'
import { estimateDeliveryMinutes } from '@/features/customer/utils'

export async function getFavorites(customerId: string): Promise<RestaurantWithMeta[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, restaurant:restaurants(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? [])
    .map((row) => {
      const restaurant = (row as Favorite & { restaurant: Restaurant | null }).restaurant
      if (!restaurant) return null
      return {
        ...restaurant,
        isFavorite: true,
        estimatedDeliveryMinutes: estimateDeliveryMinutes(25),
        cuisineTags: restaurant.city ? [restaurant.city] : [],
      } satisfies RestaurantWithMeta
    })
    .filter(Boolean) as RestaurantWithMeta[]
}

export async function getFavoriteIds(customerId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('favorites')
    .select('restaurant_id')
    .eq('customer_id', customerId)

  if (error) throw error
  return new Set((data ?? []).map((row) => row.restaurant_id))
}

export async function addFavorite(customerId: string, restaurantId: string): Promise<void> {
  const { error } = await supabase.from('favorites').insert({
    customer_id: customerId,
    restaurant_id: restaurantId,
  })
  if (error) throw error
}

export async function removeFavorite(customerId: string, restaurantId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('customer_id', customerId)
    .eq('restaurant_id', restaurantId)

  if (error) throw error
}

export const favoriteService = {
  getFavorites,
  getFavoriteIds,
  addFavorite,
  removeFavorite,
}
