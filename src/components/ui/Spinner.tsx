import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'

interface SpinnerProps {
  className?: string
  label?: string
}

export function Spinner({ className, label = 'Loading…' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center gap-3 text-muted-foreground', className)}
    >
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  )
}
