import { supabase, type Category, type MenuItem } from '@/lib/supabase'
import type { MenuItemWithRelations } from '@/features/restaurant/types'

export async function getCategories(restaurantId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createCategory(
  restaurantId: string,
  payload: { name: string; display_order?: number },
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      restaurant_id: restaurantId,
      name: payload.name,
      display_order: payload.display_order ?? 0,
      is_active: true,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateCategory(
  categoryId: string,
  payload: Partial<Pick<Category, 'name' | 'display_order' | 'is_active'>>,
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', categoryId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', categoryId)
  if (error) throw error
}

export async function reorderCategories(
  updates: { id: string; display_order: number }[],
): Promise<void> {
  for (const update of updates) {
    const { error } = await supabase
      .from('categories')
      .update({ display_order: update.display_order })
      .eq('id', update.id)
    if (error) throw error
  }
}

export async function getMenu(
  restaurantId: string,
  filters: { search?: string; categoryId?: string | null; availableOnly?: boolean } = {},
): Promise<MenuItemWithRelations[]> {
  let query = supabase
    .from('menu_items')
    .select('*, category:categories(*), inventory(*)')
    .eq('restaurant_id', restaurantId)
    .order('name', { ascending: true })

  if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters.availableOnly) query = query.eq('is_available', true)
  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`
    query = query.or(`name.ilike.${term},description.ilike.${term}`)
  }

  const { data, error } = await query
  if (error) throw error

  return ((data ?? []) as unknown as MenuItemWithRelations[]).map((item) => ({
    ...item,
    category: Array.isArray(item.category) ? item.category[0] : item.category,
    inventory: Array.isArray(item.inventory) ? item.inventory[0] : item.inventory,
  }))
}

export async function getMenuItem(itemId: string): Promise<MenuItemWithRelations> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, category:categories(*), inventory(*)')
    .eq('id', itemId)
    .single()
  if (error) throw error
  const item = data as unknown as MenuItemWithRelations
  return {
    ...item,
    category: Array.isArray(item.category) ? item.category[0] : item.category,
    inventory: Array.isArray(item.inventory) ? item.inventory[0] : item.inventory,
  }
}

export type MenuItemInput = {
  name: string
  description?: string | null
  category_id: string
  price: number
  preparation_time?: number | null
  calories?: number | null
  is_available?: boolean
  is_featured?: boolean
  tags?: string[]
  image?: string | null
  stock?: number
  low_stock_limit?: number
}

export async function createMenuItem(
  restaurantId: string,
  payload: MenuItemInput,
): Promise<MenuItem> {
  const { stock, low_stock_limit, ...item } = payload
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      restaurant_id: restaurantId,
      ...item,
      is_available: item.is_available ?? true,
      is_featured: item.is_featured ?? false,
      tags: item.tags ?? [],
    })
    .select('*')
    .single()
  if (error) throw error

  if (typeof stock === 'number') {
    await supabase
      .from('inventory')
      .update({
        stock,
        low_stock_limit: low_stock_limit ?? 5,
      })
      .eq('menu_item_id', data.id)
  }

  return data
}

export async function updateMenuItem(itemId: string, payload: Partial<MenuItemInput>): Promise<MenuItem> {
  const { stock, low_stock_limit, ...item } = payload
  const { data, error } = await supabase
    .from('menu_items')
    .update(item)
    .eq('id', itemId)
    .select('*')
    .single()
  if (error) throw error

  if (typeof stock === 'number' || typeof low_stock_limit === 'number') {
    const patch: { stock?: number; low_stock_limit?: number } = {}
    if (typeof stock === 'number') patch.stock = stock
    if (typeof low_stock_limit === 'number') patch.low_stock_limit = low_stock_limit
    await supabase.from('inventory').update(patch).eq('menu_item_id', itemId)
  }

  return data
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', itemId)
  if (error) throw error
}

export async function duplicateMenuItem(itemId: string): Promise<MenuItem> {
  const original = await getMenuItem(itemId)
  return createMenuItem(original.restaurant_id, {
    name: `${original.name} (Copy)`,
    description: original.description,
    category_id: original.category_id,
    price: Number(original.price),
    preparation_time: original.preparation_time,
    calories: original.calories,
    is_available: false,
    is_featured: Boolean(original.is_featured),
    tags: original.tags ?? [],
    image: original.image,
    stock: original.inventory?.stock ?? 0,
    low_stock_limit: original.inventory?.low_stock_limit ?? 5,
  })
}

export async function archiveMenuItem(itemId: string): Promise<MenuItem> {
  return updateMenuItem(itemId, { is_available: false })
}

export const merchantMenuService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getMenu,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  duplicateMenuItem,
  archiveMenuItem,
}
