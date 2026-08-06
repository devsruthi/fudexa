import { Link } from 'react-router-dom'
import { Archive, Copy, Pencil, Trash2 } from 'lucide-react'
import type { MenuItemWithRelations } from '@/features/restaurant/types'
import { formatCurrency, menuEditPath } from '@/features/restaurant/utils'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

interface MenuTableProps {
  items: MenuItemWithRelations[]
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onDuplicate: (id: string) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}

export function MenuTable({
  items,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDuplicate,
  onArchive,
  onDelete,
}: MenuTableProps) {
  const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id))

  return (
    <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-border bg-surface">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                aria-label="Select all menu items"
              />
            </th>
            <th className="px-3 py-3 font-medium">Item</th>
            <th className="px-3 py-3 font-medium">Category</th>
            <th className="px-3 py-3 font-medium">Price</th>
            <th className="px-3 py-3 font-medium">Stock</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => onToggleSelect(item.id)}
                  aria-label={`Select ${item.name}`}
                />
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 overflow-hidden rounded-[var(--radius-md)] bg-muted">
                    {item.image ? (
                      <img src={item.image} alt="" className="size-full object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.is_featured ? (
                      <span className="text-[11px] font-medium text-primary">Featured</span>
                    ) : null}
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-muted-foreground">{item.category?.name ?? '—'}</td>
              <td className="px-3 py-3 tabular-nums">{formatCurrency(Number(item.price))}</td>
              <td className="px-3 py-3 tabular-nums">{item.inventory?.stock ?? 0}</td>
              <td className="px-3 py-3">
                <span
                  className={cn(
                    'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    item.is_available
                      ? 'bg-success/15 text-success'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {item.is_available ? 'Available' : 'Archived'}
                </span>
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-end gap-1">
                  <Link
                    to={menuEditPath(item.id)}
                    className="inline-flex size-8 items-center justify-center rounded-[var(--radius-md)] text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`Edit ${item.name}`}
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 px-0"
                    aria-label={`Duplicate ${item.name}`}
                    onClick={() => onDuplicate(item.id)}
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 px-0"
                    aria-label={`Archive ${item.name}`}
                    onClick={() => onArchive(item.id)}
                  >
                    <Archive className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 px-0"
                    aria-label={`Delete ${item.name}`}
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="size-4 text-danger" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
