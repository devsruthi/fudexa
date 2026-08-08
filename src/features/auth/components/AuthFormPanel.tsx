import type { ReactNode } from 'react'
import { cn } from '@/utils'

/** Clean elevated card for auth forms. */
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
        'relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-white px-6 py-8 shadow-[0_20px_50px_-20px_rgb(230_57_70_/_0.22),0_8px_20px_-8px_rgb(26_26_26_/_0.08)] sm:px-8 sm:py-9',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-brand-gradient"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
