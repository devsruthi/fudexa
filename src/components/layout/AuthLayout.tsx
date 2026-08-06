import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/shared'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="mb-10 text-center">
        <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
          OrderFlow
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Restaurant operations, in real time</p>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
