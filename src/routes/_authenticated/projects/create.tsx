import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { ProjectCreate } from '@/features/projects/create'

export const Route = createFileRoute('/_authenticated/projects/create')({
  component: guarded([PERMISSIONS.PROJECT_CREATE], ProjectCreate),
})
