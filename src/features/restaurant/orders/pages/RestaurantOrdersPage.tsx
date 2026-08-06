import { PagePlaceholder } from '@/components/shared'

export function RestaurantOrdersPage() {
  return (
    <PagePlaceholder
      feature="Restaurant · Orders"
      title="Incoming orders"
      description="Real-time order board with accept, prepare, and ready actions will live here."
    />
  )
}

export function RestaurantOrderDetailPage() {
  return (
    <PagePlaceholder
      feature="Restaurant · Order Detail"
      title="Order detail"
      description="Item checklist, customer notes, and status controls will appear on this page."
    />
  )
}
