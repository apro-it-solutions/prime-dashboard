import { Badge } from '@/components/ui/badge'

/** Active/inactive pill for an admin account. */
export function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? 'outline' : 'secondary'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  )
}
