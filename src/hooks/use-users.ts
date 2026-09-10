import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { userService } from '@/services/user.service'
import { getApiErrorMessage } from '@/lib/api-client'
import {
  type AdminUser,
  type AdminUserInput,
  type AdminUserListQuery,
} from '@/types/api'
import { authKeys } from './use-auth'

export const userKeys = {
  all: ['users'] as const,
  list: (params: AdminUserListQuery) => ['users', 'list', params] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
}

/** GET /users */
export function useUsers(params: AdminUserListQuery = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.list(params),
    placeholderData: keepPreviousData,
  })
}

/** POST /users */
export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AdminUserInput) => userService.create(input),
    onSuccess: (user: AdminUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      toast.success(`${user.name} added`)
    },
    // The dialog renders per-field failures itself (a duplicate email lands on
    // the email input), so opt out of the app-wide mutation error toast.
    onError: () => {},
  })
}

/** PUT /users/:id */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AdminUserInput> }) =>
      userService.update(id, input),
    onSuccess: (user: AdminUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      // An administrator can edit their own name or email here, so refresh the
      // signed-in profile too rather than leave a stale name in the sidebar.
      queryClient.invalidateQueries({ queryKey: authKeys.me })
      toast.success(`${user.name} updated`)
    },
    onError: () => {},
  })
}

/**
 * PUT /users/:id, used by the activate/deactivate switch.
 *
 * Split from `useUpdateUser` because it is fire-and-forget from a table row:
 * there is no form to attach a failure to, so it toasts both outcomes.
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.update(id, { isActive }),
    onSuccess: (user: AdminUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      toast.success(user.isActive ? `${user.name} activated` : `${user.name} deactivated`)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** DELETE /users/:id */
export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      toast.success('User deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
