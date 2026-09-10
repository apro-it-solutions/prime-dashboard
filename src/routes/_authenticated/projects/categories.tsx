import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { ProjectCategories } from '@/features/projects/categories'

export const Route = createFileRoute('/_authenticated/projects/categories')({
  component: guarded([PERMISSIONS.PROJECT_VIEW], ProjectCategories),
})
