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
      className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground shadow-[var(--shadow-sm)] transition hover:bg-muted"
      aria-label={`Theme: ${label}. Click to switch to ${next}.`}
    >
      {theme === 'dark' ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
      {label}
    </button>
  )
}
