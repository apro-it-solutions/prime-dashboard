import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { getRateLimitMessage, getRetryAfterSeconds } from '@/lib/api-client'
import { shouldRetryQuery } from './query-retry'

function httpError(status: number, headers: Record<string, string> = {}) {
  const error = new AxiosError('Request failed', String(status), {
    headers: new AxiosHeaders(),
  })
  error.response = {
    status,
    statusText: '',
    data: {},
    headers,
    config: { headers: new AxiosHeaders() },
  }
  return error
}

function transportError() {
  return new AxiosError('timeout', AxiosError.ECONNABORTED, {
    headers: new AxiosHeaders(),
  })
}

// `isDev` is passed explicitly so the policy can be exercised as it behaves in
// a production build; the tests themselves run under DEV.
const inProd = (failureCount: number, error: unknown) =>
  shouldRetryQuery(failureCount, error, false)

describe('shouldRetryQuery', () => {
  it('never retries 429 — that would spend more of the exhausted budget', () => {
    expect(inProd(0, httpError(429))).toBe(false)
  })

  it('never retries any other 4xx', () => {
    for (const status of [400, 401, 403, 404, 409, 422]) {
      expect(inProd(0, httpError(status))).toBe(false)
    }
  })

  it('retries a 5xx up to three times, then gives up', () => {
    expect(inProd(0, httpError(500))).toBe(true)
    expect(inProd(2, httpError(500))).toBe(true)
    expect(inProd(3, httpError(500))).toBe(false)
  })

  it('retries a transport failure', () => {
    expect(inProd(0, transportError())).toBe(true)
  })

  it('does not retry at all in development', () => {
    expect(shouldRetryQuery(0, httpError(500), true)).toBe(false)
  })
})

describe('rate limit messaging', () => {
  it('names the wait when the API sends Retry-After', () => {
    const error = httpError(429, { 'retry-after': '42' })
    expect(getRetryAfterSeconds(error)).toBe(42)
    expect(getRateLimitMessage(error)).toBe('Too many requests. Try again in 42s.')
  })

  it('falls back to a generic wait when the header is absent', () => {
    expect(getRetryAfterSeconds(httpError(429))).toBeUndefined()
    expect(getRateLimitMessage(httpError(429))).toBe(
      'Too many requests. Please wait a moment and try again.'
    )
  })
})

describe('rate limit wait formatting', () => {
  it('prefers RateLimit-Reset over the full-window Retry-After', () => {
    const error = httpError(429, { 'retry-after': '900', 'ratelimit-reset': '45' })
    expect(getRetryAfterSeconds(error)).toBe(45)
    expect(getRateLimitMessage(error)).toBe('Too many requests. Try again in 45s.')
  })

  it('reads the full window in minutes when that is all the API sends', () => {
    const error = httpError(429, { 'retry-after': '900' })
    expect(getRateLimitMessage(error)).toBe('Too many requests. Try again in 15 minutes.')
  })

  it('says one minute in the singular', () => {
    expect(getRateLimitMessage(httpError(429, { 'ratelimit-reset': '60' }))).toBe(
      'Too many requests. Try again in 1 minute.'
    )
  })
})
