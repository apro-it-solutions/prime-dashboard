import { apiClient } from '@/lib/api-client'
import { type ApiEnvelope, type DashboardStats } from '@/types/api'

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<ApiEnvelope<DashboardStats>>(
      '/dashboard/stats'
    )
    return data.data
  },
}
