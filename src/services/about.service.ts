import { apiClient } from '@/lib/api-client'
import { type AboutPage, type AboutPageInput, type ApiEnvelope } from '@/types/api'

export const aboutService = {
  async get(): Promise<AboutPage> {
    const { data } = await apiClient.get<ApiEnvelope<AboutPage>>('/about')
    return data.data
  },

  async update(input: AboutPageInput): Promise<AboutPage> {
    const { data } = await apiClient.put<ApiEnvelope<AboutPage>>('/about', input)
    return data.data
  },
}
