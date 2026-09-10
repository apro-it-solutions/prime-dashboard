import { getErrorStatus } from '@/lib/api-client'

/** Attempts allowed after the first failure, in production. */
const MAX_RETRIES = 3

/**
 * Retry policy shared by every react-query query.
 *
 * Only failures that a second attempt could plausibly fix are retried: a
 * transport error, or a 5xx. Every 4xx is deterministic — the request will be
 * refused identically — and retrying a 429 is actively harmful, since it spends
 * more of the rate-limit budget that just ran out.
 *
 * Development never retries, so a failing request shows up once in the network
 * panel instead of four times.
 */
export function shouldRetryQuery(
  failureCount: number,
  error: unknown,
  isDev: boolean = import.meta.env.DEV
): boolean {
  if (isDev) return false
  if (failureCount >= MAX_RETRIES) return false

  const status = getErrorStatus(error)
  if (status !== undefined && status >= 400 && status < 500) return false

  return true
}
