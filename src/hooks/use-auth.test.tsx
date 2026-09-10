import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from 'vitest-browser-react'
import { clearCookies } from '@/test-utils/cookies'
import { useAuthStore } from '@/stores/auth-store'
import { useMe } from './use-auth'

const me = vi.fn()

vi.mock('@/services/auth.service', () => ({
  authService: {
    me: () => me(),
  },
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

const sampleUser = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Test Admin',
  email: 'user@example.com',
  role: 'admin',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

/** An axios failure with no response — a timeout/DNS/offline transport error. */
function networkError() {
  return new AxiosError('timeout of 15000ms exceeded', AxiosError.ECONNABORTED, {
    headers: new AxiosHeaders(),
  })
}

/** An axios failure carrying a real HTTP status from the backend. */
function httpError(status: number) {
  const error = new AxiosError('Request failed', String(status), {
    headers: new AxiosHeaders(),
  })
  error.response = {
    status,
    statusText: '',
    data: {},
    headers: {},
    config: { headers: new AxiosHeaders() },
  }
  return error
}

/** Renders `useMe` and exposes its state so assertions can read it. */
function Probe() {
  const { isPending, isError, isSuccess } = useMe()
  return (
    <div data-testid='state'>
      {isSuccess ? 'success' : isError ? 'error' : isPending ? 'pending' : 'idle'}
    </div>
  )
}

async function renderProbe() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <Probe />
    </QueryClientProvider>
  )
}

describe('useMe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearCookies()
    useAuthStore.getState().auth.reset()
  })

  it('does not call /auth/me at all when there is no access token', async () => {
    const screen = await renderProbe()

    await expect.element(screen.getByTestId('state')).toBeInTheDocument()
    expect(me).not.toHaveBeenCalled()
  })

  it('calls /auth/me exactly once for a signed-in admin', async () => {
    useAuthStore.getState().auth.setAccessToken('valid-token')
    me.mockResolvedValue(sampleUser)

    const screen = await renderProbe()

    await expect.element(screen.getByTestId('state')).toHaveTextContent('success')
    expect(me).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().auth.user).toEqual(sampleUser)
  })

  it('retries a timeout once and then stops, instead of looping', async () => {
    useAuthStore.getState().auth.setAccessToken('valid-token')
    me.mockRejectedValue(networkError())

    const screen = await renderProbe()

    await expect
      .element(screen.getByTestId('state'), { timeout: 10_000 })
      .toHaveTextContent('error')
    expect(me).toHaveBeenCalledTimes(2)
  })

  it('never retries a rejected session (401)', async () => {
    useAuthStore.getState().auth.setAccessToken('expired-token')
    me.mockRejectedValue(httpError(401))

    const screen = await renderProbe()

    await expect
      .element(screen.getByTestId('state'), { timeout: 10_000 })
      .toHaveTextContent('error')
    expect(me).toHaveBeenCalledTimes(1)
  })
})
