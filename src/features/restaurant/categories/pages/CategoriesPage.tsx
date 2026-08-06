import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CategoryList,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  TableSkeleton,
} from '@/features/restaurant/components'
import { useMerchantCategories, useMenuMutations } from '@/features/restaurant/hooks'
import { categorySchema, type CategoryFormValues } from '@/features/restaurant/schemas'
import type { Category } from '@/features/restaurant/types'
import { Button, FormField, Input } from '@/components/ui'

export function CategoriesPage() {
  const { data, isLoading, isError, error, refetch } = useMerchantCategories()
  const { createCategory, updateCategory, deleteCategory, reorderCategories } = useMenuMutations()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  })

  if (isError) {
    return (
      <ErrorState description={(error as Error).message} onRetry={() => void refetch()} />
    )
  }

  const handleReorder = (ordered: Category[]) => {
    reorderCategories.mutate(
      ordered.map((c, index) => ({ id: c.id, display_order: index })),
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your menu. Drag to reorder how categories appear to customers."
      />

      <form
        className="flex gap-2"
        onSubmit={form.handleSubmit((values) => {
          createCategory.mutate(values.name, {
            onSuccess: () => form.reset({ name: '' }),
          })
        })}
      >
        <FormField
          label="New category"
          htmlFor="category-name"
          className="flex-1"
          error={form.formState.errors.name?.message}
        >
          <Input id="category-name" placeholder="e.g. Appetizers" {...form.register('name')} />
        </FormField>
        <Button type="submit" className="mt-6" loading={createCategory.isPending}>
          Add
        </Button>
      </form>

      {isLoading ? (
        <TableSkeleton />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState title="No categories" description="Create your first category above." />
      ) : (
        <CategoryList
          categories={data ?? []}
          onReorder={handleReorder}
          onRename={(id, name) => updateCategory.mutate({ id, name })}
          onToggleActive={(id, is_active) => updateCategory.mutate({ id, is_active })}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete category?"
        description="Items in this category may become uncategorized or blocked by database constraints."
        confirmLabel="Delete"
        tone="danger"
        loading={deleteCategory.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return
          deleteCategory.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
        }}
      />
    </div>
  )
}
