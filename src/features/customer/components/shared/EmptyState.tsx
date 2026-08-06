import { type ReactNode } from 'react'
import { Inbox, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border border-dashed border-border bg-surface px-6 py-16 text-center',
        className,
      )}
    >
      <div className="rounded-full bg-muted p-3 text-muted-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
  children?: ReactNode
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn’t load this content. Please try again.',
  onRetry,
  className,
  children,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border border-danger/30 bg-danger/5 px-6 py-12 text-center',
        className,
      )}
      role="alert"
    >
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {children}
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}
