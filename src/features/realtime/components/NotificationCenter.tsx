import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CheckCheck, Trash2, X } from 'lucide-react'
import {
  useNotificationMutations,
  useNotifications,
} from '@/features/realtime/hooks/useNotifications'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { list, unreadCount } = useNotifications()
  const { markRead, markAllRead, remove } = useNotificationMutations()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
    }
  }, [open])

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className="relative"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 inline-flex size-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-danger-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label="Notification center"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <p className="text-sm font-semibold">Notifications</p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  aria-label="Mark all read"
                  disabled={!unreadCount}
                  onClick={() => markAllRead.mutate()}
                >
                  <CheckCheck className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <ul className="max-h-80 overflow-y-auto" aria-live="polite">
              {(list.data ?? []).length === 0 ? (
                <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No notifications yet
                </li>
              ) : (
                (list.data ?? []).map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      'border-b border-border px-3 py-3 last:border-0',
                      !n.is_read && 'bg-primary/5',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => {
                          if (!n.is_read) markRead.mutate(n.id)
                        }}
                      >
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 shrink-0 px-0"
                        aria-label="Delete notification"
                        onClick={() => remove.mutate(n.id)}
                      >
                        <Trash2 className="size-3.5 text-danger" />
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
