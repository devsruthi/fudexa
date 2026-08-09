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
  default: 'bg-primary/8 text-primary',
  warning: 'bg-warning/12 text-warning',
  success: 'bg-success/12 text-success',
  danger: 'bg-danger/12 text-danger',
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
      transition={{ duration: 0.28 }}
      className={cn(
        'rounded-2xl border border-border/60 bg-surface/90 p-5 shadow-[var(--shadow-sm)] backdrop-blur-sm transition duration-200 hover:border-primary/20',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 truncate font-display text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums text-foreground">
            {value}
          </p>
          {subtitle ? <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className={cn('rounded-xl p-2.5', toneMap[tone])}>
          <Icon className="size-4" aria-hidden />
        </div>
      </div>
    </motion.div>
  )
}
