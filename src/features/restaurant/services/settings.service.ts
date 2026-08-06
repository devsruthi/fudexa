import { supabase, type Restaurant } from '@/lib/supabase'

export async function getOwnedRestaurant(ownerId: string): Promise<Restaurant> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('No restaurant found for this account. Complete onboarding first.')
  return data
}

export async function getRestaurantById(restaurantId: string): Promise<Restaurant> {
  const { data, error } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single()
  if (error) throw error
  return data
}

export async function updateRestaurant(
  restaurantId: string,
  payload: Partial<Restaurant>,
): Promise<Restaurant> {
  const { data, error } = await supabase
    .from('restaurants')
    .update(payload)
    .eq('id', restaurantId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function uploadRestaurantImage(
  restaurantId: string,
  bucket: 'restaurant-logos' | 'restaurant-covers' | 'menu-images',
  file: File,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${restaurantId}/${Date.now()}-${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export const restaurantSettingsService = {
  getOwnedRestaurant,
  getRestaurantById,
  updateRestaurant,
  uploadRestaurantImage,
}
