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
  placeholder = 'Search…',
  className,
  'aria-label': ariaLabel = 'Search',
}: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="pl-9"
      />
    </div>
  )
}
