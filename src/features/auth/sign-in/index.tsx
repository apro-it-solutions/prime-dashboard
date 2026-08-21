import { useSearch } from '@tanstack/react-router'
import { AuthShell } from '../components/auth-shell'
import { SignInForm } from './components/sign-in-form'

/**
 * Sign In screen (Figma: prime-NMS, node 800:553).
 *
 * Shares its frame, palette and controls with the Create account design
 * (809:535) via the components in `features/auth/components`.
 *
 * The design's footer ("Don't have an account? Sign up") was dropped by request,
 * so the card ends after the form. `AuthShell` renders no footer element when
 * the prop is omitted — there is no empty container or residual gap left behind.
 */
export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthShell
      title='Sign In'
      subtitle='Please enter your details to sign in.'
      glow={{ left: 1101, top: 132 }}
    >
      <SignInForm redirectTo={redirect} />
    </AuthShell>
  )
}
