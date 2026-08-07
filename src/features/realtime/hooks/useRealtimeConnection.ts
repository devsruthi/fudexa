import { useEffect, useSyncExternalStore } from 'react'
import { realtimeService } from '@/features/realtime/services'
import type { RealtimeConnectionStatus } from '@/features/realtime/events'
import { useRealtimeStore } from '@/features/realtime/store/realtime.store'

export function useRealtimeConnection() {
  const status = useSyncExternalStore(
    (onStoreChange) => realtimeService.onStatusChange(() => onStoreChange()),
    () => realtimeService.getStatus(),
    () => 'idle' as RealtimeConnectionStatus,
  )
  const isOnline = useRealtimeStore((s) => s.isOnline)
  const pendingMutations = useRealtimeStore((s) => s.pendingMutations)

  useEffect(() => {
    useRealtimeStore.getState().setStatus(status)
  }, [status])

  return {
    status,
    isOnline,
    pendingMutations,
    isConnected: status === 'connected',
    isReconnecting: status === 'reconnecting' || status === 'connecting',
  }
}
