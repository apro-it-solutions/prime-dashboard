import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { BlogCreate } from '@/features/blogs/create'

export const Route = createFileRoute('/_authenticated/blogs/create')({
  component: guarded([PERMISSIONS.BLOG_CREATE], BlogCreate),
})
