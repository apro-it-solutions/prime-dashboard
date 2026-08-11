import { apiClient } from '@/lib/api-client'
import {
  type ApiEnvelope,
  type Category,
  type CategoryInput,
  type ListQuery,
  type Paginated,
} from '@/types/api'

export const categoryService = {
  async list(params: ListQuery = {}): Promise<Paginated<Category>> {
    const { data } = await apiClient.get<ApiEnvelope<Category[]>>('/categories', {
      params,
    })
    return { items: data.data, meta: data.meta }
  },

  async getById(id: string): Promise<Category> {
    const { data } = await apiClient.get<ApiEnvelope<Category>>(`/categories/${id}`)
    return data.data
  },

  async create(input: CategoryInput): Promise<Category> {
    const { data } = await apiClient.post<ApiEnvelope<Category>>('/categories', input)
    return data.data
  },

  async update(id: string, input: Partial<CategoryInput>): Promise<Category> {
    const { data } = await apiClient.put<ApiEnvelope<Category>>(
      `/categories/${id}`,
      input
    )
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`)
  },
}
