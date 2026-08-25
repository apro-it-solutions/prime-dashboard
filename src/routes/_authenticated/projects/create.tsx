import { createFileRoute } from '@tanstack/react-router'
import { ProjectCreate } from '@/features/projects/create'

export const Route = createFileRoute('/_authenticated/projects/create')({
  component: ProjectCreate,
})
