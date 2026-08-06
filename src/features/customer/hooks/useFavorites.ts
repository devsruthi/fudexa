import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerKeys } from '@/features/customer/api'
import { favoriteService } from '@/features/customer/services'
import { useAuth } from '@/features/auth'

export function useFavorites() {
  const { user } = useAuth()

  return useQuery({
    queryKey: customerKeys.favorites.list(),
    queryFn: () => favoriteService.getFavorites(user!.id),
    enabled: Boolean(user?.id),
  })
}

export function useFavoriteIds() {
  const { user } = useAuth()

  return useQuery({
    queryKey: customerKeys.favorites.ids(),
    queryFn: () => favoriteService.getFavoriteIds(user!.id),
    enabled: Boolean(user?.id),
  })
}

export function useToggleFavorite() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      restaurantId,
      isFavorite,
    }: {
      restaurantId: string
      isFavorite: boolean
    }) => {
      if (!user?.id) throw new Error('Sign in to manage favorites.')
      if (isFavorite) {
        await favoriteService.removeFavorite(user.id, restaurantId)
      } else {
        await favoriteService.addFavorite(user.id, restaurantId)
      }
    },
    onMutate: async ({ restaurantId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: customerKeys.favorites.ids() })
      const previous = queryClient.getQueryData<Set<string>>(customerKeys.favorites.ids())
      const next = new Set(previous ?? [])
      if (isFavorite) next.delete(restaurantId)
      else next.add(restaurantId)
      queryClient.setQueryData(customerKeys.favorites.ids(), next)
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(customerKeys.favorites.ids(), context.previous)
      }
      toast.error('Could not update favorites')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.favorites.all })
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.isFavorite ? 'Removed from favorites' : 'Saved to favorites')
    },
  })
}
