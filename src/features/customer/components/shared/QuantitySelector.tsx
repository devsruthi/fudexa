import { Minus, Plus } from 'lucide-react'
import { cn } from '@/utils'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
  'aria-label'?: string
}

export function QuantitySelector({
  value,
  onChange,
  min = 0,
  max = 99,
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Quantity',
}: QuantitySelectorProps) {
  const buttonSize = size === 'sm' ? 'size-7' : 'size-8'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-border bg-surface p-0.5',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-[var(--radius-sm)] text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40',
          buttonSize,
        )}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" />
      </button>
      <span className={cn('min-w-6 text-center font-medium text-foreground', textSize)}>{value}</span>
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-[var(--radius-sm)] text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40',
          buttonSize,
        )}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
