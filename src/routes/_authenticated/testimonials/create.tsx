import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { TestimonialCreate } from '@/features/testimonials/create'

export const Route = createFileRoute('/_authenticated/testimonials/create')({
  component: guarded([PERMISSIONS.TESTIMONIAL_CREATE], TestimonialCreate),
})
