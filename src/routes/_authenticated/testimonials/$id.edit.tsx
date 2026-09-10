import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { TestimonialEdit } from '@/features/testimonials/edit'

export const Route = createFileRoute('/_authenticated/testimonials/$id/edit')({
  component: guarded([PERMISSIONS.TESTIMONIAL_EDIT], RouteComponent),
})

// eslint-disable-next-line react-refresh/only-export-components
function RouteComponent() {
  const { id } = Route.useParams()
  return <TestimonialEdit id={id} />
}
