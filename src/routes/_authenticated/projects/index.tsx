import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { Projects } from '@/features/projects'

export const Route = createFileRoute('/_authenticated/projects/')({
  component: guarded([PERMISSIONS.PROJECT_VIEW], Projects),
})
