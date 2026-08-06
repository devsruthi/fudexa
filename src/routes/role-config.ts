import type { AuthRole, UserRole } from '@/types'
import { PATHS } from './paths'

/**
 * Maps each role to its post-login landing path.
 * Add entries here when introducing new roles — do not hardcode redirects in UI.
 */
export const ROLE_HOME_PATHS: Record<UserRole, string> = {
  customer: PATHS.customer.home,
  restaurant: PATHS.restaurant.dashboard,
  driver: PATHS.driver.root,
  kitchen: PATHS.kitchen.root,
  admin: PATHS.admin.root,
}

/** Roles that currently have a mounted route tree. */
export const ACTIVE_ROLES = ['customer', 'restaurant'] as const satisfies readonly AuthRole[]

export type ActiveRole = (typeof ACTIVE_ROLES)[number]

export function getHomePathForRole(role: UserRole | AuthRole): string {
  return ROLE_HOME_PATHS[role]
}

export function isActiveRole(role: UserRole): role is ActiveRole {
  return (ACTIVE_ROLES as readonly UserRole[]).includes(role)
}
