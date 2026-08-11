import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { blogService } from '@/services/blog.service'
import { getApiErrorMessage } from '@/lib/api-client'
import { type BlogInput, type ListQuery } from '@/types/api'

export const blogKeys = {
  all: ['blogs'] as const,
  list: (params: ListQuery) => ['blogs', 'list', params] as const,
  detail: (id: string) => ['blogs', 'detail', id] as const,
}

/** GET /blogs */
export function useBlogs(params: ListQuery = {}) {
  return useQuery({
    queryKey: blogKeys.list(params),
    queryFn: () => blogService.list(params),
    placeholderData: keepPreviousData,
  })
}

/** GET /blogs/:id — single blog, used by the edit page. */
export function useBlog(id: string | undefined) {
  return useQuery({
    queryKey: blogKeys.detail(id ?? ''),
    queryFn: () => blogService.getById(id as string),
    enabled: Boolean(id),
  })
}

/** POST /blogs */
export function useCreateBlog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BlogInput) => blogService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
      toast.success('Blog post created')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** PUT /blogs/:id */
export function useUpdateBlog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<BlogInput> }) =>
      blogService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
      toast.success('Blog post updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** DELETE /blogs/:id */
export function useDeleteBlog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => blogService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
      toast.success('Blog post deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
