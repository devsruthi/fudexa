import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/utils'

interface DashboardCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  tone?: 'default' | 'warning' | 'success' | 'danger'
  className?: string
}

const toneMap = {
  default: 'bg-primary/10 text-primary',
  warning: 'bg-warning/15 text-warning',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
}

export function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = 'default',
  className,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'rounded-[var(--radius-xl)] border border-border/80 bg-surface/95 p-4 shadow-[var(--shadow-sm)] transition hover:border-primary/25 hover:shadow-[var(--shadow-md)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">{value}</p>
          {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className={cn('rounded-[var(--radius-lg)] p-2.5', toneMap[tone])}>
          <Icon className="size-5" aria-hidden />
        </div>
      </div>
    </motion.div>
  )
}
