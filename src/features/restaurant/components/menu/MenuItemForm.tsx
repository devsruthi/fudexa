import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Category, MenuItemWithRelations } from '@/features/restaurant/types'
import { menuItemSchema, type MenuItemFormValues } from '@/features/restaurant/schemas'
import { ImageUploader } from '@/features/restaurant/components'
import { Button, FormField, Input } from '@/components/ui'

interface MenuItemFormProps {
  categories: Category[]
  initial?: MenuItemWithRelations | null
  submitting?: boolean
  onSubmit: (values: MenuItemFormValues) => void
  onUploadImage: (file: File) => Promise<string>
}

export function MenuItemForm({
  categories,
  initial,
  submitting,
  onSubmit,
  onUploadImage,
}: MenuItemFormProps) {
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: categories[0]?.id ?? '',
      price: 0,
      preparation_time: 15,
      calories: null,
      is_available: true,
      is_featured: false,
      tags: '',
      stock: 0,
      low_stock_limit: 5,
      image: null,
    },
  })

  useEffect(() => {
    if (!initial) return
    form.reset({
      name: initial.name,
      description: initial.description ?? '',
      category_id: initial.category_id,
      price: Number(initial.price),
      preparation_time: initial.preparation_time,
      calories: initial.calories,
      is_available: initial.is_available,
      is_featured: Boolean(initial.is_featured),
      tags: (initial.tags ?? []).join(', '),
      stock: initial.inventory?.stock ?? 0,
      low_stock_limit: initial.inventory?.low_stock_limit ?? 5,
      image: initial.image,
    })
  }, [initial, form])

  useEffect(() => {
    if (!initial && categories[0]?.id && !form.getValues('category_id')) {
      form.setValue('category_id', categories[0].id)
    }
  }, [categories, initial, form])

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
      noValidate
    >
      <Controller
        control={form.control}
        name="image"
        render={({ field }) => (
          <ImageUploader
            value={field.value}
            onChange={field.onChange}
            onUpload={onUploadImage}
            label="Menu item photo"
          />
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Name"
          htmlFor="menu-name"
          error={form.formState.errors.name?.message}
        >
          <Input id="menu-name" {...form.register('name')} />
        </FormField>
        <FormField
          label="Category"
          htmlFor="menu-category"
          error={form.formState.errors.category_id?.message}
        >
          <select
            id="menu-category"
            className="flex h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm"
            {...form.register('category_id')}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField
        label="Description"
        htmlFor="menu-description"
        error={form.formState.errors.description?.message}
      >
        <textarea
          id="menu-description"
          rows={3}
          className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm"
          {...form.register('description')}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Price" htmlFor="menu-price" error={form.formState.errors.price?.message}>
          <Input
            id="menu-price"
            type="number"
            step="0.01"
            {...form.register('price', { valueAsNumber: true })}
          />
        </FormField>
        <FormField
          label="Prep time (min)"
          htmlFor="menu-prep"
          error={form.formState.errors.preparation_time?.message}
        >
          <Input
            id="menu-prep"
            type="number"
            {...form.register('preparation_time', {
              setValueAs: (v) => (v === '' || Number.isNaN(Number(v)) ? null : Number(v)),
            })}
          />
        </FormField>
        <FormField
          label="Calories"
          htmlFor="menu-cal"
          error={form.formState.errors.calories?.message}
        >
          <Input
            id="menu-cal"
            type="number"
            {...form.register('calories', {
              setValueAs: (v) => (v === '' || Number.isNaN(Number(v)) ? null : Number(v)),
            })}
          />
        </FormField>
        <FormField label="Stock" htmlFor="menu-stock" error={form.formState.errors.stock?.message}>
          <Input id="menu-stock" type="number" {...form.register('stock', { valueAsNumber: true })} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Low stock limit"
          htmlFor="menu-low"
          error={form.formState.errors.low_stock_limit?.message}
        >
          <Input
            id="menu-low"
            type="number"
            {...form.register('low_stock_limit', { valueAsNumber: true })}
          />
        </FormField>
        <FormField label="Tags (comma separated)" htmlFor="menu-tags">
          <Input id="menu-tags" placeholder="spicy, vegan" {...form.register('tags')} />
        </FormField>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register('is_available')} />
          Available
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register('is_featured')} />
          Featured
        </label>
      </div>

      <Button type="submit" loading={submitting}>
        {initial ? 'Save changes' : 'Create item'}
      </Button>
    </form>
  )
}
