import { WifiOff, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RealtimeConnectionStatus } from '@/features/realtime/events'
import { reconnectRealtime } from '@/features/realtime/services'
import { useRealtimeStore } from '@/features/realtime/store/realtime.store'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

interface ConnectionBannerProps {
  isOnline: boolean
  status: RealtimeConnectionStatus
}

export function ConnectionBanner({ isOnline, status }: ConnectionBannerProps) {
  const pending = useRealtimeStore((s) => s.pendingMutations)
  const showOffline = !isOnline
  const showReconnecting = isOnline && (status === 'reconnecting' || status === 'disconnected')

  return (
    <AnimatePresence>
      {showOffline || showReconnecting ? (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          role="status"
          className={cn(
            'sticky top-0 z-[60] flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium',
            showOffline
              ? 'bg-danger text-danger-foreground'
              : 'bg-warning text-warning-foreground',
          )}
        >
          <WifiOff className="size-4 shrink-0" aria-hidden />
          <span>
            {showOffline
              ? `You are offline${pending ? ` · ${pending} change${pending === 1 ? '' : 's'} queued` : ''}`
              : 'Realtime reconnecting…'}
          </span>
          {!showOffline ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 border-current bg-transparent text-inherit hover:bg-black/10"
              onClick={() => void reconnectRealtime()}
            >
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
