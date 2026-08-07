import type { OfflineMutation } from '@/features/realtime/events'

const STORAGE_KEY = 'orderflow-offline-queue'

type FlushHandler = (mutation: OfflineMutation) => Promise<void>

class OfflineQueueService {
  private handlers = new Map<OfflineMutation['type'], FlushHandler>()

  register(type: OfflineMutation['type'], handler: FlushHandler) {
    this.handlers.set(type, handler)
  }

  private read(): OfflineMutation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      return JSON.parse(raw) as OfflineMutation[]
    } catch {
      return []
    }
  }

  private write(items: OfflineMutation[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }

  enqueue(mutation: Omit<OfflineMutation, 'id' | 'createdAt' | 'retries'>) {
    const items = this.read()
    items.push({
      ...mutation,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      retries: 0,
    })
    this.write(items)
    return items.length
  }

  size(): number {
    return this.read().length
  }

  peek(): OfflineMutation[] {
    return this.read()
  }

  async flush(): Promise<{ ok: number; failed: number }> {
    const items = this.read()
    if (!items.length) return { ok: 0, failed: 0 }

    const remaining: OfflineMutation[] = []
    let ok = 0
    let failed = 0

    for (const item of items) {
      const handler = this.handlers.get(item.type)
      if (!handler) {
        remaining.push(item)
        failed += 1
        continue
      }
      try {
        await handler(item)
        ok += 1
      } catch {
        remaining.push({ ...item, retries: item.retries + 1 })
        failed += 1
      }
    }

    this.write(remaining.filter((m) => m.retries < 5))
    return { ok, failed }
  }

  clear() {
    this.write([])
  }
}

export const offlineQueue = new OfflineQueueService()
