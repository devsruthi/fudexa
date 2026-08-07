import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { channelKeys } from '@/features/realtime/channels'
import { realtimeService } from '@/features/realtime/services'
import { notificationKeys } from '@/features/realtime/api/query-keys'

export function useRealtimeNotifications(userId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return

    return realtimeService.subscribe(
      {
        key: channelKeys.notifications(userId),
        table: 'notifications',
        event: '*',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        void queryClient.invalidateQueries({ queryKey: notificationKeys.all(userId) })

        if (payload.eventType === 'INSERT') {
          const row = payload.new as { title?: string; message?: string; type?: string }
          toast.info(row.title ?? 'New notification', {
            description: row.message,
          })
        }
      },
    )
  }, [userId, queryClient])
}
