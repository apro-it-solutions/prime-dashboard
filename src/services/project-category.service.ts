import {
  type ApiEnvelope,
  type ListQuery,
  type Paginated,
  type ProjectCategory,
  type ProjectCategoryInput,
} from '@/types/api'
import { apiClient } from '@/lib/api-client'

/**
 * Categories owned by the Projects module. Deliberately a different endpoint
 * from `category.service.ts` (`/categories`, used by products and blogs) so the
 * two sets of categories never mix.
 */
export const projectCategoryService = {
  async list(params: ListQuery = {}): Promise<Paginated<ProjectCategory>> {
    const { data } = await apiClient.get<ApiEnvelope<ProjectCategory[]>>(
      '/project-categories',
      { params }
    )
    return { items: data.data, meta: data.meta }
  },

  async getById(id: string): Promise<ProjectCategory> {
    const { data } = await apiClient.get<ApiEnvelope<ProjectCategory>>(
      `/project-categories/${id}`
    )
    return data.data
  },

  async create(input: ProjectCategoryInput): Promise<ProjectCategory> {
    const { data } = await apiClient.post<ApiEnvelope<ProjectCategory>>(
      '/project-categories',
      input
    )
    return data.data
  },

  async update(
    id: string,
    input: Partial<ProjectCategoryInput>
  ): Promise<ProjectCategory> {
    const { data } = await apiClient.put<ApiEnvelope<ProjectCategory>>(
      `/project-categories/${id}`,
      input
    )
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/project-categories/${id}`)
  },
}
