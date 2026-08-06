import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui'
import { CartItemRow, EmptyState } from '@/features/customer/components'
import { useCartStore } from '@/store'
import { formatCurrency, restaurantDetailPath } from '@/features/customer/utils'
import { PATHS } from '@/routes/paths'

export function CartPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const restaurantId = useCartStore((s) => s.restaurantId)
  const restaurantName = useCartStore((s) => s.restaurantName)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const totals = useCartStore((s) => s.getTotals())

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add dishes from a restaurant to get started."
        icon={ShoppingBag}
        actionLabel="Browse restaurants"
        onAction={() => navigate(PATHS.customer.restaurants)}
      />
    )
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              Cart
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ordering from{' '}
              {restaurantId ? (
                <Link
                  to={restaurantDetailPath(restaurantId)}
                  className="font-medium text-primary hover:underline"
                >
                  {restaurantName}
                </Link>
              ) : (
                'one restaurant'
              )}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart}>
            Clear cart
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <CartItemRow
              key={item.menuItemId}
              item={item}
              onQuantityChange={(quantity) => setQuantity(item.menuItemId, quantity)}
              onRemove={() => removeItem(item.menuItemId)}
            />
          ))}
        </div>
      </motion.section>

      <aside className="h-fit rounded-[var(--radius-xl)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] lg:sticky lg:top-20">
        <h2 className="font-display text-lg font-semibold text-foreground">Order summary</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium text-foreground">{formatCurrency(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="font-medium text-foreground">{formatCurrency(totals.tax)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd className="font-medium text-foreground">
              {totals.deliveryFee === 0 ? 'Free' : formatCurrency(totals.deliveryFee)}
            </dd>
          </div>
          {totals.discount > 0 ? (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="font-medium text-success">-{formatCurrency(totals.discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3 border-t border-border pt-3 text-base">
            <dt className="font-semibold text-foreground">Total</dt>
            <dd className="font-semibold text-foreground">{formatCurrency(totals.total)}</dd>
          </div>
        </dl>
        <Button className="mt-5 w-full" onClick={() => navigate(PATHS.customer.checkout)}>
          Checkout
        </Button>
      </aside>
    </div>
  )
}
