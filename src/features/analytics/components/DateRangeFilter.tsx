import { Button, Input } from '@/components/ui'
import type { AnalyticsPreset } from '@/features/analytics/types'
import { cn } from '@/utils'

const PRESETS: { id: AnalyticsPreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: 'this_month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
  { id: 'this_year', label: 'This year' },
  { id: 'custom', label: 'Custom' },
]

interface DateRangeFilterProps {
  preset: AnalyticsPreset
  from: string
  to: string
  onPresetChange: (preset: AnalyticsPreset) => void
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}

export function DateRangeFilter({
  preset,
  from,
  to,
  onPresetChange,
  onFromChange,
  onToChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Date range presets">
        {PRESETS.map((p) => (
          <Button
            key={p.id}
            size="sm"
            variant={preset === p.id ? 'primary' : 'outline'}
            onClick={() => onPresetChange(p.id)}
            className={cn(preset === p.id && 'shadow-none')}
          >
            {p.label}
          </Button>
        ))}
      </div>
      {preset === 'custom' ? (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            className="h-9 w-auto"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            aria-label="From date"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            className="h-9 w-auto"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            aria-label="To date"
          />
        </div>
      ) : null}
    </div>
  )
}
