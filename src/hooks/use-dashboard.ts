import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard.service'

export const dashboardKeys = {
  stats: ['dashboard', 'stats'] as const,
}

/** GET /dashboard/stats */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: () => dashboardService.getStats(),
  })
}
