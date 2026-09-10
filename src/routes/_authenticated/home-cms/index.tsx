import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { HomeCms } from '@/features/home-cms'

export const Route = createFileRoute('/_authenticated/home-cms/')({
  component: guarded([PERMISSIONS.CMS_EDIT], HomeCms),
})
