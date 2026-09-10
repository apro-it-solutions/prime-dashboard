import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { Contact } from '@/features/contact'

export const Route = createFileRoute('/_authenticated/contact/')({
  component: guarded([PERMISSIONS.CONTACT_VIEW], Contact),
})
