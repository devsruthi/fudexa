import { Moon, Sun } from 'lucide-react'
import { useUiStore } from '@/store'

/** Cycles light → dark → system for the design-system theme. */
export function ThemeToggle() {
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
  const label = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border/80 bg-surface/90 px-3 text-xs font-medium text-foreground shadow-[var(--shadow-sm)] transition hover:border-primary/25 hover:bg-muted/60"
      aria-label={`Theme: ${label}. Click to switch to ${next}.`}
    >
      {theme === 'dark' ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
      {label}
    </button>
  )
}
