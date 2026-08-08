import type { ReactNode } from 'react'
import { cn } from '@/utils'

/** Soft gradient atmosphere behind auth forms (sign-in / sign-up). */
export function AuthFormPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-xl)] px-5 py-7 sm:px-8 sm:py-9',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,_rgb(var(--color-primary)/0.12)_0%,_rgb(var(--color-surface)/0.92)_38%,_rgb(var(--color-secondary)/0.1)_100%),radial-gradient(ellipse_at_top_right,_rgb(var(--color-primary)/0.16),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgb(var(--color-secondary)/0.14),_transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-secondary/15 blur-3xl"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
