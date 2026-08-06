import { PagePlaceholder } from '@/components/shared'

export function OrdersPage() {
  return (
    <PagePlaceholder
      feature="Customer · Orders"
      title="Order history"
      description="Active and past orders with status tracking will appear in this list."
    />
  )
}

export function OrderDetailPage() {
  return (
    <PagePlaceholder
      feature="Customer · Order Detail"
      title="Order details"
      description="Timeline, items, receipt, and support actions will be shown here."
    />
  )
}
