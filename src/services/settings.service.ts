import { apiClient } from '@/lib/api-client'
import { type ApiEnvelope, type Settings, type SettingsInput } from '@/types/api'

export const settingsService = {
  async get(): Promise<Settings> {
    const { data } = await apiClient.get<ApiEnvelope<Settings>>('/settings')
    return data.data
  },

  async update(input: SettingsInput): Promise<Settings> {
    const { data } = await apiClient.put<ApiEnvelope<Settings>>('/settings', input)
    return data.data
  },
}
