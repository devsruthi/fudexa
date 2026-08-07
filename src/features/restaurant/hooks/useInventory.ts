import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { restaurantKeys } from '@/features/restaurant/api'
import { merchantInventoryService } from '@/features/restaurant/services'
import { useRestaurantContext } from './useRestaurantContext'
import { useRealtimeInventory } from '@/features/realtime/hooks/useRealtimeInventory'
import { offlineQueue } from '@/features/realtime/services'
import { useRealtimeStore } from '@/features/realtime/store/realtime.store'
import type { InventoryWithItem } from '@/features/restaurant/types'

export function useMerchantInventory() {
  const { data: ctx } = useRestaurantContext()
  const restaurantId = ctx?.restaurantId

  useRealtimeInventory(restaurantId)

  return useQuery({
    queryKey: restaurantKeys.inventory.all(restaurantId ?? ''),
    queryFn: () => merchantInventoryService.getInventory(restaurantId!),
    enabled: Boolean(restaurantId),
  })
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
  const isOnline = useRealtimeStore((s) => s.isOnline)

  return useMutation({
    mutationFn: async (payload: { id: string; stock: number; low_stock_limit?: number }) => {
      if (!isOnline || !navigator.onLine) {
        offlineQueue.enqueue({ type: 'update_inventory', payload })
        useRealtimeStore.getState().setQueueSnapshot(offlineQueue.peek())
        return { queued: true as const }
      }
      await merchantInventoryService.updateInventory(payload.id, {
        stock: payload.stock,
        low_stock_limit: payload.low_stock_limit,
      })
      return { queued: false as const }
    },
    onMutate: async (payload) => {
      if (!ctx?.restaurantId) return
      const key = restaurantKeys.inventory.all(ctx.restaurantId)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<InventoryWithItem[]>(key)
      queryClient.setQueryData<InventoryWithItem[]>(key, (old) =>
        old?.map((row) =>
          row.id === payload.id
            ? {
                ...row,
                stock: payload.stock,
                low_stock_limit: payload.low_stock_limit ?? row.low_stock_limit,
                status:
                  payload.stock <= 0
                    ? 'OutOfStock'
                    : payload.stock <= (payload.low_stock_limit ?? row.low_stock_limit)
                      ? 'LowStock'
                      : 'InStock',
              }
            : row,
        ),
      )
      return { previous, key }
    },
    onError: (_e, _p, ctxMut) => {
      if (ctxMut?.previous && ctxMut.key) {
        queryClient.setQueryData(ctxMut.key, ctxMut.previous)
      }
      toast.error('Could not update inventory')
    },
    onSuccess: (result) => {
      if (result.queued) {
        toast.message('Inventory queued offline')
        return
      }
      toast.success('Inventory updated')
    },
    onSettled: () => {
      if (!ctx?.restaurantId) return
      void queryClient.invalidateQueries({
        queryKey: restaurantKeys.inventory.all(ctx.restaurantId),
      })
      void queryClient.invalidateQueries({
        queryKey: restaurantKeys.menu.all(ctx.restaurantId),
      })
    },
  })
}
