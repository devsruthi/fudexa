import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ErrorState,
  ImageUploader,
  PageHeader,
  TableSkeleton,
} from '@/features/restaurant/components'
import {
  useRestaurantContext,
  useUpdateSettings,
  useUploadRestaurantImage,
} from '@/features/restaurant/hooks'
import { settingsSchema, type SettingsFormValues } from '@/features/restaurant/schemas'
import type { PaymentMethod } from '@/features/restaurant/types'
import { Button, FormField, Input } from '@/components/ui'

const PAYMENT_OPTIONS: PaymentMethod[] = ['Cash', 'Card', 'UPI']

export function SettingsPage() {
  const { data: ctx, isLoading, isError, error, refetch } = useRestaurantContext()
  const update = useUpdateSettings()
  const upload = useUploadRestaurantImage()

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      description: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: '',
      postal_code: '',
      opening_time: '',
      closing_time: '',
      is_open: true,
      tax_percentage: 8,
      default_delivery_fee: 3.99,
      minimum_order: 0,
      delivery_radius_km: 5,
      accepted_payment_methods: ['Card', 'Cash'],
      logo: null,
      cover_image: null,
    },
  })

  useEffect(() => {
    const r = ctx?.restaurant
    if (!r) return
    form.reset({
      name: r.name,
      description: r.description ?? '',
      phone: r.phone ?? '',
      email: r.email ?? '',
      address: r.address,
      city: r.city,
      country: r.country,
      postal_code: r.postal_code ?? '',
      opening_time: r.opening_time?.slice(0, 5) ?? '',
      closing_time: r.closing_time?.slice(0, 5) ?? '',
      is_open: r.is_open,
      tax_percentage: Number(r.tax_percentage ?? 8),
      default_delivery_fee: Number(r.default_delivery_fee ?? 0),
      minimum_order: Number(r.minimum_order ?? 0),
      delivery_radius_km: r.delivery_radius_km,
      accepted_payment_methods: (r.accepted_payment_methods as PaymentMethod[])?.length
        ? (r.accepted_payment_methods as PaymentMethod[])
        : ['Card'],
      logo: r.logo,
      cover_image: r.cover_image,
    })
  }, [ctx?.restaurant, form])

  if (isLoading) {
    return (
      <>
        <PageHeader title="Settings" />
        <TableSkeleton />
      </>
    )
  }

  if (isError || !ctx) {
    return (
      <ErrorState
        description={(error as Error)?.message ?? 'Could not load restaurant'}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Restaurant settings"
        description="Brand, hours, delivery rules, and payment options."
      />

      <form
        className="space-y-6 rounded-[var(--radius-xl)] border border-border bg-surface p-4 md:p-6"
        onSubmit={form.handleSubmit((values) => {
          update.mutate({
            name: values.name,
            description: values.description || null,
            phone: values.phone || null,
            email: values.email || null,
            address: values.address,
            city: values.city,
            country: values.country,
            postal_code: values.postal_code || null,
            opening_time: values.opening_time || null,
            closing_time: values.closing_time || null,
            is_open: values.is_open,
            tax_percentage: values.tax_percentage,
            default_delivery_fee: values.default_delivery_fee,
            minimum_order: values.minimum_order,
            delivery_radius_km: values.delivery_radius_km,
            accepted_payment_methods: values.accepted_payment_methods,
            logo: values.logo || null,
            cover_image: values.cover_image || null,
          })
        })}
        noValidate
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Controller
            control={form.control}
            name="logo"
            render={({ field }) => (
              <div>
                <p className="mb-2 text-sm font-medium">Logo</p>
                <ImageUploader
                  value={field.value}
                  onChange={field.onChange}
                  onUpload={(file) =>
                    upload.mutateAsync({ bucket: 'restaurant-logos', file })
                  }
                  label="Restaurant logo"
                />
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="cover_image"
            render={({ field }) => (
              <div>
                <p className="mb-2 text-sm font-medium">Cover image</p>
                <ImageUploader
                  value={field.value}
                  onChange={field.onChange}
                  onUpload={(file) =>
                    upload.mutateAsync({ bucket: 'restaurant-covers', file })
                  }
                  label="Cover photo"
                  aspect="cover"
                />
              </div>
            )}
          />
        </div>

        <FormField label="Restaurant name" htmlFor="set-name" error={form.formState.errors.name?.message}>
          <Input id="set-name" {...form.register('name')} />
        </FormField>

        <FormField label="Description" htmlFor="set-desc">
          <textarea
            id="set-desc"
            rows={3}
            className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm"
            {...form.register('description')}
          />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Phone" htmlFor="set-phone">
            <Input id="set-phone" {...form.register('phone')} />
          </FormField>
          <FormField label="Email" htmlFor="set-email" error={form.formState.errors.email?.message}>
            <Input id="set-email" type="email" {...form.register('email')} />
          </FormField>
        </div>

        <FormField label="Address" htmlFor="set-address" error={form.formState.errors.address?.message}>
          <Input id="set-address" {...form.register('address')} />
        </FormField>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="City" htmlFor="set-city" error={form.formState.errors.city?.message}>
            <Input id="set-city" {...form.register('city')} />
          </FormField>
          <FormField label="Country" htmlFor="set-country" error={form.formState.errors.country?.message}>
            <Input id="set-country" {...form.register('country')} />
          </FormField>
          <FormField label="Postal code" htmlFor="set-postal">
            <Input id="set-postal" {...form.register('postal_code')} />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Opens" htmlFor="set-open">
            <Input id="set-open" type="time" {...form.register('opening_time')} />
          </FormField>
          <FormField label="Closes" htmlFor="set-close">
            <Input id="set-close" type="time" {...form.register('closing_time')} />
          </FormField>
          <label className="mt-7 inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register('is_open')} />
            Currently open for orders
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormField label="Tax %" htmlFor="set-tax" error={form.formState.errors.tax_percentage?.message}>
            <Input
              id="set-tax"
              type="number"
              step="0.01"
              {...form.register('tax_percentage', { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Delivery fee"
            htmlFor="set-fee"
            error={form.formState.errors.default_delivery_fee?.message}
          >
            <Input
              id="set-fee"
              type="number"
              step="0.01"
              {...form.register('default_delivery_fee', { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Minimum order"
            htmlFor="set-min"
            error={form.formState.errors.minimum_order?.message}
          >
            <Input
              id="set-min"
              type="number"
              step="0.01"
              {...form.register('minimum_order', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Delivery radius (km)" htmlFor="set-radius">
            <Input
              id="set-radius"
              type="number"
              step="0.1"
              {...form.register('delivery_radius_km', {
                setValueAs: (v) => (v === '' || Number.isNaN(Number(v)) ? null : Number(v)),
              })}
            />
          </FormField>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Payment methods</legend>
          <div className="flex flex-wrap gap-4">
            {PAYMENT_OPTIONS.map((method) => (
              <label key={method} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  value={method}
                  checked={form.watch('accepted_payment_methods').includes(method)}
                  onChange={(e) => {
                    const current = form.getValues('accepted_payment_methods')
                    form.setValue(
                      'accepted_payment_methods',
                      e.target.checked
                        ? [...current, method]
                        : current.filter((m) => m !== method),
                      { shouldValidate: true },
                    )
                  }}
                />
                {method}
              </label>
            ))}
          </div>
          {form.formState.errors.accepted_payment_methods ? (
            <p className="mt-1 text-xs text-danger" role="alert">
              {form.formState.errors.accepted_payment_methods.message}
            </p>
          ) : null}
        </fieldset>

        <Button type="submit" loading={update.isPending}>
          Save changes
        </Button>
      </form>
    </div>
  )
}
