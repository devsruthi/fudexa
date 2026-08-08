import type { ReactNode } from 'react'
import { cn } from '@/utils'

/** Elevated white card for auth forms — matches Fudexa login mockup. */
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
        'relative rounded-[1.75rem] border border-black/[0.04] bg-white px-7 py-8 shadow-[0_24px_60px_-28px_rgb(26_26_26_/_0.28),0_10px_24px_-16px_rgb(26_26_26_/_0.12)] sm:px-9 sm:py-10',
        className,
      )}
    >
      {children}
    </div>
  )
}
