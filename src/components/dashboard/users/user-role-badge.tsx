import { ROLE_LABELS, ROLE_SUPER_ADMIN, type UserRole } from '@/lib/rbac'
import { Badge } from '@/components/ui/badge'

/** Role pill. Super Admin is emphasised; Platform User reads as secondary. */
export function UserRoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge variant={role === ROLE_SUPER_ADMIN ? 'default' : 'secondary'}>
      {ROLE_LABELS[role]}
    </Badge>
  )
}
