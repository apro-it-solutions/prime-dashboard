import { z } from 'zod'
import { type Testimonial, type TestimonialInput } from '@/types/api'

/** Selectable star ratings. Stored as a string so it binds to a Select. */
export const RATING_OPTIONS = ['1', '2', '3', '4', '5'] as const

/**
 * Shape of the testimonial form as edited inside react-hook-form. `rating` is a
 * string here (a number in the API payload) so it can back a Select, mirroring
 * how the blog form keeps `tags` as a comma-separated string.
 */
export const testimonialFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  designation: z.string().min(1, 'Designation is required').max(120),
  company: z.string().max(150).optional(),
  avatar: z.string().optional(),
  rating: z.enum(RATING_OPTIONS),
  review: z
    .string()
    .min(1, 'Review is required')
    .max(5000, 'Review must be 5000 characters or fewer'),
  isActive: z.boolean(),
})

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>

export const emptyTestimonialForm: TestimonialFormValues = {
  name: '',
  designation: '',
  company: '',
  avatar: '',
  rating: '5',
  review: '',
  isActive: true,
}

/** Clamps a stored rating into the 1–5 range the Select can display. */
const toRatingOption = (rating: number): TestimonialFormValues['rating'] => {
  const clamped = Math.min(5, Math.max(1, Math.round(rating || 5)))
  return String(clamped) as TestimonialFormValues['rating']
}

/** API Testimonial -> form values (for the edit page). */
export function testimonialToForm(
  testimonial: Testimonial
): TestimonialFormValues {
  return {
    name: testimonial.name,
    designation: testimonial.designation,
    company: testimonial.company ?? '',
    avatar: testimonial.avatar ?? '',
    rating: toRatingOption(testimonial.rating),
    review: testimonial.review,
    isActive: testimonial.isActive,
  }
}

/** Form values -> API payload. */
export function formToInput(values: TestimonialFormValues): TestimonialInput {
  return {
    name: values.name.trim(),
    designation: values.designation.trim(),
    company: values.company?.trim() || undefined,
    avatar: values.avatar || undefined,
    rating: Number(values.rating),
    review: values.review.trim(),
    isActive: values.isActive,
  }
}
