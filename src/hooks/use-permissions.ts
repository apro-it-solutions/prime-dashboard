import { useMemo } from 'react'
import {
  ROLE_SUPER_ADMIN,
  hasPermission,
  normalizeRole,
  resolvePermissions,
  type Permission,
  type UserRole,
} from '@/lib/rbac'
import { useAuthStore } from '@/stores/auth-store'

export type Permissions = {
  /** The signed-in account's role, normalized. */
  role: UserRole
  /** Everything that role may do, as resolved by the server where available. */
  permissions: readonly Permission[]
  /** True when the signed-in account holds `permission`. */
  can: (permission: Permission) => boolean
  /** True when the account holds every one of `required`. */
  canAll: (...required: Permission[]) => boolean
  /** True when the account holds at least one of `required`. */
  canAny: (...required: Permission[]) => boolean
  isSuperAdmin: boolean
  /** False until GET /auth/me has populated the store. */
  isReady: boolean
}

/**
 * What the signed-in admin is allowed to do.
 *
 * Drives what the dashboard renders — navigation, action buttons, route guards.
 * It is not a security boundary: the API re-checks every request, so a UI that
 * got this wrong would produce a 403, not an unauthorized write.
 *
 * `AuthenticatedLayout` blocks rendering until /auth/me resolves, so anything
 * inside the authenticated tree can rely on `isReady` being true.
 */
export function usePermissions(): Permissions {
  const user = useAuthStore((s) => s.auth.user)

  return useMemo(() => {
    const role = normalizeRole(user?.role)
    const permissions = resolvePermissions(user)
    const can = (permission: Permission) =>
      hasPermission(permissions, permission)

    return {
      role,
      permissions,
      can,
      canAll: (...required: Permission[]) => required.every(can),
      canAny: (...required: Permission[]) => required.some(can),
      isSuperAdmin: role === ROLE_SUPER_ADMIN,
      isReady: Boolean(user),
    }
  }, [user])
}
