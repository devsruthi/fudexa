import { cn } from '@/utils'

interface CategoryFilterProps {
  categories: { id: string; name: string }[]
  value: string | null
  onChange: (categoryId: string | null) => void
  className?: string
}

export function CategoryFilter({ categories, value, onChange, className }: CategoryFilterProps) {
  return (
    <div
      className={cn('flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', className)}
      role="tablist"
      aria-label="Menu categories"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === null}
        onClick={() => onChange(null)}
        className={cn(
          'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition',
          value === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:text-foreground',
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          role="tab"
          aria-selected={value === category.id}
          onClick={() => onChange(category.id)}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition',
            value === category.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground',
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
