import { motion } from 'framer-motion'
import { AlertTriangle, Info, Sparkles, TrendingUp } from 'lucide-react'
import type { BusinessInsight } from '@/features/analytics/types'
import { cn } from '@/utils'

const icons = {
  positive: TrendingUp,
  warning: AlertTriangle,
  critical: AlertTriangle,
  info: Info,
}

const tones = {
  positive: 'border-success/30 bg-success/5',
  warning: 'border-warning/30 bg-warning/5',
  critical: 'border-danger/30 bg-danger/5',
  info: 'border-primary/30 bg-primary/5',
}

export function InsightCards({ insights }: { insights: BusinessInsight[] }) {
  if (!insights.length) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Insights will appear as more order data accumulates.
      </div>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {insights.map((insight, i) => {
        const Icon = icons[insight.tone] ?? Sparkles
        return (
          <motion.article
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              'rounded-[var(--radius-xl)] border p-4 shadow-[var(--shadow-sm)]',
              tones[insight.tone],
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <Icon className="size-4 shrink-0 text-foreground" aria-hidden />
              {insight.metric ? (
                <span className="text-xs font-semibold tabular-nums text-foreground">
                  {insight.metric}
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 text-sm font-semibold text-foreground">{insight.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{insight.detail}</p>
          </motion.article>
        )
      })}
    </div>
  )
}
