import { useQuery } from '@tanstack/react-query'
import { analyticsKeys } from '@/features/analytics/api/query-keys'
import { analyticsService } from '@/features/analytics/services'
import type { AnalyticsPreset } from '@/features/analytics/types'
import { useRestaurantContext } from '@/features/restaurant/hooks'

export function useEnterpriseAnalytics(
  preset: AnalyticsPreset,
  customFrom?: string,
  customTo?: string,
) {
  const { data: ctx } = useRestaurantContext()
  const restaurantId = ctx?.restaurantId

  return useQuery({
    queryKey: analyticsKeys.enterprise(restaurantId ?? '', preset, customFrom, customTo),
    queryFn: () =>
      analyticsService.getEnterpriseAnalytics(
        restaurantId!,
        preset,
        customFrom,
        customTo,
      ),
    enabled: Boolean(restaurantId),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
