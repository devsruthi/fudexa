import { cn } from '@/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-[var(--radius-md)] bg-muted', className)}
      aria-hidden
    />
  )
}

export function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}

export function MenuItemSkeleton() {
  return (
    <div className="flex gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-3">
      <Skeleton className="size-24 shrink-0 rounded-[var(--radius-lg)]" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-auto h-8 w-24" />
      </div>
    </div>
  )
}
