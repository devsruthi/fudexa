import { useEffect, type ReactNode } from 'react'
import { toast } from 'sonner'
import { offlineQueue, reconnectRealtime } from '@/features/realtime/services'
import { useRealtimeStore } from '@/features/realtime/store/realtime.store'
import { useRealtimeConnection } from '@/features/realtime/hooks/useRealtimeConnection'
import { ConnectionBanner } from '@/features/realtime/components/ConnectionBanner'
import { merchantOrderService } from '@/features/restaurant/services/order.service'
import { merchantInventoryService } from '@/features/restaurant/services'
import { notificationService } from '@/features/realtime/services'
import { merchantReviewService } from '@/features/restaurant/services/review.service'
import type { OrderStatus } from '@/features/restaurant/types'

function registerOfflineHandlers() {
  offlineQueue.register('update_order_status', async (m) => {
    const p = m.payload as {
      orderId: string
      restaurantId: string
      status: OrderStatus
      expectedUpdatedAt?: string
      expectedVersion?: number
    }
    await merchantOrderService.updateOrderStatus(
      p.orderId,
      p.restaurantId,
      p.status,
      { expectedUpdatedAt: p.expectedUpdatedAt, expectedVersion: p.expectedVersion },
    )
  })

  offlineQueue.register('update_inventory', async (m) => {
    const p = m.payload as { id: string; stock: number; low_stock_limit?: number }
    await merchantInventoryService.updateInventory(p.id, {
      stock: p.stock,
      low_stock_limit: p.low_stock_limit,
    })
  })

  offlineQueue.register('mark_notification_read', async (m) => {
    await notificationService.markNotificationRead(String(m.payload.id))
  })

  offlineQueue.register('reply_review', async (m) => {
    const p = m.payload as { reviewId: string; reply: string }
    await merchantReviewService.replyToReview(p.reviewId, p.reply)
  })
}

registerOfflineHandlers()

interface RealtimeProviderProps {
  children: ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { status, isOnline } = useRealtimeConnection()

  useEffect(() => {
    const onOnline = () => {
      useRealtimeStore.getState().setOnline(true)
      toast.success('Connection restored', { description: 'Syncing pending changes…' })
      void reconnectRealtime()
      void offlineQueue.flush().then((result) => {
        useRealtimeStore.getState().setQueueSnapshot(offlineQueue.peek())
        useRealtimeStore.getState().setLastSyncedAt(Date.now())
        if (result.ok > 0) {
          toast.success(`Synced ${result.ok} queued change${result.ok === 1 ? '' : 's'}`)
        }
      })
    }
    const onOffline = () => {
      useRealtimeStore.getState().setOnline(false)
      toast.error('Network disconnected', {
        description: 'Changes will queue and sync when you are back online.',
      })
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    useRealtimeStore.getState().setOnline(navigator.onLine)
    useRealtimeStore.getState().setQueueSnapshot(offlineQueue.peek())

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    useRealtimeStore.getState().setStatus(status)
  }, [status])

  return (
    <>
      <ConnectionBanner isOnline={isOnline} status={status} />
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isOnline
          ? status === 'connected'
            ? 'Realtime connected'
            : `Realtime ${status}`
          : 'You are offline'}
      </div>
    </>
  )
}
