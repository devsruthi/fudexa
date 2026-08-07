import type { ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartPoint } from '@/features/restaurant/types'
import { cn } from '@/utils'

const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid rgb(var(--color-border))',
  background: 'rgb(var(--color-surface))',
  fontSize: 12,
}

interface SeriesChartProps {
  data: ChartPoint[]
  title: string
  className?: string
  color?: string
  valuePrefix?: string
}

export function RevenueChart({ data, title, className, valuePrefix = '$' }: SeriesChartProps) {
  return (
    <ChartShell title={title} className={className}>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="rgb(var(--color-muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="rgb(var(--color-muted-foreground))" />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [`${valuePrefix}${Number(value).toFixed(2)}`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="rgb(var(--color-primary))"
            fill="url(#revenueFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

export function OrdersChart({ data, title, className }: SeriesChartProps) {
  return (
    <ChartShell title={title} className={className}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="rgb(var(--color-muted-foreground))" />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="rgb(var(--color-muted-foreground))" />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill="rgb(var(--color-primary))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

interface AnalyticsChartProps {
  title: string
  data: { name: string; value: number }[]
  type?: 'bar' | 'pie'
  className?: string
}

const PIE_COLORS = [
  'rgb(6 95 70)',
  'rgb(180 139 74)',
  'rgb(22 163 74)',
  'rgb(217 119 6)',
  'rgb(87 83 78)',
  'rgb(52 211 153)',
]

export function AnalyticsChart({ title, data, type = 'bar', className }: AnalyticsChartProps) {
  return (
    <ChartShell title={title} className={className}>
      <ResponsiveContainer width="100%" height={260}>
        {type === 'pie' ? (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        ) : (
          <BarChart data={data} layout="vertical" margin={{ left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="rgb(var(--color-primary))" radius={[0, 6, 6, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </ChartShell>
  )
}

function ChartShell({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  )
}
