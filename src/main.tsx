import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App, AppProviders } from '@/app'
import { hydrateTheme } from '@/store'
import './index.css'

hydrateTheme()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
