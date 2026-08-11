import { createFileRoute } from '@tanstack/react-router'
import { TestimonialCreate } from '@/features/testimonials/create'

export const Route = createFileRoute('/_authenticated/testimonials/create')({
  component: TestimonialCreate,
})
