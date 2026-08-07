import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth'
import { notificationKeys } from '@/features/realtime/api/query-keys'
import { notificationService } from '@/features/realtime/services'
import { useRealtimeNotifications } from './useRealtimeNotifications'

export function useNotifications() {
  const { user } = useAuth()
  useRealtimeNotifications(user?.id)

  const list = useQuery({
    queryKey: notificationKeys.list(user?.id ?? ''),
    queryFn: () => notificationService.getNotifications(user!.id),
    enabled: Boolean(user?.id),
    refetchInterval: 60_000,
  })

  const unread = useQuery({
    queryKey: notificationKeys.unread(user?.id ?? ''),
    queryFn: () => notificationService.getUnreadCount(user!.id),
    enabled: Boolean(user?.id),
    refetchInterval: 30_000,
  })

  return { list, unreadCount: unread.data ?? 0, unread }
}

export function useNotificationMutations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const invalidate = () => {
    if (!user?.id) return
    void queryClient.invalidateQueries({ queryKey: notificationKeys.all(user.id) })
  }

  const markRead = useMutation({
    mutationFn: (id: string) => notificationService.markNotificationRead(id),
    onMutate: async (id) => {
      if (!user?.id) return
      await queryClient.cancelQueries({ queryKey: notificationKeys.list(user.id) })
      const prev = queryClient.getQueryData(notificationKeys.list(user.id))
      queryClient.setQueryData(notificationKeys.list(user.id), (old: unknown) => {
        if (!Array.isArray(old)) return old
        return old.map((n: { id: string; is_read: boolean }) =>
          n.id === id ? { ...n, is_read: true } : n,
        )
      })
      return { prev }
    },
    onError: (_e, _id, ctx) => {
      if (user?.id && ctx?.prev) {
        queryClient.setQueryData(notificationKeys.list(user.id), ctx.prev)
      }
    },
    onSettled: invalidate,
  })

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllNotificationsRead(user!.id),
    onSuccess: () => {
      invalidate()
      toast.success('All notifications marked read')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const remove = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onMutate: async (id) => {
      if (!user?.id) return
      await queryClient.cancelQueries({ queryKey: notificationKeys.list(user.id) })
      const prev = queryClient.getQueryData(notificationKeys.list(user.id))
      queryClient.setQueryData(notificationKeys.list(user.id), (old: unknown) => {
        if (!Array.isArray(old)) return old
        return old.filter((n: { id: string }) => n.id !== id)
      })
      return { prev }
    },
    onError: (_e, _id, ctx) => {
      if (user?.id && ctx?.prev) {
        queryClient.setQueryData(notificationKeys.list(user.id), ctx.prev)
      }
      toast.error('Could not delete notification')
    },
    onSettled: invalidate,
  })

  return { markRead, markAllRead, remove }
}
