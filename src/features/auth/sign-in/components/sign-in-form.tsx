import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useLogin } from '@/hooks/use-auth'
import { getApiErrorMessage } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { Form } from '@/components/ui/form'
import {
  AuthForgotRow,
  AuthFormError,
  AuthSubmitButton,
} from '../../components/auth-actions'
import { AuthPasswordField, AuthTextField } from '../../components/auth-fields'
import { AUTH_FORM_GAP } from '../../components/auth-styles'

/**
 * Fields, labels, placeholders and ordering come from the Figma `Form` node
 * (800:553 → 809:446): Email, Password, the end-aligned Forgot Password row,
 * then the primary button.
 *
 * The design's trailing OR divider and Google button were dropped by request —
 * the form ends at the submit button. Those controls still live in
 * `auth-actions` for the Create account screen.
 */
const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email.' : undefined),
  }),
  password: z.string().min(1, 'Please enter your password.'),
})

type SignInValues = z.infer<typeof formSchema>

interface SignInFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function SignInForm({
  className,
  redirectTo,
  ...props
}: SignInFormProps) {
  const login = useLogin(redirectTo)

  // Stays disabled through the post-success redirect so the form cannot be
  // submitted twice.
  const isSubmitting = login.isPending || login.isSuccess

  function onSubmit(values: SignInValues) {
    if (isSubmitting) return
    login.mutate(values)
  }

  const form = useForm<SignInValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className={cn('flex w-full flex-col', AUTH_FORM_GAP, className)}
        {...props}
      >
        <AuthTextField<SignInValues>
          name='email'
          label='Email'
          type='email'
          inputMode='email'
          placeholder='Enter your email address'
          autoComplete='email'
          disabled={isSubmitting}
        />

        <AuthPasswordField<SignInValues>
          name='password'
          label='Password'
          placeholder='Password'
          autoComplete='current-password'
          disabled={isSubmitting}
        />

        <AuthForgotRow>
          <Link
            to='/forgot-password'
            className='text-[12.5px] font-medium text-[#5b616e] underline-offset-4 hover:text-[#1a1d24] hover:underline'
          >
            Forgot Password?
          </Link>
        </AuthForgotRow>

        {login.isError && (
          <AuthFormError
            message={getApiErrorMessage(login.error, 'Invalid email or password')}
          />
        )}

        <AuthSubmitButton isPending={isSubmitting} pendingLabel='Signing in…'>
          Sign in
        </AuthSubmitButton>
      </form>
    </Form>
  )
}
