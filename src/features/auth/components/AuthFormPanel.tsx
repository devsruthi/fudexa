import type { ReactNode } from 'react'
import { cn } from '@/utils'

/** Elevated auth card — light glass / dark surface aware. */
export function AuthFormPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[linear-gradient(135deg,_rgb(255_122_0_/_0.35),_rgb(230_57_70_/_0.22),_rgb(255_176_80_/_0.28))] opacity-80 blur-xl dark:bg-[linear-gradient(135deg,_rgb(255_122_0_/_0.28),_rgb(230_57_70_/_0.2),_rgb(251_146_60_/_0.18))] dark:opacity-70"
      />
      <div
        className={cn(
          'relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface/95 px-7 py-8 text-foreground shadow-[0_28px_64px_-28px_rgb(230_57_70_/_0.28),0_14px_32px_-18px_rgb(26_26_26_/_0.14)] backdrop-blur-md sm:px-9 sm:py-10',
          'dark:border-border dark:bg-surface/95 dark:shadow-[0_28px_64px_-28px_rgb(0_0_0_/_0.65),0_0_0_1px_rgb(248_113_113_/_0.08)]',
          className,
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_#FF8A1F_0%,_#E63946_55%,_#FFB347_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 size-40 rounded-full bg-[radial-gradient(circle,_rgb(255_122_0_/_0.12),_transparent_70%)] dark:bg-[radial-gradient(circle,_rgb(255_122_0_/_0.18),_transparent_70%)]"
        />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  )
}
