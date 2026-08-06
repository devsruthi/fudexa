import { Search } from 'lucide-react'
import { Input } from '@/components/ui'
import { cn } from '@/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  'aria-label'?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search restaurants, food, cuisine…',
  className,
  'aria-label': ariaLabel = 'Search',
}: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 pl-10"
        aria-label={ariaLabel}
      />
    </div>
  )
}
