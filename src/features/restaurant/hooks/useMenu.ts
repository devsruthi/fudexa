import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { restaurantKeys } from '@/features/restaurant/api'
import { merchantMenuService, type MenuItemInput } from '@/features/restaurant/services/menu.service'
import { useRestaurantContext } from './useRestaurantContext'

export function useMerchantCategories() {
  const { data: ctx } = useRestaurantContext()
  return useQuery({
    queryKey: restaurantKeys.categories.all(ctx?.restaurantId ?? ''),
    queryFn: () => merchantMenuService.getCategories(ctx!.restaurantId),
    enabled: Boolean(ctx?.restaurantId),
  })
}

export function useMerchantMenu(filters: { search?: string; categoryId?: string | null } = {}) {
  const { data: ctx } = useRestaurantContext()
  return useQuery({
    queryKey: restaurantKeys.menu.list(ctx?.restaurantId ?? '', filters as Record<string, unknown>),
    queryFn: () => merchantMenuService.getMenu(ctx!.restaurantId, filters),
    enabled: Boolean(ctx?.restaurantId),
  })
}

export function useMerchantMenuItem(itemId: string | undefined) {
  return useQuery({
    queryKey: restaurantKeys.menu.detail(itemId ?? ''),
    queryFn: () => merchantMenuService.getMenuItem(itemId!),
    enabled: Boolean(itemId),
  })
}

export function useMenuMutations() {
  const { data: ctx } = useRestaurantContext()
  const queryClient = useQueryClient()
  const restaurantId = ctx?.restaurantId

  const invalidate = () => {
    if (!restaurantId) return
    void queryClient.invalidateQueries({ queryKey: restaurantKeys.menu.all(restaurantId) })
    void queryClient.invalidateQueries({ queryKey: restaurantKeys.inventory.all(restaurantId) })
    void queryClient.invalidateQueries({ queryKey: restaurantKeys.categories.all(restaurantId) })
  }

  const createItem = useMutation({
    mutationFn: (payload: MenuItemInput) => merchantMenuService.createMenuItem(restaurantId!, payload),
    onSuccess: () => {
      invalidate()
      toast.success('Menu item created')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateItem = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<MenuItemInput> }) =>
      merchantMenuService.updateMenuItem(id, payload),
    onSuccess: () => {
      invalidate()
      toast.success('Menu item updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteItem = useMutation({
    mutationFn: (id: string) => merchantMenuService.deleteMenuItem(id),
    onSuccess: () => {
      invalidate()
      toast.success('Menu item deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const duplicateItem = useMutation({
    mutationFn: (id: string) => merchantMenuService.duplicateMenuItem(id),
    onSuccess: () => {
      invalidate()
      toast.success('Menu item duplicated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const archiveItem = useMutation({
    mutationFn: (id: string) => merchantMenuService.archiveMenuItem(id),
    onSuccess: () => {
      invalidate()
      toast.success('Menu item archived')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const createCategory = useMutation({
    mutationFn: (name: string) => merchantMenuService.createCategory(restaurantId!, { name }),
    onSuccess: () => {
      invalidate()
      toast.success('Category created')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateCategory = useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string
      name?: string
      is_active?: boolean
      display_order?: number
    }) => merchantMenuService.updateCategory(id, payload),
    onSuccess: () => {
      invalidate()
      toast.success('Category updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteCategory = useMutation({
    mutationFn: (id: string) => merchantMenuService.deleteCategory(id),
    onSuccess: () => {
      invalidate()
      toast.success('Category deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const reorderCategories = useMutation({
    mutationFn: (updates: { id: string; display_order: number }[]) =>
      merchantMenuService.reorderCategories(updates),
    onSuccess: () => {
      invalidate()
      toast.success('Category order saved')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return {
    createItem,
    updateItem,
    deleteItem,
    duplicateItem,
    archiveItem,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  }
}
