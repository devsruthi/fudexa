import { Link } from 'react-router-dom'
import { cn } from '@/utils'

interface PagePlaceholderProps {
  title: string
  description: string
  feature?: string
  className?: string
}

/** Consistent scaffold page used across unfinished feature surfaces. */
export function PagePlaceholder({ title, description, feature, className }: PagePlaceholderProps) {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-8 shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      {feature ? (
        <span className="text-xs font-medium uppercase tracking-wider text-primary">{feature}</span>
      ) : null}
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{description}</p>
    </section>
  )
}

interface EmptyStateLinkProps {
  to: string
  label: string
}

export function EmptyStateLink({ to, label }: EmptyStateLinkProps) {
  return (
    <Link to={to} className="text-sm font-medium text-primary hover:underline">
      {label}
    </Link>
  )
}
