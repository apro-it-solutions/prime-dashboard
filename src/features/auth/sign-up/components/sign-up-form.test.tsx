import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { SignUpForm } from './sign-up-form'

const FORM_MESSAGES = {
  nameEmpty: 'Please enter your full name.',
  emailEmpty: 'Please enter your email.',
  emailInvalid: 'Enter a valid email address.',
  passwordEmpty: 'Please enter your password.',
  passwordTooShort: 'Password must be at least 8 characters.',
} as const

const VALID = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'Str0ng@Pass',
} as const

const mutate = vi.hoisted(() => vi.fn())
const registerState = vi.hoisted(() => ({ isPending: false, isSuccess: false }))

vi.mock('@/hooks/use-auth', () => ({
  useRegister: () => ({
    mutate,
    isPending: registerState.isPending,
    isSuccess: registerState.isSuccess,
  }),
}))

describe('SignUpForm', () => {
  let screen: RenderResult
  let name: Locator
  let email: Locator
  let password: Locator
  let submitButton: Locator

  const mount = async () => {
    screen = await render(<SignUpForm />)
    name = screen.getByRole('textbox', { name: /^Full name$/i })
    email = screen.getByRole('textbox', { name: /^Email$/i })
    password = screen.getByLabelText(/^Password$/i)
    // The label swaps to "Creating account…" while the request is in flight.
    submitButton = screen.getByRole('button', { name: /^Creat(e|ing) account/i })
  }

  const fillValid = async () => {
    await userEvent.fill(name, VALID.name)
    await userEvent.fill(email, VALID.email)
    await userEvent.fill(password, VALID.password)
  }

  // Each test mounts explicitly so the "disabled" cases can set the mutation
  // state before the first render.
  beforeEach(() => {
    vi.clearAllMocks()
    registerState.isPending = false
    registerState.isSuccess = false
  })

  it('renders the three fields from the design, and no others', async () => {
    await mount()

    for (const field of [name, email, password, submitButton]) {
      await expect.element(field).toBeInTheDocument()
    }
    // The design has no confirm-password / phone / split-name fields.
    expect(screen.container.querySelectorAll('input')).toHaveLength(3)
  })

  it('shows a validation message for every required field', async () => {
    await mount()

    await userEvent.click(submitButton)

    for (const message of [
      FORM_MESSAGES.nameEmpty,
      FORM_MESSAGES.emailEmpty,
      FORM_MESSAGES.passwordEmpty,
    ]) {
      await expect.element(screen.getByText(message)).toBeInTheDocument()
    }
    expect(mutate).not.toHaveBeenCalled()
  })

  it('rejects a malformed email', async () => {
    await mount()
    await fillValid()
    await userEvent.fill(email, 'not-an-email')

    await userEvent.click(submitButton)

    await expect
      .element(screen.getByText(FORM_MESSAGES.emailInvalid))
      .toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('rejects a password shorter than the backend minimum', async () => {
    await mount()
    await fillValid()
    await userEvent.fill(password, 'short7')

    await userEvent.click(submitButton)

    await expect
      .element(screen.getByText(FORM_MESSAGES.passwordTooShort))
      .toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('submits trimmed values once the form is valid', async () => {
    await mount()
    await fillValid()
    await userEvent.fill(name, '  Jane Doe  ')

    await userEvent.click(submitButton)

    await vi.waitFor(() => expect(mutate).toHaveBeenCalledOnce())
    expect(mutate.mock.calls[0][0]).toEqual(VALID)
  })

  it('toggles password visibility, starting hidden', async () => {
    await mount()

    await expect.element(password).toHaveAttribute('type', 'password')

    const toggle = screen.getByRole('button', { name: /show password/i })
    await userEvent.click(toggle)
    await expect.element(password).toHaveAttribute('type', 'text')

    await userEvent.click(screen.getByRole('button', { name: /hide password/i }))
    await expect.element(password).toHaveAttribute('type', 'password')
  })

  it('disables the submit button while the request is in flight', async () => {
    registerState.isPending = true
    await mount()

    await expect.element(submitButton).toBeDisabled()
  })

  it('keeps the submit button disabled after success, through the redirect', async () => {
    registerState.isSuccess = true
    await mount()

    await expect.element(submitButton).toBeDisabled()
  })
})
