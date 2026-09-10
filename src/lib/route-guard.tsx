import { type Permission } from '@/lib/rbac'
import { PermissionGuard } from '@/components/permission-guard'

/**
 * Wraps a route component in a permission check.
 *
 * Used as `component: guarded([PERMISSIONS.PROJECT_VIEW], Projects)` in a route
 * file. The check lives in the component rather than in `beforeLoad` on purpose:
 * `beforeLoad` runs before GET /auth/me has resolved on a hard refresh, so the
 * role would not be known yet and every guarded route would 403 on reload.
 * `AuthenticatedLayout` holds the tree back until the profile is in, which makes
 * the component the first place the answer is actually available.
 */
export function guarded(
  permissions: Permission[],
  Component: React.ComponentType
) {
  return function GuardedRoute() {
    return (
      <PermissionGuard permissions={permissions}>
        <Component />
      </PermissionGuard>
    )
  }
}
