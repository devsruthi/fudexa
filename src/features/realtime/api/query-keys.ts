export const notificationKeys = {
  all: (userId: string) => ['notifications', userId] as const,
  list: (userId: string) => [...notificationKeys.all(userId), 'list'] as const,
  unread: (userId: string) => [...notificationKeys.all(userId), 'unread'] as const,
}
