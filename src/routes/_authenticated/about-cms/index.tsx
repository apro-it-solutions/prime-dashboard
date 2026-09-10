import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { AboutCms } from '@/features/about-cms'

export const Route = createFileRoute('/_authenticated/about-cms/')({
  component: guarded([PERMISSIONS.CMS_EDIT], AboutCms),
})
