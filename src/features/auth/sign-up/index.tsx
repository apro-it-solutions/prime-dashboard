import { Link } from '@tanstack/react-router'
import { AuthFooterRow } from '../components/auth-actions'
import { AuthShell } from '../components/auth-shell'
import { SignUpForm } from './components/sign-up-form'

/**
 * Create-account screen (Figma: prime-NMS, node 809:535).
 *
 * Shares its frame, palette and controls with the Sign In design (node 800:553)
 * via the components in `features/auth/components`.
 */
export function SignUp() {
  return (
    <AuthShell
      title='Create account'
      subtitle='Enter your details to get started.'
      footer={
        <AuthFooterRow>
          <span className='text-[#5b616e]'>Already have an account?</span>
          <Link
            to='/sign-in'
            className='font-semibold text-[#1a1d24] underline-offset-4 hover:underline'
          >
            Sign in
          </Link>
        </AuthFooterRow>
      }
    >
      <SignUpForm />
    </AuthShell>
  )
}
