import { createFileRoute } from '@tanstack/react-router'
import { ProjectCategories } from '@/features/projects/categories'

export const Route = createFileRoute('/_authenticated/projects/categories')({
  component: ProjectCategories,
})
