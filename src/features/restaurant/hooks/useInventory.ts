import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { restaurantKeys } from '@/features/restaurant/api'
import { merchantInventoryService } from '@/features/restaurant/services'
import { useRestaurantContext } from './useRestaurantContext'

export function useMerchantInventory() {
  const { data: ctx } = useRestaurantContext()
  const restaurantId = ctx?.restaurantId
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: restaurantKeys.inventory.all(restaurantId ?? ''),
    queryFn: () => merchantInventoryService.getInventory(restaurantId!),
    enabled: Boolean(restaurantId),
  })

  useEffect(() => {
    if (!restaurantId) return
    const channel = supabase
      .channel(`inventory-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: restaurantKeys.inventory.all(restaurantId),
          })
          void queryClient.invalidateQueries({
            queryKey: restaurantKeys.dashboard(restaurantId),
          })
        },
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [restaurantId, queryClient])

  return query
}

export function useInventoryMovements() {
  const { data: ctx } = useRestaurantContext()
  return useQuery({
    queryKey: restaurantKeys.inventory.movements(ctx?.restaurantId ?? ''),
    queryFn: () => merchantInventoryService.getInventoryMovements(ctx!.restaurantId),
    enabled: Boolean(ctx?.restaurantId),
  })
}

export function useUpdateInventory() {
  const { data: ctx } = useRestaurantContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: string; stock: number; low_stock_limit?: number }) =>
      merchantInventoryService.updateInventory(payload.id, {
        stock: payload.stock,
        low_stock_limit: payload.low_stock_limit,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: restaurantKeys.inventory.all(ctx!.restaurantId),
      })
      toast.success('Inventory updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
