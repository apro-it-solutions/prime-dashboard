import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { Users } from '@/features/users'

export const Route = createFileRoute('/_authenticated/users/')({
  component: guarded([PERMISSIONS.USER_VIEW], Users),
})
