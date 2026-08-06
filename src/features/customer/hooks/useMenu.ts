import { useQuery } from '@tanstack/react-query'
import { customerKeys } from '@/features/customer/api'
import { menuService } from '@/features/customer/services'

export function useCategories(restaurantId: string | undefined) {
  return useQuery({
    queryKey: customerKeys.menu.categories(restaurantId ?? ''),
    queryFn: () => menuService.getCategories(restaurantId!),
    enabled: Boolean(restaurantId),
  })
}

export function useMenu(
  restaurantId: string | undefined,
  options: { categoryId?: string | null; search?: string } = {},
) {
  return useQuery({
    queryKey: [
      ...customerKeys.menu.items(restaurantId ?? '', options.categoryId),
      options.search ?? '',
    ],
    queryFn: () => menuService.getMenu(restaurantId!, options),
    enabled: Boolean(restaurantId),
  })
}

export function useFeaturedMenuItems(limit = 8) {
  return useQuery({
    queryKey: customerKeys.menu.featured(),
    queryFn: () => menuService.getFeaturedMenuItems(limit),
  })
}
