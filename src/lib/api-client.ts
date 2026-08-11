import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { type ApiEnvelope, type LoginResponse } from '@/types/api'
import { useAuthStore } from '@/stores/auth-store'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api/v1'

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
      { withCredentials: true }
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
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/refresh')
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

/** Extract a human-readable message from an axios error's response body. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
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
