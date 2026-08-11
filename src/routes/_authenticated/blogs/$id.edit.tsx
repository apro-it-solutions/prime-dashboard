import { createFileRoute } from '@tanstack/react-router'
import { BlogEdit } from '@/features/blogs/edit'

export const Route = createFileRoute('/_authenticated/blogs/$id/edit')({
  component: RouteComponent,
})

// eslint-disable-next-line react-refresh/only-export-components
function RouteComponent() {
  const { id } = Route.useParams()
  return <BlogEdit id={id} />
}
