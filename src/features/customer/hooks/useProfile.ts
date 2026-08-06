import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerKeys } from '@/features/customer/api'
import { profileService } from '@/features/customer/services'
import type { ProfileUpdatePayload } from '@/features/customer/types'
import { useAuth } from '@/features/auth'

export function useProfile() {
  const { user } = useAuth()

  return useQuery({
    queryKey: customerKeys.profile.me(),
    queryFn: () => profileService.getProfile(user!.id),
    enabled: Boolean(user?.id),
  })
}

export function useUpdateProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => {
      if (!user?.id) throw new Error('Not authenticated')
      return profileService.updateProfile(user.id, payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.profile.all })
      toast.success('Profile updated')
    },
    onError: (error: Error) => {
      toast.error('Update failed', { description: error.message })
    },
  })
}

export function useUploadAvatar() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('Not authenticated')
      const url = await profileService.uploadAvatar(user.id, file)
      await profileService.updateProfile(user.id, {
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: url,
      })
      return url
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.profile.all })
      toast.success('Avatar updated')
    },
    onError: (error: Error) => {
      toast.error('Upload failed', { description: error.message })
    },
  })
}
