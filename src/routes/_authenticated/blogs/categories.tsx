import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { BlogCategories } from '@/features/blogs/categories'

export const Route = createFileRoute('/_authenticated/blogs/categories')({
  component: guarded([PERMISSIONS.BLOG_VIEW], BlogCategories),
})
