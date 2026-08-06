import { supabase, type Profile } from '@/lib/supabase'
import type { ProfileUpdatePayload } from '@/features/customer/types'

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, payload: ProfileUpdatePayload): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: payload.fullName,
      phone: payload.phone ?? null,
      avatar_url: payload.avatarUrl ?? null,
    })
    .eq('id', userId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/avatar-${Date.now()}.${extension}`

  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
    upsert: true,
    contentType: file.type,
  })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

export const profileService = {
  getProfile,
  updateProfile,
  uploadAvatar,
}
