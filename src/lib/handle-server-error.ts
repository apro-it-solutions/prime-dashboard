import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'No content.'
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string; errors?: { message?: string }[]; title?: string }
      | undefined

    const firstFieldError = data?.errors?.find((e) => e?.message)?.message
    const message = data?.message ?? data?.title

    if (typeof firstFieldError === 'string' && firstFieldError.length > 0) {
      errMsg = firstFieldError
    } else if (typeof message === 'string' && message.length > 0) {
      errMsg = message
    }
  }

  toast.error(errMsg)
}
