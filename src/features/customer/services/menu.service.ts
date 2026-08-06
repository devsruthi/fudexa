import { supabase, type Category, type MenuItem } from '@/lib/supabase'
import type { MenuItemWithCategory } from '@/features/customer/types'

type MenuItemRow = MenuItem & { category: Category | Category[] | null }

function normalizeMenuItem(item: MenuItemRow): MenuItemWithCategory {
  const category = Array.isArray(item.category) ? (item.category[0] ?? null) : item.category
  return {
    ...item,
    category,
  }
}

export async function getCategories(restaurantId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getMenu(
  restaurantId: string,
  options: { categoryId?: string | null; search?: string } = {},
): Promise<MenuItemWithCategory[]> {
  let query = supabase
    .from('menu_items')
    .select('*, category:categories(*)')
    .eq('restaurant_id', restaurantId)
    .order('name', { ascending: true })

  if (options.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }

  if (options.search?.trim()) {
    const term = `%${options.search.trim()}%`
    query = query.or(`name.ilike.${term},description.ilike.${term}`)
  }

  const { data, error } = await query
  if (error) throw error

  return ((data ?? []) as unknown as MenuItemRow[]).map(normalizeMenuItem)
}

export async function getFeaturedMenuItems(limit = 8): Promise<MenuItemWithCategory[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, category:categories(*)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return ((data ?? []) as unknown as MenuItemRow[]).map(normalizeMenuItem)
}

export async function getMenuItem(id: string): Promise<MenuItem> {
  const { data, error } = await supabase.from('menu_items').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export const menuService = {
  getCategories,
  getMenu,
  getFeaturedMenuItems,
  getMenuItem,
}
