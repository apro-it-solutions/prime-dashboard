import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { isNetworkError } from '@/lib/api-client'
import {
  authService,
  type LoginCredentials,
  type RegisterPayload,
} from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth-store'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

/**
 * POST /auth/register — creates the account, stores the returned session, then
 * redirects into the dashboard. Mirrors `useLogin` because the backend returns
 * the same token/profile payload for both.
 */
export function useRegister(redirectTo?: string) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.auth.setUser)
  const setAccessToken = useAuthStore((s) => s.auth.setAccessToken)

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      setUser(data.user)
      queryClient.setQueryData(authKeys.me, data.user)
      toast.success(`Welcome to Prime, ${data.user.name}!`)
      navigate({ to: redirectTo || '/', replace: true })
    },
    // SignUpForm renders failures itself — per-field where the API names a
    // field, otherwise above the submit button. Overriding the app-wide
    // mutation error toast (see main.tsx) keeps one failure from being
    // reported twice.
    onError: () => {},
  })
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
 *
 * Runs once per session and only when an access token is present: `enabled`
 * gates it on the token and the 5 minute `staleTime` keeps remounts and window
 * focus from re-firing it, so this never becomes a polling loop.
 *
 * A rejected token (401/403) must not be retried — the axios interceptor already
 * attempts a single refresh, and retrying past that would hammer the API while
 * the session is dead. One retry is allowed for a genuine network failure
 * (timeout/DNS/offline) so a brief blip does not strand the dashboard.
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
    retry: (failureCount, error) => failureCount < 1 && isNetworkError(error),
    retryDelay: 1000,
  })
}

/**
 * POST /auth/forgot-password — requests a reset link.
 *
 * The API answers 200 for unknown emails too (it will not disclose whether an
 * account exists), so success here means "request accepted", not "email found".
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    // ForgotPasswordForm renders both outcomes inline, so opt out of the
    // app-wide mutation error toast (see main.tsx).
    onError: () => {},
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
