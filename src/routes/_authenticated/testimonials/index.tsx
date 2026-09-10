import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { Testimonials } from '@/features/testimonials'

export const Route = createFileRoute('/_authenticated/testimonials/')({
  component: guarded([PERMISSIONS.TESTIMONIAL_VIEW], Testimonials),
})
