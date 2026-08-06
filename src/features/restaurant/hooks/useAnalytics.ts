import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Restaurant } from '@/lib/supabase'
import type { AnalyticsRange } from '@/features/restaurant/types'
import { restaurantKeys } from '@/features/restaurant/api'
import { merchantAnalyticsService, restaurantSettingsService } from '@/features/restaurant/services'
import { useRestaurantContext } from './useRestaurantContext'

export function useDashboardData() {
  const restaurantQuery = useRestaurantContext()
  const restaurantId = restaurantQuery.data?.restaurantId

  const stats = useQuery({
    queryKey: restaurantKeys.dashboard(restaurantId ?? ''),
    queryFn: () => merchantAnalyticsService.getDashboardStats(restaurantId!),
    enabled: Boolean(restaurantId),
    refetchInterval: 30_000,
  })

  const recentOrders = useQuery({
    queryKey: [...restaurantKeys.dashboard(restaurantId ?? ''), 'recent-orders'],
    queryFn: () => merchantAnalyticsService.getRecentOrders(restaurantId!),
    enabled: Boolean(restaurantId),
  })

  const latestReviews = useQuery({
    queryKey: [...restaurantKeys.dashboard(restaurantId ?? ''), 'latest-reviews'],
    queryFn: () => merchantAnalyticsService.getLatestReviews(restaurantId!),
    enabled: Boolean(restaurantId),
  })

  const popularCategories = useQuery({
    queryKey: [...restaurantKeys.dashboard(restaurantId ?? ''), 'popular-categories'],
    queryFn: () => merchantAnalyticsService.getPopularCategories(restaurantId!),
    enabled: Boolean(restaurantId),
  })

  const analyticsPreview = useQuery({
    queryKey: restaurantKeys.analytics.bundle(restaurantId ?? '', '7d'),
    queryFn: () => merchantAnalyticsService.getAnalyticsBundle(restaurantId!, '7d'),
    enabled: Boolean(restaurantId),
  })

  return {
    restaurantQuery,
    stats,
    recentOrders,
    latestReviews,
    popularCategories,
    analyticsPreview,
  }
}

export function useAnalytics(range: AnalyticsRange, from?: string, to?: string) {
  const { data: ctx } = useRestaurantContext()
  return useQuery({
    queryKey: restaurantKeys.analytics.bundle(ctx?.restaurantId ?? '', range, from, to),
    queryFn: () =>
      merchantAnalyticsService.getAnalyticsBundle(ctx!.restaurantId, range, from, to),
    enabled: Boolean(ctx?.restaurantId),
  })
}

export function useUpdateSettings() {
  const { data: ctx } = useRestaurantContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<Restaurant>) =>
      restaurantSettingsService.updateRestaurant(ctx!.restaurantId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: restaurantKeys.context() })
      void queryClient.invalidateQueries({
        queryKey: restaurantKeys.settings(ctx!.restaurantId),
      })
      toast.success('Settings updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUploadRestaurantImage() {
  const { data: ctx } = useRestaurantContext()
  return useMutation({
    mutationFn: ({
      bucket,
      file,
    }: {
      bucket: 'restaurant-logos' | 'restaurant-covers' | 'menu-images'
      file: File
    }) => restaurantSettingsService.uploadRestaurantImage(ctx!.restaurantId, bucket, file),
    onError: (e: Error) => toast.error(e.message),
  })
}
