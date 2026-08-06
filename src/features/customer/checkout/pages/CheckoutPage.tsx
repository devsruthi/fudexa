import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Button, FormField, Input } from '@/components/ui'
import { EmptyState } from '@/features/customer/components'
import { useCreateOrder, useProfile } from '@/features/customer/hooks'
import { useAddressStore, useCartStore } from '@/store'
import { useAuth } from '@/features/auth'
import { formatCurrency, orderDetailPath } from '@/features/customer/utils'
import { checkoutSchema, type CheckoutSchema } from '@/features/customer/utils/schemas'
import { PATHS } from '@/routes/paths'
import { cn } from '@/utils'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const items = useCartStore((s) => s.items)
  const restaurantId = useCartStore((s) => s.restaurantId)
  const clearCart = useCartStore((s) => s.clearCart)
  const totals = useCartStore((s) => s.getTotals())
  const createOrder = useCreateOrder()
  const profile = useProfile()
  const addresses = useAddressStore((s) => (user ? s.getAddresses(user.id) : []))

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: '',
      phone: '',
      notes: '',
      paymentMethod: 'Card',
    },
  })

  const paymentMethod = watch('paymentMethod')

  useEffect(() => {
    if (profile.data?.phone) setValue('phone', profile.data.phone)
    const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0]
    if (defaultAddress) setValue('deliveryAddress', defaultAddress.address)
  }, [profile.data, addresses, setValue])

  if (items.length === 0 || !restaurantId) {
    return (
      <EmptyState
        title="Nothing to checkout"
        description="Add items to your cart before placing an order."
        actionLabel="Browse restaurants"
        onAction={() => navigate(PATHS.customer.restaurants)}
      />
    )
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const order = await createOrder.mutateAsync({
        restaurantId,
        deliveryAddress: values.deliveryAddress,
        phone: values.phone,
        notes: values.notes,
        paymentMethod: values.paymentMethod,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        deliveryFee: totals.deliveryFee,
        discount: totals.discount,
        total: totals.total,
      })
      clearCart()
      navigate(orderDetailPath(order.id), { replace: true })
    } catch {
      // toast handled in mutation
    }
  })

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.9fr]">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirm delivery details and place your order.
          </p>
        </div>

        <form id="checkout-form" onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField
            label="Delivery address"
            htmlFor="deliveryAddress"
            error={errors.deliveryAddress?.message}
          >
            <Input
              id="deliveryAddress"
              hasError={Boolean(errors.deliveryAddress)}
              placeholder="Street, apartment, city"
              {...register('deliveryAddress')}
            />
          </FormField>

          {addresses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => setValue('deliveryAddress', address.address, { shouldValidate: true })}
                  className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Use {address.label}
                </button>
              ))}
            </div>
          ) : null}

          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input
              id="phone"
              type="tel"
              hasError={Boolean(errors.phone)}
              placeholder="+1 555 0100"
              {...register('phone')}
            />
          </FormField>

          <FormField label="Notes (optional)" htmlFor="notes" error={errors.notes?.message}>
            <Input
              id="notes"
              hasError={Boolean(errors.notes)}
              placeholder="Gate code, allergies, preference…"
              {...register('notes')}
            />
          </FormField>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Payment method</legend>
            <div className="grid grid-cols-3 gap-2">
              {(['Card', 'UPI', 'Cash'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setValue('paymentMethod', method, { shouldValidate: true })}
                  className={cn(
                    'rounded-[var(--radius-lg)] border px-3 py-3 text-sm font-medium transition',
                    paymentMethod === method
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-surface text-muted-foreground hover:text-foreground',
                  )}
                >
                  {method}
                </button>
              ))}
            </div>
            {errors.paymentMethod ? (
              <p className="text-xs text-danger" role="alert">
                {errors.paymentMethod.message}
              </p>
            ) : null}
          </fieldset>
        </form>
      </motion.section>

      <aside className="h-fit space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] lg:sticky lg:top-20">
        <h2 className="font-display text-lg font-semibold text-foreground">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.menuItemId} className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {item.quantity}× {item.name}
              </span>
              <span className="font-medium text-foreground">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatCurrency(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd>{formatCurrency(totals.tax)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd>{totals.deliveryFee === 0 ? 'Free' : formatCurrency(totals.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatCurrency(totals.total)}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">
          Estimated delivery ~35–45 minutes after the restaurant accepts.
        </p>
        <Button
          type="submit"
          form="checkout-form"
          className="w-full"
          loading={createOrder.isPending}
        >
          Place order
        </Button>
        <Link
          to={PATHS.customer.cart}
          className="block text-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Back to cart
        </Link>
      </aside>
    </div>
  )
}
