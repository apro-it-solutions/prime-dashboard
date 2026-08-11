import { apiClient } from '@/lib/api-client'
import { type ApiEnvelope, type AuthUser, type LoginResponse } from '@/types/api'

export interface LoginCredentials {
  email: string
  password: string
}

export const authService = {
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
}
