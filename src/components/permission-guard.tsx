import { type Permission } from '@/lib/rbac'
import { usePermissions } from '@/hooks/use-permissions'
import { ForbiddenError } from '@/features/errors/forbidden'

type PermissionGuardProps = {
  /** Every permission the wrapped screen needs. */
  permissions: Permission[]
  children: React.ReactNode
}

/**
 * Renders `children` only when the signed-in admin holds every listed
 * permission, and the shared 403 screen otherwise.
 *
 * This is the front half of the guard: it keeps a Platform User who types
 * /projects into the address bar from landing on a broken screen full of failed
 * requests. The real enforcement is the permission middleware on the API — this
 * cannot be relied on, only the server can.
 */
export function PermissionGuard({
  permissions,
  children,
}: PermissionGuardProps) {
  const { canAll } = usePermissions()

  if (!canAll(...permissions)) {
    return <ForbiddenError />
  }

  return <>{children}</>
}
