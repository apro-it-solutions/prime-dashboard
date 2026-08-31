import { createFileRoute } from '@tanstack/react-router'
import { BlogCategories } from '@/features/blogs/categories'

export const Route = createFileRoute('/_authenticated/blogs/categories')({
  component: BlogCategories,
})
