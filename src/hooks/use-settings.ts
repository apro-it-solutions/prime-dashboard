import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { settingsService } from '@/services/settings.service'
import { getApiErrorMessage } from '@/lib/api-client'
import { type SettingsInput } from '@/types/api'

export const settingsKeys = {
  all: ['settings'] as const,
}

/** GET /settings */
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => settingsService.get(),
  })
}

/** PUT /settings */
export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SettingsInput) => settingsService.update(input),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.all, data)
      toast.success('Settings updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
