import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { blogCategoryService } from '@/services/blog-category.service'
import { type BlogCategoryInput, type ListQuery } from '@/types/api'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-client'

/**
 * Query keys for blog categories. Kept under their own root ('blog-categories')
 * so invalidating product or project categories never refetches these, and vice
 * versa.
 */
export const blogCategoryKeys = {
  all: ['blog-categories'] as const,
  list: (params: ListQuery) => ['blog-categories', 'list', params] as const,
  detail: (id: string) => ['blog-categories', 'detail', id] as const,
}

/** GET /blog-categories */
export function useBlogCategories(params: ListQuery = {}) {
  return useQuery({
    queryKey: blogCategoryKeys.list(params),
    queryFn: () => blogCategoryService.list(params),
    placeholderData: keepPreviousData,
  })
}

/** POST /blog-categories */
export function useCreateBlogCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BlogCategoryInput) => blogCategoryService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogCategoryKeys.all })
      toast.success('Blog category created')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** PUT /blog-categories/:id */
export function useUpdateBlogCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: Partial<BlogCategoryInput>
    }) => blogCategoryService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogCategoryKeys.all })
      toast.success('Blog category updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** DELETE /blog-categories/:id */
export function useDeleteBlogCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => blogCategoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogCategoryKeys.all })
      toast.success('Blog category deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
