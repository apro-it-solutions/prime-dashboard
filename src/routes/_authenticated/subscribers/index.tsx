import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { Subscribers } from '@/features/subscribers'

export const Route = createFileRoute('/_authenticated/subscribers/')({
  component: guarded([PERMISSIONS.SUBSCRIPTION_VIEW], Subscribers),
})
