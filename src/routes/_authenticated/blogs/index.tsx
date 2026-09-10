import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { Blogs } from '@/features/blogs'

export const Route = createFileRoute('/_authenticated/blogs/')({
  component: guarded([PERMISSIONS.BLOG_VIEW], Blogs),
})
