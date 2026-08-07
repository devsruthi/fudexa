import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export type RealtimeConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'

export type RealtimeTable =
  | 'orders'
  | 'order_items'
  | 'inventory'
  | 'notifications'
  | 'reviews'
  | 'restaurants'

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

export interface ChannelSubscriptionConfig {
  /** Stable unique key — duplicate keys share one channel (ref-counted). */
  key: string
  table: RealtimeTable
  event?: RealtimeEvent
  filter?: string
  schema?: string
}

export type PostgresChangeHandler<T extends Record<string, unknown> = Record<string, unknown>> = (
  payload: RealtimePostgresChangesPayload<T>,
) => void

export interface ManagedChannel {
  key: string
  channel: RealtimeChannel
  refs: number
  handlers: Set<PostgresChangeHandler>
  config: ChannelSubscriptionConfig
}

export interface OfflineMutation {
  id: string
  createdAt: number
  type: 'update_order_status' | 'update_inventory' | 'mark_notification_read' | 'reply_review'
  payload: Record<string, unknown>
  retries: number
}

export interface RealtimeToastHints {
  newOrder?: boolean
  orderCancelled?: boolean
  lowInventory?: boolean
  newReview?: boolean
}
