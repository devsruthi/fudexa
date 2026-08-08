import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-[var(--shadow-md)] hover:brightness-110 hover:-translate-y-px active:translate-y-0',
  secondary:
    'bg-secondary text-secondary-foreground shadow-[var(--shadow-sm)] hover:brightness-105 hover:-translate-y-px active:translate-y-0',
  ghost: 'bg-transparent text-foreground shadow-none hover:bg-muted/80',
  danger:
    'bg-danger text-danger-foreground shadow-[var(--shadow-sm)] hover:brightness-110',
  outline:
    'border border-border/90 bg-surface/90 text-foreground shadow-[var(--shadow-sm)] hover:border-primary/30 hover:bg-muted/70',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold tracking-tight transition duration-200 disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
