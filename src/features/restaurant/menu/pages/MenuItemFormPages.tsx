import { useNavigate, useParams } from 'react-router-dom'
import {
  EmptyState,
  ErrorState,
  PageHeader,
  TableSkeleton,
} from '@/features/restaurant/components'
import { MenuItemForm } from '@/features/restaurant/components/menu/MenuItemForm'
import {
  useMerchantCategories,
  useMerchantMenuItem,
  useMenuMutations,
  useUploadRestaurantImage,
} from '@/features/restaurant/hooks'
import type { MenuItemFormValues } from '@/features/restaurant/schemas'
import { PATHS } from '@/routes/paths'

function toPayload(values: MenuItemFormValues) {
  return {
    name: values.name,
    description: values.description || null,
    category_id: values.category_id,
    price: values.price,
    preparation_time: values.preparation_time ?? null,
    calories: values.calories ?? null,
    is_available: values.is_available,
    is_featured: values.is_featured,
    tags: values.tags
      ? values.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    image: values.image || null,
    stock: values.stock,
    low_stock_limit: values.low_stock_limit,
  }
}

export function MenuItemNewPage() {
  const navigate = useNavigate()
  const categories = useMerchantCategories()
  const { createItem } = useMenuMutations()
  const upload = useUploadRestaurantImage()

  if (categories.isLoading) {
    return (
      <>
        <PageHeader title="New menu item" />
        <TableSkeleton />
      </>
    )
  }

  if ((categories.data?.length ?? 0) === 0) {
    return (
      <EmptyState
        title="Create a category first"
        description="Menu items must belong to a category."
        actionLabel="Manage categories"
        onAction={() => navigate(PATHS.restaurant.categories)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="New menu item" description="Add a dish to your restaurant menu." />
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4 md:p-6">
        <MenuItemForm
          categories={categories.data ?? []}
          submitting={createItem.isPending}
          onUploadImage={(file) =>
            upload.mutateAsync({ bucket: 'menu-images', file })
          }
          onSubmit={(values) => {
            createItem.mutate(toPayload(values), {
              onSuccess: () => navigate(PATHS.restaurant.menu),
            })
          }}
        />
      </div>
    </div>
  )
}

export function MenuItemEditPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const categories = useMerchantCategories()
  const item = useMerchantMenuItem(itemId)
  const { updateItem } = useMenuMutations()
  const upload = useUploadRestaurantImage()

  if (item.isLoading || categories.isLoading) {
    return (
      <>
        <PageHeader title="Edit menu item" />
        <TableSkeleton />
      </>
    )
  }

  if (item.isError) {
    return (
      <ErrorState description={(item.error as Error).message} onRetry={() => void item.refetch()} />
    )
  }

  if (!item.data) {
    return <EmptyState title="Item not found" />
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit menu item" description={item.data.name} />
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4 md:p-6">
        <MenuItemForm
          categories={categories.data ?? []}
          initial={item.data}
          submitting={updateItem.isPending}
          onUploadImage={(file) =>
            upload.mutateAsync({ bucket: 'menu-images', file })
          }
          onSubmit={(values) => {
            updateItem.mutate(
              { id: item.data.id, payload: toPayload(values) },
              { onSuccess: () => navigate(PATHS.restaurant.menu) },
            )
          }}
        />
      </div>
    </div>
  )
}
