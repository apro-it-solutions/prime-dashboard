import { apiClient } from '@/lib/api-client'
import {
  type ApiEnvelope,
  type Blog,
  type BlogInput,
  type ListQuery,
  type Paginated,
} from '@/types/api'

export const blogService = {
  async list(params: ListQuery = {}): Promise<Paginated<Blog>> {
    const { data } = await apiClient.get<ApiEnvelope<Blog[]>>('/blogs', { params })
    return { items: data.data, meta: data.meta }
  },

  async getById(id: string): Promise<Blog> {
    const { data } = await apiClient.get<ApiEnvelope<Blog>>(`/blogs/${id}`)
    return data.data
  },

  async create(input: BlogInput): Promise<Blog> {
    const { data } = await apiClient.post<ApiEnvelope<Blog>>('/blogs', input)
    return data.data
  },

  async update(id: string, input: Partial<BlogInput>): Promise<Blog> {
    const { data } = await apiClient.put<ApiEnvelope<Blog>>(`/blogs/${id}`, input)
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/blogs/${id}`)
  },
}
