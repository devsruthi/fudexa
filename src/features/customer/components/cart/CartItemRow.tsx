import { Trash2 } from 'lucide-react'
import type { CartLineItem } from '@/features/customer/types'
import { formatCurrency } from '@/features/customer/utils'
import { QuantitySelector } from '../shared/QuantitySelector'
import { cn } from '@/utils'

interface CartItemProps {
  item: CartLineItem
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
  className?: string
}

export function CartItemRow({ item, onQuantityChange, onRemove, className }: CartItemProps) {
  return (
    <div
      className={cn(
        'flex gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-3',
        className,
      )}
    >
      <div className="size-20 shrink-0 overflow-hidden rounded-[var(--radius-lg)] bg-muted">
        {item.image ? (
          <img src={item.image} alt="" className="size-full object-cover" />
        ) : (
          <div className="size-full bg-[linear-gradient(135deg,_rgb(var(--color-primary)/0.2),_rgb(var(--color-muted)))]" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-medium text-foreground">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
          </div>
          <p className="font-semibold text-foreground">
            {formatCurrency(item.price * item.quantity)}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <QuantitySelector value={item.quantity} onChange={onQuantityChange} min={1} size="sm" />
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-xs font-medium text-danger hover:underline"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="size-3.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
