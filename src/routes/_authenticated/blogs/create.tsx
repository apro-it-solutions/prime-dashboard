import { createFileRoute } from '@tanstack/react-router'
import { BlogCreate } from '@/features/blogs/create'

export const Route = createFileRoute('/_authenticated/blogs/create')({
  component: BlogCreate,
})
