import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { ForgotPasswordForm } from './forgot-password-form'

const SUCCESS_MESSAGE = 'If the email exists, a reset link has been sent'

const mutate = vi.hoisted(() => vi.fn())
const state = vi.hoisted(() => ({
  isPending: false,
  isSuccess: false,
  data: undefined as { message: string } | undefined,
}))

vi.mock('@/hooks/use-auth', () => ({
  useForgotPassword: () => ({
    mutate,
    isPending: state.isPending,
    isSuccess: state.isSuccess,
    data: state.data,
  }),
}))

describe('ForgotPasswordForm', () => {
  let screen: RenderResult
  let email: Locator
  let submitButton: Locator

  const mount = async () => {
    screen = await render(<ForgotPasswordForm />)
    email = screen.getByRole('textbox', { name: /^Email$/i })
    // The label swaps to "Sending…" while the request is in flight.
    submitButton = screen.getByRole('button', { name: /^(Send reset link|Sending)/i })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    state.isPending = false
    state.isSuccess = false
    state.data = undefined
  })

  it('renders only the email field and the submit button', async () => {
    await mount()

    await expect.element(email).toBeInTheDocument()
    await expect.element(submitButton).toBeInTheDocument()
    expect(screen.container.querySelectorAll('input')).toHaveLength(1)
    // The design has no Google button or divider on this screen.
    expect(screen.container.textContent).not.toMatch(/Continue with Google|\bOR\b/)
  })

  it('requires an email', async () => {
    await mount()

    await userEvent.click(submitButton)

    await expect
      .element(screen.getByText('Please enter your email.'))
      .toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('rejects a malformed email', async () => {
    await mount()
    await userEvent.fill(email, 'not-an-email')

    await userEvent.click(submitButton)

    await expect
      .element(screen.getByText('Enter a valid email address.'))
      .toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('submits the email to the forgot-password mutation', async () => {
    await mount()
    await userEvent.fill(email, 'a@b.com')

    await userEvent.click(submitButton)

    await vi.waitFor(() => expect(mutate).toHaveBeenCalledOnce())
    expect(mutate.mock.calls[0][0]).toBe('a@b.com')
  })

  it("shows the API's own wording on success, without claiming the account exists", async () => {
    state.isSuccess = true
    state.data = { message: SUCCESS_MESSAGE }
    await mount()

    await expect
      .element(screen.getByRole('status'))
      .toHaveTextContent(SUCCESS_MESSAGE)
  })

  it('disables the submit button while the request is in flight', async () => {
    state.isPending = true
    await mount()

    await expect.element(submitButton).toBeDisabled()
  })
})
