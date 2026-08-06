import { useState } from 'react'
import { GripVertical, Pencil, Power, Trash2 } from 'lucide-react'
import type { Category } from '@/features/restaurant/types'
import { Button, Input } from '@/components/ui'
import { cn } from '@/utils'

interface CategoryListProps {
  categories: Category[]
  onReorder: (ordered: Category[]) => void
  onRename: (id: string, name: string) => void
  onToggleActive: (id: string, is_active: boolean) => void
  onDelete: (id: string) => void
}

export function CategoryList({
  categories,
  onReorder,
  onRename,
  onToggleActive,
  onDelete,
}: CategoryListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleDrop = (toIndex: number) => {
    if (dragIndex === null || dragIndex === toIndex) return
    const next = [...categories]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(toIndex, 0, moved)
    setDragIndex(null)
    onReorder(next)
  }

  return (
    <ul className="space-y-2" aria-label="Categories">
      {categories.map((category, index) => (
        <li
          key={category.id}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(index)}
          className={cn(
            'flex items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-surface px-3 py-3 shadow-[var(--shadow-sm)]',
            !category.is_active && 'opacity-60',
          )}
        >
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
            aria-label={`Drag to reorder ${category.name}`}
          >
            <GripVertical className="size-4" />
          </button>

          <div className="min-w-0 flex-1">
            {editingId === category.id ? (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  onRename(category.id, editName.trim())
                  setEditingId(null)
                }}
              >
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  aria-label="Category name"
                  autoFocus
                />
                <Button type="submit" size="sm">
                  Save
                </Button>
              </form>
            ) : (
              <div>
                <p className="font-medium text-foreground">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                  Order {index + 1} · {category.is_active ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 px-0"
              aria-label={`Rename ${category.name}`}
              onClick={() => {
                setEditingId(category.id)
                setEditName(category.name)
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 px-0"
              aria-label={category.is_active ? 'Disable' : 'Enable'}
              onClick={() => onToggleActive(category.id, !category.is_active)}
            >
              <Power className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 px-0"
              aria-label={`Delete ${category.name}`}
              onClick={() => onDelete(category.id)}
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
