import { createFileRoute } from '@tanstack/react-router'
import { TestimonialEdit } from '@/features/testimonials/edit'

export const Route = createFileRoute('/_authenticated/testimonials/$id/edit')({
  component: RouteComponent,
})

// eslint-disable-next-line react-refresh/only-export-components
function RouteComponent() {
  const { id } = Route.useParams()
  return <TestimonialEdit id={id} />
}
