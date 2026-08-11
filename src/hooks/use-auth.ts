import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { authService, type LoginCredentials } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth-store'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

/** POST /auth/login — stores token + user, then redirects. */
export function useLogin(redirectTo?: string) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.auth.setUser)
  const setAccessToken = useAuthStore((s) => s.auth.setAccessToken)

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      setUser(data.user)
      queryClient.setQueryData(authKeys.me, data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate({ to: redirectTo || '/', replace: true })
    },
    // The error is surfaced inline below the Sign In button (see UserAuthForm),
    // so no toast here to avoid duplicate messaging.
  })
}

/**
 * GET /auth/me — hydrates the signed-in admin.
 * Only runs when an access token is present. Keeps the auth store user in sync.
 */
export function useMe() {
  const accessToken = useAuthStore((s) => s.auth.accessToken)
  const setUser = useAuthStore((s) => s.auth.setUser)

  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const user = await authService.me()
      setUser(user)
      return user
    },
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

/** POST /auth/logout — revokes the refresh token and clears local session. */
export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const reset = useAuthStore((s) => s.auth.reset)

  return useMutation({
    mutationFn: () => authService.logout(),
    // Always clear the client session, even if the request fails.
    onSettled: () => {
      reset()
      queryClient.clear()
      toast.success('Signed out successfully')
      navigate({ to: '/sign-in', replace: true })
    },
  })
}
