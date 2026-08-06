import { useState } from 'react'
import type { InventoryWithItem } from '@/features/restaurant/types'
import { formatCurrency, inventoryTone } from '@/features/restaurant/utils'
import { Button, Input } from '@/components/ui'
import { cn } from '@/utils'

interface InventoryTableProps {
  rows: InventoryWithItem[]
  onSave: (id: string, stock: number, low_stock_limit: number) => void
  saving?: boolean
}

export function InventoryTable({ rows, onSave, saving }: InventoryTableProps) {
  const [drafts, setDrafts] = useState<Record<string, { stock: string; low: string }>>({})

  const getDraft = (row: InventoryWithItem) =>
    drafts[row.id] ?? {
      stock: String(row.stock),
      low: String(row.low_stock_limit),
    }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-border bg-surface">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-3 font-medium">Item</th>
            <th className="px-3 py-3 font-medium">Price</th>
            <th className="px-3 py-3 font-medium">Stock</th>
            <th className="px-3 py-3 font-medium">Low limit</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium text-right">Update</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const draft = getDraft(row)
            return (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 overflow-hidden rounded-[var(--radius-md)] bg-muted">
                      {row.menu_item?.image ? (
                        <img src={row.menu_item.image} alt="" className="size-full object-cover" />
                      ) : null}
                    </div>
                    <span className="font-medium text-foreground">
                      {row.menu_item?.name ?? 'Item'}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 tabular-nums text-muted-foreground">
                  {formatCurrency(Number(row.menu_item?.price ?? 0))}
                </td>
                <td className="px-3 py-3">
                  <Input
                    className="h-9 w-24"
                    type="number"
                    min={0}
                    value={draft.stock}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.id]: { ...draft, stock: e.target.value },
                      }))
                    }
                    aria-label={`Stock for ${row.menu_item?.name}`}
                  />
                </td>
                <td className="px-3 py-3">
                  <Input
                    className="h-9 w-24"
                    type="number"
                    min={0}
                    value={draft.low}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.id]: { ...draft, low: e.target.value },
                      }))
                    }
                    aria-label={`Low stock limit for ${row.menu_item?.name}`}
                  />
                </td>
                <td className="px-3 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      inventoryTone(row.status),
                    )}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <Button
                    size="sm"
                    loading={saving}
                    onClick={() =>
                      onSave(row.id, Number(draft.stock), Number(draft.low))
                    }
                  >
                    Save
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
