import { AuthBackRow } from '../components/auth-actions'
import { AuthShell } from '../components/auth-shell'
import { ForgotPasswordForm } from './components/forgot-password-form'

/**
 * Forgot password screen (Figma: prime-NMS, node 809:571).
 *
 * Same frame, palette and controls as the Sign In (800:553) and Create account
 * (809:535) designs. The design's only navigation is the "Back to sign in" row —
 * no Google button, no sign-up link.
 */
export function ForgotPassword() {
  return (
    <AuthShell
      title='Forgot password?'
      subtitle="Enter your email and we'll send you a reset link."
      glow={{ left: 1084, top: 231 }}
      footer={<AuthBackRow to='/sign-in'>Back to sign in</AuthBackRow>}
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
