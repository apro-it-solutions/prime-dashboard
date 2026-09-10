import { apiClient } from '@/lib/api-client'
import {
  type ApiEnvelope,
  type ListQuery,
  type Paginated,
  type Subscriber,
  type SubscriberStatus,
} from '@/types/api'

/**
 * Newsletter subscribers.
 *
 * The collection is filled by the public sign-up endpoints the website calls
 * (the home-page form and the blog's newsletter box, which share one list); the
 * dashboard only ever reads it and flips or removes a row, which is why there
 * is no create here.
 *  - GET    /subscriptions
 *  - PATCH  /subscriptions/:id   ({ status })
 *  - DELETE /subscriptions/:id
 */
export const subscriptionService = {
  async list(params: ListQuery = {}): Promise<Paginated<Subscriber>> {
    const { data } = await apiClient.get<ApiEnvelope<Subscriber[]>>(
      '/subscriptions',
      { params }
    )
    return { items: data.data, meta: data.meta }
  },

  async setStatus(id: string, status: SubscriberStatus): Promise<Subscriber> {
    const { data } = await apiClient.patch<ApiEnvelope<Subscriber>>(
      `/subscriptions/${id}`,
      { status }
    )
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/subscriptions/${id}`)
  },
}
