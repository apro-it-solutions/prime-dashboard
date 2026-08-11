import { apiClient } from '@/lib/api-client'
import {
  type ApiEnvelope,
  type ListQuery,
  type Paginated,
  type Testimonial,
  type TestimonialInput,
} from '@/types/api'

export const testimonialService = {
  async list(params: ListQuery = {}): Promise<Paginated<Testimonial>> {
    const { data } = await apiClient.get<ApiEnvelope<Testimonial[]>>(
      '/testimonials',
      { params }
    )
    return { items: data.data, meta: data.meta }
  },

  async getById(id: string): Promise<Testimonial> {
    const { data } = await apiClient.get<ApiEnvelope<Testimonial>>(
      `/testimonials/${id}`
    )
    return data.data
  },

  async create(input: TestimonialInput): Promise<Testimonial> {
    const { data } = await apiClient.post<ApiEnvelope<Testimonial>>(
      '/testimonials',
      input
    )
    return data.data
  },

  // The backend exposes PATCH (not PUT) for testimonial updates.
  async update(id: string, input: Partial<TestimonialInput>): Promise<Testimonial> {
    const { data } = await apiClient.patch<ApiEnvelope<Testimonial>>(
      `/testimonials/${id}`,
      input
    )
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/testimonials/${id}`)
  },
}
