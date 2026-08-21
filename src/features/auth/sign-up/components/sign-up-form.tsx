import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRegister } from '@/hooks/use-auth'
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { Form } from '@/components/ui/form'
import {
  AuthDivider,
  AuthFormError,
  AuthGoogleButton,
  AuthSubmitButton,
} from '../../components/auth-actions'
import { AuthPasswordField, AuthTextField } from '../../components/auth-fields'
import { AUTH_FORM_GAP } from '../../components/auth-styles'

/**
 * Fields, labels and placeholders come from the Figma `Form` node (809:615):
 * Full name, Email, Password — one column, 14px apart. Mirrors the backend
 * contract in auth.validation.ts (registerSchema).
 */
const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Please enter your full name.')
    .min(2, 'Your name must be at least 2 characters.')
    .max(120, 'Your name is too long.'),
  email: z.email({
    error: (iss) =>
      iss.input === ''
        ? 'Please enter your email.'
        : 'Enter a valid email address.',
  }),
  password: z
    .string()
    .min(1, 'Please enter your password.')
    .min(8, 'Password must be at least 8 characters.'),
})

type SignUpValues = z.infer<typeof formSchema>

const FIELD_NAMES = ['name', 'email', 'password'] as const

function isFieldName(value: string): value is keyof SignUpValues {
  return (FIELD_NAMES as readonly string[]).includes(value)
}

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const register = useRegister()

  const form = useForm<SignUpValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  // Stays disabled through the post-success redirect so the form cannot be
  // submitted twice.
  const isSubmitting = register.isPending || register.isSuccess

  function onSubmit(values: SignUpValues) {
    if (isSubmitting) return

    form.clearErrors('root')
    register.mutate(values, {
      onError: (error) => {
        // Attach backend validation details (e.g. duplicate email) to the
        // matching input; anything unmapped falls back to a form-level message.
        const fieldErrors = getApiFieldErrors(error).filter((detail) =>
          isFieldName(detail.field)
        )

        for (const detail of fieldErrors) {
          form.setError(detail.field as keyof SignUpValues, {
            message: detail.message,
          })
        }

        if (fieldErrors.length === 0) {
          form.setError('root', {
            message: getApiErrorMessage(
              error,
              'We could not create your account. Please try again.'
            ),
          })
        }
      },
    })
  }

  const rootError = form.formState.errors.root?.message

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className={cn('flex w-full flex-col', AUTH_FORM_GAP, className)}
        {...props}
      >
        <AuthTextField<SignUpValues>
          name='name'
          label='Full name'
          placeholder='Enter your full name'
          autoComplete='name'
          disabled={isSubmitting}
        />

        <AuthTextField<SignUpValues>
          name='email'
          label='Email'
          type='email'
          inputMode='email'
          placeholder='Enter your email address'
          autoComplete='email'
          disabled={isSubmitting}
        />

        <AuthPasswordField<SignUpValues>
          name='password'
          label='Password'
          placeholder='Create a password'
          autoComplete='new-password'
          disabled={isSubmitting}
        />

        {rootError && <AuthFormError message={rootError} />}

        <AuthSubmitButton
          isPending={isSubmitting}
          pendingLabel='Creating account…'
        >
          Create account
        </AuthSubmitButton>

        <AuthDivider />

        <AuthGoogleButton label='Continue with Google' />
      </form>
    </Form>
  )
}
