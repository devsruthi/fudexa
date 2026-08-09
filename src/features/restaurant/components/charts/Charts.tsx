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

const axisTick = { fontSize: 11, fill: 'rgb(var(--color-muted-foreground))' }
const axisLine = { stroke: 'transparent' }
const tickLine = { stroke: 'transparent' }

function ChartTooltip({
  active,
  payload,
  label,
  valuePrefix = '',
  valueSuffix = '',
  name = 'Value',
}: {
  active?: boolean
  payload?: Array<{ value?: number | string }>
  label?: string
  valuePrefix?: string
  valueSuffix?: string
  name?: string
}) {
  if (!active || !payload?.length) return null
  const raw = payload[0]?.value
  const value = typeof raw === 'number' ? raw : Number(raw ?? 0)
  const formatted =
    valuePrefix === '$' ? `${valuePrefix}${value.toFixed(2)}` : `${valuePrefix}${value}${valueSuffix}`

  return (
    <div className="rounded-xl border border-border/70 bg-surface/95 px-3 py-2 shadow-[var(--shadow-md)] backdrop-blur-md">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">
        {formatted}
        <span className="ml-1.5 text-xs font-normal text-muted-foreground">{name}</span>
      </p>
    </div>
  )
}

interface SeriesChartProps {
  data: ChartPoint[]
  title: string
  className?: string
  color?: string
  valuePrefix?: string
}

function chartTotal(data: ChartPoint[]) {
  return data.reduce((sum, point) => sum + point.value, 0)
}

export function RevenueChart({ data, title, className, valuePrefix = '$' }: SeriesChartProps) {
  const total = chartTotal(data)
  const empty = data.length === 0 || total === 0

  return (
    <ChartShell
      title={title}
      className={className}
      meta={
        empty ? 'No paid revenue yet' : `${valuePrefix}${total.toFixed(0)} total`
      }
    >
      {empty ? (
        <ChartEmpty label="Revenue will appear as completed orders come in." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity={0.28} />
                <stop offset="55%" stopColor="rgb(var(--color-secondary))" stopOpacity={0.1} />
                <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revenueStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgb(var(--color-secondary))" />
                <stop offset="100%" stopColor="rgb(var(--color-primary))" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 8"
              stroke="rgb(var(--color-border))"
              vertical={false}
              strokeOpacity={0.7}
            />
            <XAxis
              dataKey="label"
              tick={axisTick}
              axisLine={axisLine}
              tickLine={tickLine}
              dy={8}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              tick={axisTick}
              axisLine={axisLine}
              tickLine={tickLine}
              width={36}
              tickFormatter={(v) => (vPrefixCompact(v, valuePrefix))}
            />
            <Tooltip
              cursor={{ stroke: 'rgb(var(--color-primary))', strokeOpacity: 0.15, strokeWidth: 24 }}
              content={<ChartTooltip valuePrefix={valuePrefix} name="Revenue" />}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#revenueStroke)"
              fill="url(#revenueFill)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: 'rgb(var(--color-surface))',
                fill: 'rgb(var(--color-primary))',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  )
}

export function OrdersChart({ data, title, className }: SeriesChartProps) {
  const total = chartTotal(data)
  const empty = data.length === 0 || total === 0
  const max = Math.max(...data.map((d) => d.value), 0)

  return (
    <ChartShell
      title={title}
      className={className}
      meta={empty ? 'No orders in range' : `${total} orders`}
    >
      {empty ? (
        <ChartEmpty label="Order volume will show once guests start ordering." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="28%">
            <defs>
              <linearGradient id="ordersBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--color-secondary))" stopOpacity={0.95} />
                <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 8"
              stroke="rgb(var(--color-border))"
              vertical={false}
              strokeOpacity={0.7}
            />
            <XAxis
              dataKey="label"
              tick={axisTick}
              axisLine={axisLine}
              tickLine={tickLine}
              dy={8}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              allowDecimals={false}
              tick={axisTick}
              axisLine={axisLine}
              tickLine={tickLine}
              width={28}
              domain={[0, Math.max(max + 1, 3)]}
            />
            <Tooltip
              cursor={{ fill: 'rgb(var(--color-primary))', fillOpacity: 0.06 }}
              content={<ChartTooltip name="Orders" />}
            />
            <Bar dataKey="value" fill="url(#ordersBar)" radius={[8, 8, 4, 4]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      )}
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
  'rgb(230 57 70)',
  'rgb(255 122 0)',
  'rgb(251 146 60)',
  'rgb(248 113 113)',
  'rgb(190 24 48)',
  'rgb(255 176 80)',
]

export function AnalyticsChart({ title, data, type = 'bar', className }: AnalyticsChartProps) {
  return (
    <ChartShell title={title} className={className}>
      <ResponsiveContainer width="100%" height={240}>
        {type === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={3}
              stroke="rgb(var(--color-surface))"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgb(var(--color-border))' }} />
          </PieChart>
        ) : (
          <BarChart data={data} layout="vertical" margin={{ left: 12, right: 8 }}>
            <CartesianGrid
              strokeDasharray="4 8"
              stroke="rgb(var(--color-border))"
              horizontal={false}
              strokeOpacity={0.7}
            />
            <XAxis type="number" tick={axisTick} axisLine={axisLine} tickLine={tickLine} />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={axisTick}
              axisLine={axisLine}
              tickLine={tickLine}
            />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgb(var(--color-border))' }} />
            <Bar dataKey="value" fill="rgb(var(--color-primary))" radius={[0, 8, 8, 0]} maxBarSize={18} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </ChartShell>
  )
}

function vPrefixCompact(value: number, prefix: string) {
  if (prefix !== '$') return String(value)
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value}`
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex h-[240px] flex-col items-center justify-center rounded-xl bg-muted/30 px-6 text-center">
      <div className="mb-3 h-1 w-16 rounded-full bg-[linear-gradient(90deg,_rgb(var(--color-secondary)),_rgb(var(--color-primary)),_transparent)]" />
      <p className="max-w-xs text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function ChartShell({
  title,
  children,
  className,
  meta,
}: {
  title: string
  children: ReactNode
  className?: string
  meta?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-surface/90 p-5 shadow-[var(--shadow-sm)] backdrop-blur-sm',
        className,
      )}
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {meta ? <p className="text-xs font-medium text-muted-foreground">{meta}</p> : null}
      </div>
      {children}
    </div>
  )
}
