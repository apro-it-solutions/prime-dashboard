import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { projectCategoryService } from '@/services/project-category.service'
import { type ListQuery, type ProjectCategoryInput } from '@/types/api'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-client'

/**
 * Query keys for project categories. Kept under their own root ('project-categories')
 * so invalidating blog/product categories never refetches these, and vice versa.
 */
export const projectCategoryKeys = {
  all: ['project-categories'] as const,
  list: (params: ListQuery) => ['project-categories', 'list', params] as const,
  detail: (id: string) => ['project-categories', 'detail', id] as const,
}

/** GET /project-categories */
export function useProjectCategories(params: ListQuery = {}) {
  return useQuery({
    queryKey: projectCategoryKeys.list(params),
    queryFn: () => projectCategoryService.list(params),
    placeholderData: keepPreviousData,
  })
}

/** POST /project-categories */
export function useCreateProjectCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectCategoryInput) =>
      projectCategoryService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectCategoryKeys.all })
      toast.success('Project category created')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** PUT /project-categories/:id */
export function useUpdateProjectCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: Partial<ProjectCategoryInput>
    }) => projectCategoryService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectCategoryKeys.all })
      toast.success('Project category updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** DELETE /project-categories/:id */
export function useDeleteProjectCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectCategoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectCategoryKeys.all })
      toast.success('Project category deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
