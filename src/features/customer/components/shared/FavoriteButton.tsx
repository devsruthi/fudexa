import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/utils'

interface FavoriteButtonProps {
  isFavorite: boolean
  onToggle: () => void
  loading?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function FavoriteButton({
  isFavorite,
  onToggle,
  loading,
  className,
  size = 'md',
}: FavoriteButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!loading) onToggle()
      }}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-border bg-surface/90 shadow-[var(--shadow-sm)] backdrop-blur transition hover:bg-muted disabled:opacity-50',
        size === 'sm' ? 'size-8' : 'size-10',
        className,
      )}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorite}
      disabled={loading}
    >
      <Heart
        className={cn(
          size === 'sm' ? 'size-4' : 'size-5',
          isFavorite ? 'fill-danger text-danger' : 'text-muted-foreground',
        )}
      />
    </motion.button>
  )
}
