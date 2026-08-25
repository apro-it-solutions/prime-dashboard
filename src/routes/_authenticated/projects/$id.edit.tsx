import { createFileRoute } from '@tanstack/react-router'
import { ProjectEdit } from '@/features/projects/edit'

export const Route = createFileRoute('/_authenticated/projects/$id/edit')({
  component: RouteComponent,
})

// eslint-disable-next-line react-refresh/only-export-components
function RouteComponent() {
  const { id } = Route.useParams()
  return <ProjectEdit id={id} />
}
