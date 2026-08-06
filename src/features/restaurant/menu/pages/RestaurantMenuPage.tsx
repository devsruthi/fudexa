import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  MenuTable,
  PageHeader,
  SearchBar,
  TableSkeleton,
} from '@/features/restaurant/components'
import {
  useMerchantCategories,
  useMerchantMenu,
  useMenuMutations,
} from '@/features/restaurant/hooks'
import { PATHS } from '@/routes/paths'
import { Button } from '@/components/ui'

export function RestaurantMenuPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const categories = useMerchantCategories()
  const menu = useMerchantMenu({ search, categoryId })
  const mutations = useMenuMutations()

  const items = menu.data ?? []

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((i) => i.id)),
    )
  }

  if (menu.isError) {
    return (
      <ErrorState
        description={(menu.error as Error).message}
        onRetry={() => void menu.refetch()}
      />
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Menu"
        description="Create, edit, and manage your menu items."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate(PATHS.restaurant.categories)}>
              Categories
            </Button>
            <Button size="sm" onClick={() => navigate(PATHS.restaurant.menuNew)}>
              Add item
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search menu…"
          className="max-w-md flex-1"
        />
        <select
          className="h-11 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm"
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value || null)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedIds.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-muted/40 px-3 py-2 text-sm">
          <span>{selectedIds.size} selected</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              for (const id of selectedIds) mutations.archiveItem.mutate(id)
              setSelectedIds(new Set())
            }}
          >
            Archive
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              for (const id of selectedIds) mutations.duplicateItem.mutate(id)
              setSelectedIds(new Set())
            }}
          >
            Duplicate
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      ) : null}

      {menu.isLoading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          title="No menu items"
          description="Add your first dish to start taking orders."
          actionLabel="Add item"
          onAction={() => navigate(PATHS.restaurant.menuNew)}
        />
      ) : (
        <MenuTable
          items={items}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onDuplicate={(id) => mutations.duplicateItem.mutate(id)}
          onArchive={(id) => mutations.archiveItem.mutate(id)}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      <p className="text-xs text-muted-foreground">
        Tip: manage category order on the{' '}
        <Link to={PATHS.restaurant.categories} className="text-primary">
          Categories
        </Link>{' '}
        page.
      </p>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete menu item?"
        description="This permanently removes the item. Consider archiving instead."
        confirmLabel="Delete"
        tone="danger"
        loading={mutations.deleteItem.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return
          mutations.deleteItem.mutate(deleteId, {
            onSuccess: () => setDeleteId(null),
          })
        }}
      />
    </div>
  )
}
