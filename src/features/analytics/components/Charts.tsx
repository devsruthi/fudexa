import type { ReactNode } from 'react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/utils'

const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid rgb(var(--color-border))',
  background: 'rgb(var(--color-surface))',
  fontSize: 12,
}

const COLORS = [
  'rgb(14 165 233)',
  'rgb(34 197 94)',
  'rgb(245 158 11)',
  'rgb(239 68 68)',
  'rgb(100 116 139)',
  'rgb(56 189 248)',
  'rgb(168 85 247)',
]

function ChartShell({
  title,
  children,
  className,
  action,
}: {
  title: string
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <section
      className={cn(
        'rounded-[var(--radius-xl)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

interface SeriesProps {
  title: string
  data: { label: string; value: number; secondary?: number }[]
  className?: string
  valuePrefix?: string
}

export function AreaTrendChart({ title, data, className, valuePrefix = '' }: SeriesProps) {
  return (
    <ChartShell title={title} className={className}>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="biRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="rgb(var(--color-muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="rgb(var(--color-muted-foreground))" />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => [
              `${valuePrefix}${Number(value).toLocaleString()}`,
              name === 'secondary' ? 'Moving avg' : 'Value',
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="rgb(var(--color-primary))"
            fill="url(#biRevenue)"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="secondary"
            stroke="rgb(var(--color-secondary))"
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 4"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

export function BarMetricChart({ title, data, className }: SeriesProps) {
  return (
    <ChartShell title={title} className={className}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill="rgb(var(--color-primary))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

export function HorizontalBarChart({
  title,
  data,
  className,
}: {
  title: string
  data: { name: string; value: number }[]
  className?: string
}) {
  return (
    <ChartShell title={title} className={className}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill="rgb(var(--color-primary))" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

export function DonutChart({
  title,
  data,
  className,
}: {
  title: string
  data: { name: string; value: number }[]
  className?: string
}) {
  return (
    <ChartShell title={title} className={className}>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

export function ForecastChart({
  title,
  data,
  className,
}: {
  title: string
  data: { label: string; predicted: number; lower: number; upper: number }[]
  className?: string
}) {
  return (
    <ChartShell title={title} className={className}>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="transparent"
            fill="rgb(var(--color-primary))"
            fillOpacity={0.12}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="transparent"
            fill="rgb(var(--color-surface))"
            fillOpacity={1}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="rgb(var(--color-primary))"
            strokeWidth={2}
            dot
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

/** Simple weekday × hour heatmap using CSS grid (no extra deps). */
export function PeakHeatmap({
  title,
  hours,
  className,
}: {
  title: string
  hours: { name: string; value: number }[]
  className?: string
}) {
  const max = Math.max(...hours.map((h) => h.value), 1)
  return (
    <ChartShell title={title} className={className}>
      <div className="grid grid-cols-6 gap-1 sm:grid-cols-8 md:grid-cols-12" role="img" aria-label={title}>
        {hours.map((h) => {
          const intensity = h.value / max
          return (
            <div
              key={h.name}
              title={`${h.name}: ${h.value} orders`}
              className="flex aspect-square flex-col items-center justify-center rounded-md text-[9px] font-medium"
              style={{
                background: `rgb(14 165 233 / ${0.08 + intensity * 0.7})`,
                color: intensity > 0.55 ? 'white' : undefined,
              }}
            >
              <span>{h.name.slice(0, 2)}</span>
              <span>{h.value}</span>
            </div>
          )
        })}
      </div>
    </ChartShell>
  )
}
