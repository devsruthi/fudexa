import { supabase } from '@/lib/supabase'
import type { InventoryMovement, InventoryWithItem } from '@/features/restaurant/types'

export async function getInventory(restaurantId: string): Promise<InventoryWithItem[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, menu_item:menu_items(id, name, image, price, is_available)')
    .eq('restaurant_id', restaurantId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as InventoryWithItem[]
}

export async function updateInventory(
  inventoryId: string,
  payload: { stock?: number; low_stock_limit?: number },
): Promise<void> {
  const { error } = await supabase.from('inventory').update(payload).eq('id', inventoryId)
  if (error) throw error
}

export async function bulkUpdateInventory(
  updates: { id: string; stock: number; low_stock_limit?: number }[],
): Promise<void> {
  for (const update of updates) {
    await updateInventory(update.id, {
      stock: update.stock,
      low_stock_limit: update.low_stock_limit,
    })
  }
}

export async function getInventoryMovements(
  restaurantId: string,
  limit = 50,
): Promise<InventoryMovement[]> {
  const { data, error } = await supabase
    .from('inventory_movements')
    .select('*, menu_item:menu_items(id, name)')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as unknown as InventoryMovement[]
}

export const merchantInventoryService = {
  getInventory,
  updateInventory,
  bulkUpdateInventory,
  getInventoryMovements,
}
