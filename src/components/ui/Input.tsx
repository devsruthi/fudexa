import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-11 w-full rounded-[var(--radius-md)] border bg-surface/90 px-3.5 text-sm text-foreground shadow-[var(--shadow-sm)] outline-none transition duration-200 placeholder:text-muted-foreground/80',
          'hover:border-primary/25 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError ? 'border-danger focus-visible:ring-danger/30' : 'border-border',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
