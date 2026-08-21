import { apiClient } from '@/lib/api-client'
import { type ApiEnvelope, type AuthUser, type LoginResponse } from '@/types/api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface ForgotPasswordResult {
  /** The API's own wording, e.g. "If the email exists, a reset link has been sent". */
  message: string
  /** Non-production only — the backend withholds this in production. */
  resetToken?: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export const authService = {
  /** POST /auth/register — creates the account and returns a signed-in session. */
  async register(payload: RegisterPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiEnvelope<LoginResponse>>(
      '/auth/register',
      payload
    )
    return data.data
  },

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiEnvelope<LoginResponse>>(
      '/auth/login',
      credentials
    )
    return data.data
  },

  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<ApiEnvelope<AuthUser>>('/auth/me')
    return data.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', {})
  },

  /**
   * POST /auth/forgot-password — requests a reset link.
   *
   * The API deliberately answers 200 whether or not the email exists, so the
   * caller must not treat the response as proof of an account. Outside
   * production it also returns the raw `resetToken` to make the flow testable.
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResult> {
    const { data } = await apiClient.post<
      ApiEnvelope<{ resetToken?: string } | null>
    >('/auth/forgot-password', { email })
    return { message: data.message, resetToken: data.data?.resetToken }
  },
}
