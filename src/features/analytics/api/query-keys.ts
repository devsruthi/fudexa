export const analyticsKeys = {
  all: ['analytics'] as const,
  enterprise: (
    restaurantId: string,
    preset: string,
    from?: string,
    to?: string,
  ) => [...analyticsKeys.all, 'enterprise', restaurantId, preset, from ?? '', to ?? ''] as const,
}
