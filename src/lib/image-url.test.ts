import { describe, expect, it } from 'vitest'
import { apiOrigin, resolveImageUrl, rewriteUploadOrigin } from './image-url'

const API = 'https://prime-backend.example.com'

describe('rewriteUploadOrigin', () => {
  it('anchors a relative upload path to the given origin', () => {
    expect(rewriteUploadOrigin('/uploads/3-jpg-1787643958892-580898.jpg', API)).toBe(
      `${API}/uploads/3-jpg-1787643958892-580898.jpg`
    )
  })

  it('replaces a legacy baked-in origin', () => {
    expect(
      rewriteUploadOrigin('http://localhost:5001/uploads/8-jpg-1787643709771-449983.jpg', API)
    ).toBe(`${API}/uploads/8-jpg-1787643709771-449983.jpg`)
  })

  it('keeps the full path under /uploads, including sub-folders', () => {
    expect(rewriteUploadOrigin('/uploads/projects/hero-123.png', API)).toBe(
      `${API}/uploads/projects/hero-123.png`
    )
  })

  it('works for a local API origin too', () => {
    expect(rewriteUploadOrigin('/uploads/hero.png', 'http://localhost:5001')).toBe(
      'http://localhost:5001/uploads/hero.png'
    )
  })

  it('leaves non-upload references untouched', () => {
    expect(rewriteUploadOrigin('https://images.example.com/photo.jpg', API)).toBe(
      'https://images.example.com/photo.jpg'
    )
    expect(rewriteUploadOrigin('data:image/png;base64,AAAA', API)).toBe(
      'data:image/png;base64,AAAA'
    )
    expect(rewriteUploadOrigin('/avatars/01.png', API)).toBe('/avatars/01.png')
  })

  it('passes through empty and undefined so callers can render a fallback', () => {
    expect(rewriteUploadOrigin(undefined, API)).toBeUndefined()
    expect(rewriteUploadOrigin('', API)).toBe('')
  })

  it('rewrites every reference embedded in rich text, preserving the markup', () => {
    expect(
      rewriteUploadOrigin(
        '<p>a <img src="/uploads/a.png"> b <img src="http://localhost:5001/uploads/b.png"></p>',
        API
      )
    ).toBe(
      `<p>a <img src="${API}/uploads/a.png"> b <img src="${API}/uploads/b.png"></p>`
    )
  })

  it('is idempotent, so an already-resolved URL survives a second pass', () => {
    const once = rewriteUploadOrigin('/uploads/hero.png', API)
    expect(rewriteUploadOrigin(once, API)).toBe(once)
  })
})

describe('resolveImageUrl', () => {
  it('derives an absolute origin from VITE_API_URL, dropping the /api/v1 prefix', () => {
    expect(apiOrigin).toMatch(/^https?:\/\//)
    expect(apiOrigin).not.toMatch(/\/api/)
  })

  it('never leaves an upload path to resolve against the dashboard origin', () => {
    const resolved = resolveImageUrl('/uploads/hero.png')
    expect(resolved).toBe(`${apiOrigin}/uploads/hero.png`)
    expect(resolved?.startsWith(window.location.origin)).toBe(false)
  })
})
