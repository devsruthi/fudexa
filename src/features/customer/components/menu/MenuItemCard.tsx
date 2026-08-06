import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui'
import type { MenuItemWithCategory } from '@/features/customer/types'
import { formatCurrency, formatMinutes } from '@/features/customer/utils'
import { QuantitySelector } from '../shared/QuantitySelector'
import { cn } from '@/utils'

interface MenuItemCardProps {
  item: MenuItemWithCategory
  restaurantId: string
  restaurantName: string
  onAdd: (quantity: number) => void
  disabled?: boolean
  className?: string
}

export function MenuItemCard({
  item,
  onAdd,
  disabled,
  className,
}: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1)
  const unavailable = !item.is_available || disabled

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-3 shadow-[var(--shadow-sm)]',
        unavailable && 'opacity-70',
        className,
      )}
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-[var(--radius-lg)] bg-muted sm:size-28">
        {item.image ? (
          <img src={item.image} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <UtensilsCrossed className="size-8 text-muted-foreground" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-medium text-foreground">{item.name}</h3>
            {item.category?.name ? (
              <p className="text-xs text-muted-foreground">{item.category.name}</p>
            ) : null}
          </div>
          <p className="shrink-0 font-semibold text-foreground">{formatCurrency(Number(item.price))}</p>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.description || 'Prepared fresh when you order.'}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {formatMinutes(item.preparation_time)}
            </span>
            {item.calories ? <span>{item.calories} cal</span> : null}
            {!item.is_available ? (
              <span className="font-medium text-danger">Unavailable</span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <QuantitySelector value={quantity} onChange={setQuantity} min={1} size="sm" />
            <Button
              size="sm"
              disabled={unavailable}
              onClick={() => onAdd(quantity)}
              aria-label={`Add ${item.name} to cart`}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
