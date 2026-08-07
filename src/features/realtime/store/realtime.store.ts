import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OfflineMutation, RealtimeConnectionStatus } from '@/features/realtime/events'

interface RealtimeUiState {
  status: RealtimeConnectionStatus
  isOnline: boolean
  pendingMutations: number
  lastSyncedAt: number | null
  setStatus: (status: RealtimeConnectionStatus) => void
  setOnline: (online: boolean) => void
  setPendingMutations: (count: number) => void
  setLastSyncedAt: (ts: number | null) => void
  queueSnapshot: OfflineMutation[]
  setQueueSnapshot: (items: OfflineMutation[]) => void
}

export const useRealtimeStore = create<RealtimeUiState>()(
  persist(
    (set) => ({
      status: 'idle',
      isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
      pendingMutations: 0,
      lastSyncedAt: null,
      queueSnapshot: [],
      setStatus: (status) => set({ status }),
      setOnline: (isOnline) => set({ isOnline }),
      setPendingMutations: (pendingMutations) => set({ pendingMutations }),
      setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
      setQueueSnapshot: (queueSnapshot) => set({ queueSnapshot, pendingMutations: queueSnapshot.length }),
    }),
    {
      name: 'orderflow-realtime-ui',
      partialize: (s) => ({ lastSyncedAt: s.lastSyncedAt }),
    },
  ),
)
