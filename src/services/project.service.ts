import { apiClient } from '@/lib/api-client'
import {
  type ApiEnvelope,
  type ListQuery,
  type Paginated,
  type Project,
  type ProjectInput,
} from '@/types/api'

/**
 * Projects CMS. The dashboard always reads through `/projects/admin` so drafts
 * and archived records are included; the public site uses `GET /projects`.
 */
export const projectService = {
  async list(params: ListQuery = {}): Promise<Paginated<Project>> {
    const { data } = await apiClient.get<ApiEnvelope<Project[]>>(
      '/projects/admin',
      { params }
    )
    return { items: data.data, meta: data.meta }
  },

  async getById(id: string): Promise<Project> {
    const { data } = await apiClient.get<ApiEnvelope<Project>>(`/projects/${id}`)
    return data.data
  },

  async create(input: ProjectInput): Promise<Project> {
    const { data } = await apiClient.post<ApiEnvelope<Project>>(
      '/projects',
      input
    )
    return data.data
  },

  async update(id: string, input: Partial<ProjectInput>): Promise<Project> {
    const { data } = await apiClient.patch<ApiEnvelope<Project>>(
      `/projects/${id}`,
      input
    )
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`)
  },
}
