import { Navigate, useParams } from 'react-router-dom'
import { restaurantDetailPath } from '@/features/customer/utils'

/** Legacy menu route — menu lives on the restaurant detail page. */
export function MenuPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>()
  if (!restaurantId) return <Navigate to="/customer/restaurants" replace />
  return <Navigate to={restaurantDetailPath(restaurantId)} replace />
}
