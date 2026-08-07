import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type {
  ChannelSubscriptionConfig,
  ManagedChannel,
  PostgresChangeHandler,
  RealtimeConnectionStatus,
} from '@/features/realtime/events'

type StatusListener = (status: RealtimeConnectionStatus) => void

/**
 * Centralized Supabase Realtime channel registry.
 * Deduplicates subscriptions by key, ref-counts consumers, and tracks connection health.
 */
class RealtimeService {
  private channels = new Map<string, ManagedChannel>()
  private status: RealtimeConnectionStatus = 'idle'
  private statusListeners = new Set<StatusListener>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  /** Channels we are intentionally tearing down — ignore their CLOSED callbacks. */
  private intentionalClose = new Set<string>()

  getStatus(): RealtimeConnectionStatus {
    return this.status
  }

  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener)
    listener(this.status)
    return () => {
      this.statusListeners.delete(listener)
    }
  }

  private setStatus(next: RealtimeConnectionStatus) {
    if (this.status === next) return
    this.status = next
    for (const listener of this.statusListeners) listener(next)
  }

  private removeChannelQuietly(key: string, channel: RealtimeChannel) {
    this.intentionalClose.add(key)
    void supabase.removeChannel(channel).finally(() => {
      this.intentionalClose.delete(key)
    })
  }

  subscribe(
    config: ChannelSubscriptionConfig,
    handler: PostgresChangeHandler,
  ): () => void {
    const existing = this.channels.get(config.key)
    if (existing) {
      existing.handlers.add(handler)
      existing.refs += 1
      return () => this.unsubscribe(config.key, handler)
    }

    this.setStatus(this.channels.size === 0 ? 'connecting' : this.status)

    const channel = supabase
      .channel(config.key)
      .on(
        'postgres_changes',
        {
          event: config.event ?? '*',
          schema: config.schema ?? 'public',
          table: config.table,
          filter: config.filter,
        },
        (payload) => {
          const managed = this.channels.get(config.key)
          if (!managed) return
          for (const h of managed.handlers) {
            try {
              h(payload as Parameters<PostgresChangeHandler>[0])
            } catch (err) {
              console.error('[realtime] handler error', config.key, err)
            }
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.setStatus('connected')
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.setStatus('disconnected')
          this.scheduleReconnect()
        } else if (status === 'CLOSED') {
          // Ignore closes from our own unsubscribe / reconnect teardown
          if (this.intentionalClose.has(config.key)) return
          if (this.channels.has(config.key)) {
            this.setStatus('disconnected')
            this.scheduleReconnect()
          } else if (this.channels.size === 0) {
            this.setStatus('idle')
          }
        }
      })

    const managed: ManagedChannel = {
      key: config.key,
      channel,
      refs: 1,
      handlers: new Set([handler]),
      config,
    }
    this.channels.set(config.key, managed)

    return () => this.unsubscribe(config.key, handler)
  }

  private unsubscribe(key: string, handler: PostgresChangeHandler) {
    const managed = this.channels.get(key)
    if (!managed) return
    managed.handlers.delete(handler)
    managed.refs -= 1
    if (managed.refs <= 0 || managed.handlers.size === 0) {
      this.channels.delete(key)
      this.removeChannelQuietly(key, managed.channel)
      if (this.channels.size === 0) {
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer)
          this.reconnectTimer = null
        }
        this.setStatus('idle')
      }
    }
  }

  /** Force-resubscribe all active channels (e.g. after long offline). */
  async reconnect(): Promise<void> {
    this.setStatus('reconnecting')
    const snapshot = [...this.channels.values()]
    for (const managed of snapshot) {
      this.channels.delete(managed.key)
      this.removeChannelQuietly(managed.key, managed.channel)
      const handlers = [...managed.handlers]
      for (const handler of handlers) {
        this.subscribe(managed.config, handler)
      }
    }
    if (this.channels.size === 0) this.setStatus('idle')
  }

  unsubscribeAll(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    for (const managed of this.channels.values()) {
      this.removeChannelQuietly(managed.key, managed.channel)
    }
    this.channels.clear()
    this.setStatus('idle')
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (typeof navigator !== 'undefined' && !navigator.onLine) return
      if (this.channels.size === 0) return
      void this.reconnect()
    }, 2500)
  }

  /** Debug helper */
  listChannels(): string[] {
    return [...this.channels.keys()]
  }

  getChannel(key: string): RealtimeChannel | undefined {
    return this.channels.get(key)?.channel
  }
}

export const realtimeService = new RealtimeService()

export const subscribeToOrders = (
  filter: string | undefined,
  handler: PostgresChangeHandler,
  keySuffix = 'all',
) =>
  realtimeService.subscribe(
    {
      key: `rt-orders-${keySuffix}`,
      table: 'orders',
      event: '*',
      filter,
    },
    handler,
  )

export const subscribeToInventory = (
  restaurantId: string,
  handler: PostgresChangeHandler,
) =>
  realtimeService.subscribe(
    {
      key: `rt-inventory-${restaurantId}`,
      table: 'inventory',
      event: '*',
      filter: `restaurant_id=eq.${restaurantId}`,
    },
    handler,
  )

export const subscribeToNotifications = (
  userId: string,
  handler: PostgresChangeHandler,
) =>
  realtimeService.subscribe(
    {
      key: `rt-notifications-${userId}`,
      table: 'notifications',
      event: '*',
      filter: `user_id=eq.${userId}`,
    },
    handler,
  )

export const subscribeToReviews = (
  restaurantId: string,
  handler: PostgresChangeHandler,
) =>
  realtimeService.subscribe(
    {
      key: `rt-reviews-${restaurantId}`,
      table: 'reviews',
      event: '*',
      filter: `restaurant_id=eq.${restaurantId}`,
    },
    handler,
  )

export const subscribeToRestaurant = (
  restaurantId: string,
  handler: PostgresChangeHandler,
) =>
  realtimeService.subscribe(
    {
      key: `rt-restaurant-${restaurantId}`,
      table: 'restaurants',
      event: 'UPDATE',
      filter: `id=eq.${restaurantId}`,
    },
    handler,
  )

export const unsubscribeAll = () => realtimeService.unsubscribeAll()
export const reconnectRealtime = () => realtimeService.reconnect()
