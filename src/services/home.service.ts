import { apiClient } from '@/lib/api-client'
import { type ApiEnvelope, type HomePage, type HomePageInput } from '@/types/api'

export const homeService = {
  async get(): Promise<HomePage> {
    const { data } = await apiClient.get<ApiEnvelope<HomePage>>('/home')
    return data.data
  },

  async update(input: HomePageInput): Promise<HomePage> {
    const { data } = await apiClient.put<ApiEnvelope<HomePage>>('/home', input)
    return data.data
  },
}
