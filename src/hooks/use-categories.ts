import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { categoryService } from '@/services/category.service'
import { getApiErrorMessage } from '@/lib/api-client'
import { type CategoryInput, type ListQuery } from '@/types/api'

export const categoryKeys = {
  all: ['categories'] as const,
  list: (params: ListQuery) => ['categories', 'list', params] as const,
  detail: (id: string) => ['categories', 'detail', id] as const,
}

/** GET /categories */
export function useCategories(params: ListQuery = {}) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryService.list(params),
    placeholderData: keepPreviousData,
  })
}

/** POST /categories */
export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CategoryInput) => categoryService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Category created')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** PUT /categories/:id */
export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) =>
      categoryService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Category updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** DELETE /categories/:id */
export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Category deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
