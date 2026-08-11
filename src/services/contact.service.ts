import { apiClient } from '@/lib/api-client'
import {
  type ApiEnvelope,
  type ContactMessage,
  type ListQuery,
  type Paginated,
} from '@/types/api'

/**
 * Contact inbox. Note the real backend routes live under /contact/messages:
 *  - GET    /contact/messages
 *  - GET    /contact/messages/:id   (viewing marks it read)
 *  - PATCH  /contact/messages/:id/read
 *  - DELETE /contact/messages/:id
 */
export const contactService = {
  async list(params: ListQuery = {}): Promise<Paginated<ContactMessage>> {
    const { data } = await apiClient.get<ApiEnvelope<ContactMessage[]>>(
      '/contact/messages',
      { params }
    )
    return { items: data.data, meta: data.meta }
  },

  async view(id: string): Promise<ContactMessage> {
    const { data } = await apiClient.get<ApiEnvelope<ContactMessage>>(
      `/contact/messages/${id}`
    )
    return data.data
  },

  async markRead(id: string, isRead: boolean): Promise<ContactMessage> {
    const { data } = await apiClient.patch<ApiEnvelope<ContactMessage>>(
      `/contact/messages/${id}/read`,
      { isRead }
    )
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/contact/messages/${id}`)
  },
}
