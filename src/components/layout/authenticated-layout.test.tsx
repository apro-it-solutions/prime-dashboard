import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { AuthenticatedLayout } from './authenticated-layout'

const useMe = vi.fn()
const refetch = vi.fn()

vi.mock('@/hooks/use-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/use-auth')>()
  return { ...actual, useMe: () => useMe() }
})

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    Outlet: () => <div data-testid='outlet'>dashboard</div>,
    Link: ({ children, to }: { children?: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  }
})

/** An axios failure with no response — a timeout/DNS/offline transport error. */
function networkError() {
  return new AxiosError('timeout of 15000ms exceeded', AxiosError.ECONNABORTED, {
    headers: new AxiosHeaders(),
  })
}

describe('AuthenticatedLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a recoverable error instead of spinning forever when the backend is unreachable', async () => {
    useMe.mockReturnValue({
      isLoading: false,
      isError: true,
      error: networkError(),
      refetch,
      isFetching: false,
    })

    const screen = await render(<AuthenticatedLayout />)

    await expect
      .element(screen.getByText(/Can't reach the server/i))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(/Could not reach the server/i))
      .toBeInTheDocument()

    // The dashboard stays gated — a transport failure must not leak content.
    expect(screen.container.querySelector('[data-testid="outlet"]')).toBeNull()
  })

  it('lets the admin retry without signing out again', async () => {
    useMe.mockReturnValue({
      isLoading: false,
      isError: true,
      error: networkError(),
      refetch,
      isFetching: false,
    })

    const screen = await render(<AuthenticatedLayout />)
    await screen.getByRole('button', { name: /Try again/i }).click()

    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('renders the dashboard once the session is verified', async () => {
    useMe.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      refetch,
      isFetching: false,
    })

    const screen = await render(<AuthenticatedLayout />)

    await expect.element(screen.getByTestId('outlet')).toBeInTheDocument()
  })
})
