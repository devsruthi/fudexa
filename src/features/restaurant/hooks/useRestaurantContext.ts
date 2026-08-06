import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { restaurantKeys } from '@/features/restaurant/api'
import { restaurantSettingsService } from '@/features/restaurant/services'

export function useRestaurantContext() {
  const { user } = useAuth()

  return useQuery({
    queryKey: restaurantKeys.context(),
    queryFn: async () => {
      const restaurant = await restaurantSettingsService.getOwnedRestaurant(user!.id)
      return { restaurant, restaurantId: restaurant.id }
    },
    enabled: Boolean(user?.id && user.role === 'restaurant'),
    staleTime: 60_000,
  })
}
