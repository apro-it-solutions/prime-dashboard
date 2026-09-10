import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { Settings } from '@/features/settings'

export const Route = createFileRoute('/_authenticated/settings')({
  component: guarded([PERMISSIONS.SETTINGS_VIEW], Settings),
})
