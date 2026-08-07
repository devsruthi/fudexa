import type { LucideIcon } from 'lucide-react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { cn } from '@/utils'

interface KpiCardProps {
  title: string
  value: number | string
  format?: 'currency' | 'number' | 'percent' | 'raw'
  changePct?: number
  subtitle?: string
  icon?: LucideIcon
  tone?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 })
  const display = useTransform(spring, (v) =>
    Math.abs(v) >= 1000 ? v.toFixed(0) : v.toFixed(v % 1 === 0 ? 0 : 1),
  )

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
}

export function KpiCard({
  title,
  value,
  format = 'number',
  changePct,
  subtitle,
  icon: Icon,
  tone = 'default',
  className,
}: KpiCardProps) {
  const numeric = typeof value === 'number' ? value : null
  const display =
    format === 'currency' && numeric != null
      ? `$${numeric.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : format === 'percent' && numeric != null
        ? `${numeric}%`
        : typeof value === 'string'
          ? value
          : numeric?.toLocaleString()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-[var(--radius-xl)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        {Icon ? (
          <span
            className={cn(
              'rounded-[var(--radius-md)] p-1.5',
              tone === 'success' && 'bg-success/15 text-success',
              tone === 'warning' && 'bg-warning/15 text-warning',
              tone === 'danger' && 'bg-danger/15 text-danger',
              tone === 'default' && 'bg-primary/10 text-primary',
            )}
          >
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">
        {format === 'currency' && numeric != null ? (
          <>
            $<AnimatedNumber value={numeric} />
          </>
        ) : format === 'number' && numeric != null ? (
          <AnimatedNumber value={numeric} />
        ) : (
          display
        )}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
        {typeof changePct === 'number' ? (
          <span
            className={cn(
              'font-semibold',
              changePct > 0 ? 'text-success' : changePct < 0 ? 'text-danger' : 'text-muted-foreground',
            )}
          >
            {changePct > 0 ? '+' : ''}
            {changePct}%
          </span>
        ) : null}
        {subtitle ? <span className="text-muted-foreground">{subtitle}</span> : null}
      </div>
    </motion.div>
  )
}
