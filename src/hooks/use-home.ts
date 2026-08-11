import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { homeService } from '@/services/home.service'
import { getApiErrorMessage } from '@/lib/api-client'
import { type HomePageInput } from '@/types/api'

export const homeKeys = {
  content: ['home'] as const,
}

/** GET /home */
export function useHome() {
  return useQuery({
    queryKey: homeKeys.content,
    queryFn: () => homeService.get(),
  })
}

/** PUT /home */
export function useUpdateHome() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: HomePageInput) => homeService.update(input),
    onSuccess: (data) => {
      queryClient.setQueryData(homeKeys.content, data)
      toast.success('Home page updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
