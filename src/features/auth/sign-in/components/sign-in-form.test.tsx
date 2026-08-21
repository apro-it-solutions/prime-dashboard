import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { SignInForm } from './sign-in-form'

const FORM_MESSAGES = {
  emailEmpty: 'Please enter your email.',
  passwordEmpty: 'Please enter your password.',
} as const

const mutate = vi.hoisted(() => vi.fn())
const loginState = vi.hoisted(() => ({
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null as unknown,
}))

vi.mock('@/hooks/use-auth', () => ({
  useLogin: () => ({ mutate, ...loginState }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    Link: ({
      children,
      to,
      className,
      ...rest
    }: {
      children?: React.ReactNode
      to: string
      className?: string
    }) => (
      <a href={to} className={className} {...rest}>
        {children}
      </a>
    ),
  }
})

describe('SignInForm', () => {
  let screen: RenderResult
  let email: Locator
  let password: Locator
  let submitButton: Locator

  const mount = async () => {
    screen = await render(<SignInForm />)
    email = screen.getByRole('textbox', { name: /^Email$/i })
    password = screen.getByLabelText(/^Password$/i)
    // The label swaps to "Signing in…" while the request is in flight.
    submitButton = screen.getByRole('button', { name: /^Sign(ing)? in/i })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    loginState.isPending = false
    loginState.isSuccess = false
    loginState.isError = false
    loginState.error = null
  })

  it('renders the two fields from the design, and no others', async () => {
    await mount()

    await expect.element(email).toBeInTheDocument()
    await expect.element(password).toBeInTheDocument()
    await expect.element(submitButton).toBeInTheDocument()
    expect(screen.container.querySelectorAll('input')).toHaveLength(2)
  })

  it('renders no OR divider and no Google button', async () => {
    await mount()

    expect(screen.container.textContent).not.toMatch(/\bOR\b/)
    expect(screen.container.textContent).not.toMatch(/Continue with Google/i)
    // Submit is the only button besides the password toggle.
    expect(screen.container.querySelectorAll('button')).toHaveLength(2)
  })

  it('links Forgot Password to the reset flow', async () => {
    await mount()

    const link = screen.getByRole('link', { name: /^Forgot Password\?$/i })
    await expect.element(link).toBeInTheDocument()
    await expect.element(link).toHaveAttribute('href', '/forgot-password')
  })

  it('shows validation messages when submitting an empty form', async () => {
    await mount()

    await userEvent.click(submitButton)

    await expect
      .element(screen.getByText(FORM_MESSAGES.emailEmpty))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(FORM_MESSAGES.passwordEmpty))
      .toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('submits the credentials to the login mutation', async () => {
    await mount()

    await userEvent.fill(email, 'a@b.com')
    await userEvent.fill(password, 'Admin@12345')
    await userEvent.click(submitButton)

    await vi.waitFor(() => expect(mutate).toHaveBeenCalledOnce())
    expect(mutate).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'Admin@12345',
    })
  })

  it('toggles password visibility, starting hidden', async () => {
    await mount()

    await expect.element(password).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: /show password/i }))
    await expect.element(password).toHaveAttribute('type', 'text')
  })

  it('surfaces an API error inline', async () => {
    loginState.isError = true
    loginState.error = new Error('Invalid email or password')
    await mount()

    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Invalid email or password')
  })

  it('disables the submit button while the request is in flight', async () => {
    loginState.isPending = true
    await mount()

    await expect.element(submitButton).toBeDisabled()
  })
})
