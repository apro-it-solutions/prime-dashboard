import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { projectService } from '@/services/project.service'
import { getApiErrorMessage } from '@/lib/api-client'
import { type ListQuery, type ProjectInput } from '@/types/api'

export const projectKeys = {
  all: ['projects'] as const,
  list: (params: ListQuery) => ['projects', 'list', params] as const,
  detail: (id: string) => ['projects', 'detail', id] as const,
}

/** GET /projects/admin */
export function useProjects(params: ListQuery = {}) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectService.list(params),
    placeholderData: keepPreviousData,
  })
}

/** GET /projects/:id — single project, used by the edit page. */
export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ''),
    queryFn: () => projectService.getById(id as string),
    enabled: Boolean(id),
  })
}

/** POST /projects */
export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectInput) => projectService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      toast.success('Project created')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** PATCH /projects/:id */
export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProjectInput> }) =>
      projectService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      toast.success('Project updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** DELETE /projects/:id */
export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      toast.success('Project deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
