import { apiClient } from '@/lib/api-client'
import {
  type AdminUser,
  type AdminUserInput,
  type AdminUserListQuery,
  type ApiEnvelope,
  type Paginated,
} from '@/types/api'

/**
 * Admin user management. Every endpoint below requires a USER_* permission,
 * which only Super Admin holds — a Platform User calling any of them gets a 403
 * from the API regardless of what the dashboard renders.
 */
export const userService = {
  async list(params: AdminUserListQuery = {}): Promise<Paginated<AdminUser>> {
    const { data } = await apiClient.get<ApiEnvelope<AdminUser[]>>('/users', {
      params,
    })
    return { items: data.data, meta: data.meta }
  },

  async getById(id: string): Promise<AdminUser> {
    const { data } = await apiClient.get<ApiEnvelope<AdminUser>>(`/users/${id}`)
    return data.data
  },

  async create(input: AdminUserInput): Promise<AdminUser> {
    const { data } = await apiClient.post<ApiEnvelope<AdminUser>>(
      '/users',
      input
    )
    return data.data
  },

  async update(id: string, input: Partial<AdminUserInput>): Promise<AdminUser> {
    const { data } = await apiClient.put<ApiEnvelope<AdminUser>>(
      `/users/${id}`,
      input
    )
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`)
  },
}
