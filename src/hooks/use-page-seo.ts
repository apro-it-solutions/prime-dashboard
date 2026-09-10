import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pageSeoService } from '@/services/page-seo.service'
import { type PageSeoKey, type SeoMeta } from '@/types/api'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-client'

export const pageSeoKeys = {
  page: (page: PageSeoKey) => ['page-seo', page] as const,
}

/** GET /page-seo/:page */
export function usePageSeo(page: PageSeoKey) {
  return useQuery({
    queryKey: pageSeoKeys.page(page),
    queryFn: () => pageSeoService.get(page),
  })
}

/** PUT /page-seo/:page */
export function useUpdatePageSeo(page: PageSeoKey) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (seo: SeoMeta) => pageSeoService.update(page, seo),
    onSuccess: (data) => {
      queryClient.setQueryData(pageSeoKeys.page(page), data)
      toast.success('SEO updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
