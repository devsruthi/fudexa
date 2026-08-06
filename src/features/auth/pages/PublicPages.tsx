import { Link } from 'react-router-dom'
import { PagePlaceholder } from '@/components/shared'
import { PATHS } from '@/routes/paths'

export function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg items-center px-4">
      <div className="w-full space-y-4">
        <PagePlaceholder
          title="Access denied"
          description="Your account does not have permission to view this area. Switch roles or return home."
        />
        <Link to={PATHS.root} className="text-sm font-medium text-primary hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg items-center px-4">
      <div className="w-full space-y-4">
        <PagePlaceholder
          title="Page not found"
          description="The route you requested does not exist in OrderFlow."
        />
        <Link to={PATHS.root} className="text-sm font-medium text-primary hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  )
}
