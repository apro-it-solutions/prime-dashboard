import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import {
  type ApiEnvelope,
  type ApiErrorBody,
  type LoginResponse,
} from '@/types/api'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Base URL of the Prime NMS backend. Always comes from VITE_API_URL so the same
 * bundle can target staging/production; the literal below is only a last-resort
 * fallback so a missing env var in a deploy degrades to the real API instead of
 * silently pointing the browser at a localhost port that will never answer.
 */
const FALLBACK_API_URL = 'https://prime-backend.aproitsolutions.in/api/v1'

const BASE_URL = import.meta.env.VITE_API_URL ?? FALLBACK_API_URL

if (!import.meta.env.VITE_API_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    `[api] VITE_API_URL is not set - falling back to ${FALLBACK_API_URL}. ` +
      'Set it in .env locally and in the hosting provider environment variables.'
  )
}

/**
 * Hard ceiling on a single request. Without it axios waits on the browser's own
 * (multi-minute) socket timeout, so an unreachable backend leaves the dashboard
 * spinning instead of failing fast enough for the UI to offer a retry.
 */
const REQUEST_TIMEOUT_MS = 15_000

/**
 * Central axios instance for the Prime NMS backend.
 * - `withCredentials` so the httpOnly refresh-token cookie is sent to /auth/refresh.
 * - Request interceptor attaches the Bearer access token from the auth store.
 * - Response interceptor transparently refreshes an expired access token once,
 *   then replays the original request.
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// A bare axios call (no interceptors) used for refresh to avoid recursion.
async function requestNewAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post<ApiEnvelope<LoginResponse>>(
      `${BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true, timeout: REQUEST_TIMEOUT_MS }
    )
    const token = data.data?.accessToken
    if (token) {
      useAuthStore.getState().auth.setAccessToken(token)
      return token
    }
    return null
  } catch {
    return null
  }
}

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean }

// Ensure concurrent 401s trigger only a single refresh.
let refreshPromise: Promise<string | null> | null = null

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const url = original?.url ?? ''

    // Only try to refresh on a 401 that isn't itself an auth call, once.
    const isAuthCall =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh')
    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true

      if (!refreshPromise) {
        refreshPromise = requestNewAccessToken().finally(() => {
          refreshPromise = null
        })
      }
      const newToken = await refreshPromise

      if (newToken) {
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${newToken}`,
        }
        return apiClient(original)
      }
      // Refresh failed: drop the session. The query cache onError in main.tsx
      // handles the redirect to /sign-in.
      useAuthStore.getState().auth.reset()
    }

    return Promise.reject(error)
  }
)

/** HTTP status from an axios failure, or undefined if it never got a response. */
export function getErrorStatus(error: unknown): number | undefined {
  return error instanceof AxiosError ? error.response?.status : undefined
}

/**
 * Seconds to wait after a 429.
 *
 * `RateLimit-Reset` is preferred because it counts down to the moment the
 * window actually reopens, whereas `Retry-After` is the full window length no
 * matter how much of it has already elapsed. Both are only readable when the
 * API exposes them through CORS; otherwise this is undefined and the caller
 * falls back to a generic message.
 */
export function getRetryAfterSeconds(error: unknown): number | undefined {
  if (!(error instanceof AxiosError)) return undefined
  const headers = error.response?.headers
  for (const name of ['ratelimit-reset', 'retry-after']) {
    const seconds = Number(headers?.[name])
    if (Number.isFinite(seconds) && seconds > 0) return Math.ceil(seconds)
  }
  return undefined
}

/** Message for a 429, naming the wait when the API tells us how long it is. */
export function getRateLimitMessage(error: unknown): string {
  const seconds = getRetryAfterSeconds(error)
  if (!seconds) return 'Too many requests. Please wait a moment and try again.'

  if (seconds < 60) return `Too many requests. Try again in ${seconds}s.`
  const minutes = Math.ceil(seconds / 60)
  return `Too many requests. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
}

/**
 * True when the request never reached the backend (timeout, DNS failure, TLS
 * failure, offline, CORS rejection) - i.e. there is no HTTP status to react to.
 * These are the only failures worth retrying; a 4xx/5xx will fail identically.
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof AxiosError && !error.response
}

/**
 * Extract the backend's per-field validation details from an axios error.
 * The API returns `{ errors: [{ field, message }] }` for 400/409 responses,
 * which lets a form attach the message to the offending input.
 */
export function getApiFieldErrors(
  error: unknown
): { field: string; message: string }[] {
  if (!(error instanceof AxiosError)) return []
  const body = error.response?.data as ApiErrorBody | undefined
  if (!Array.isArray(body?.errors)) return []
  return body.errors.flatMap((detail) =>
    detail?.field && detail?.message
      ? [{ field: detail.field, message: detail.message }]
      : []
  )
}

/** Extract a human-readable message from an axios error's response body. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isNetworkError(error)) {
    return 'Could not reach the server. Check your connection and try again.'
  }
  if (error instanceof AxiosError) {
    const body = error.response?.data as
      | { message?: string; errors?: { message?: string }[] }
      | undefined
    if (body?.errors?.length && body.errors[0]?.message) return body.errors[0].message
    if (body?.message) return body.message
    if (error.message) return error.message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
