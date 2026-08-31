import {
  type ApiEnvelope,
  type BlogCategory,
  type BlogCategoryInput,
  type ListQuery,
  type Paginated,
} from '@/types/api'
import { apiClient } from '@/lib/api-client'

/**
 * Categories owned by the Blogs module. Deliberately a different endpoint from
 * `category.service.ts` (`/categories`, used by products) and from
 * `project-category.service.ts`, so the three sets of categories never mix.
 */
export const blogCategoryService = {
  async list(params: ListQuery = {}): Promise<Paginated<BlogCategory>> {
    const { data } = await apiClient.get<ApiEnvelope<BlogCategory[]>>(
      '/blog-categories',
      { params }
    )
    return { items: data.data, meta: data.meta }
  },

  async getById(id: string): Promise<BlogCategory> {
    const { data } = await apiClient.get<ApiEnvelope<BlogCategory>>(
      `/blog-categories/${id}`
    )
    return data.data
  },

  async create(input: BlogCategoryInput): Promise<BlogCategory> {
    const { data } = await apiClient.post<ApiEnvelope<BlogCategory>>(
      '/blog-categories',
      input
    )
    return data.data
  },

  async update(
    id: string,
    input: Partial<BlogCategoryInput>
  ): Promise<BlogCategory> {
    const { data } = await apiClient.put<ApiEnvelope<BlogCategory>>(
      `/blog-categories/${id}`,
      input
    )
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/blog-categories/${id}`)
  },
}
