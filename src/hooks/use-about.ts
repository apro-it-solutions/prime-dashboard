import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { aboutService } from '@/services/about.service'
import { getApiErrorMessage } from '@/lib/api-client'
import { type AboutPageInput } from '@/types/api'

export const aboutKeys = {
  content: ['about'] as const,
}

/** GET /about */
export function useAbout() {
  return useQuery({
    queryKey: aboutKeys.content,
    queryFn: () => aboutService.get(),
  })
}

/** PUT /about */
export function useUpdateAbout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AboutPageInput) => aboutService.update(input),
    onSuccess: (data) => {
      queryClient.setQueryData(aboutKeys.content, data)
      toast.success('About page updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
