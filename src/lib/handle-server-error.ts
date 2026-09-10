import { AxiosError } from 'axios'
import { toast } from 'sonner'
import {
  getErrorStatus,
  getRateLimitMessage,
  isNetworkError,
} from '@/lib/api-client'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  // No response at all (timeout/DNS/offline): the generic message would be
  // misleading, the request never reached the API.
  if (isNetworkError(error)) {
    toast.error('Could not reach the server. Check your connection.', {
      id: 'network-unreachable',
    })
    return
  }

  if (getErrorStatus(error) === 429) {
    toast.error(getRateLimitMessage(error), { id: 'rate-limited' })
    return
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
