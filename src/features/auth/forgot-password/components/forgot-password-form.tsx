import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForgotPassword } from '@/hooks/use-auth'
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { Form } from '@/components/ui/form'
import {
  AuthFormError,
  AuthFormSuccess,
  AuthSubmitButton,
} from '../../components/auth-actions'
import { AuthTextField } from '../../components/auth-fields'
import { AUTH_FORM_GAP } from '../../components/auth-styles'

/**
 * Figma `Form` node (809:652): a single Email field then the primary button.
 * No divider, no social buttons.
 */
const formSchema = z.object({
  email: z.email({
    error: (iss) =>
      iss.input === ''
        ? 'Please enter your email.'
        : 'Enter a valid email address.',
  }),
})

type ForgotPasswordValues = z.infer<typeof formSchema>

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const forgotPassword = useForgotPassword()

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  const isSubmitting = forgotPassword.isPending

  function onSubmit(values: ForgotPasswordValues) {
    if (isSubmitting) return

    form.clearErrors('root')
    forgotPassword.mutate(values.email, {
      onError: (error) => {
        const fieldError = getApiFieldErrors(error).find(
          (detail) => detail.field === 'email'
        )

        if (fieldError) {
          form.setError('email', { message: fieldError.message })
          return
        }

        form.setError('root', {
          message: getApiErrorMessage(
            error,
            'We could not send the reset link. Please try again.'
          ),
        })
      },
    })
  }

  const rootError = form.formState.errors.root?.message
  // The API answers 200 for unknown emails too, so this confirms the request
  // was accepted — not that an account exists. Show its wording verbatim.
  const successMessage = forgotPassword.isSuccess
    ? forgotPassword.data.message
    : null

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className={cn('flex w-full flex-col', AUTH_FORM_GAP, className)}
        {...props}
      >
        <AuthTextField<ForgotPasswordValues>
          name='email'
          label='Email'
          type='email'
          inputMode='email'
          placeholder='Enter your email address'
          autoComplete='email'
          disabled={isSubmitting}
        />

        {successMessage && <AuthFormSuccess message={successMessage} />}
        {rootError && <AuthFormError message={rootError} />}

        <AuthSubmitButton isPending={isSubmitting} pendingLabel='Sending…'>
          Send reset link
        </AuthSubmitButton>
      </form>
    </Form>
  )
}
