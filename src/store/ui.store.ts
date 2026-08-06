import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface UiState {
  theme: ThemeMode
  sidebarCollapsed: boolean
  setTheme: (theme: ThemeMode) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

function applyThemeToDocument(theme: ThemeMode): void {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', isDark)
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      setTheme: (theme) => {
        applyThemeToDocument(theme)
        set({ theme })
      },
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'orderflow-ui',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDocument(state.theme)
        }
      },
    },
  ),
)

/** Call once at app boot to sync DOM with persisted theme. */
export function hydrateTheme(): void {
  const { theme } = useUiStore.getState()
  applyThemeToDocument(theme)
}
