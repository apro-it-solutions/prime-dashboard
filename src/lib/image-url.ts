/**
 * Resolves a stored image reference into a URL the browser can actually load.
 *
 * Uploads are served by the API, not by this app, so a reference the API hands
 * back has to be resolved against the API origin — never against the dashboard's
 * own origin. Two shapes reach us and both are handled here:
 *
 *  - `/uploads/<file>` — what the API returns when it stores images
 *    origin-free. Left as-is the browser resolves it against the dashboard
 *    (`localhost:5173/uploads/...`), where Vite answers with `index.html` and
 *    the `<img>` renders broken.
 *  - `http://localhost:5001/uploads/<file>` — legacy rows written before uploads
 *    became origin-free. That origin is meaningless on any machine but the one
 *    that saved it.
 *
 * Both are rewritten onto the API origin, so only the path under `/uploads`
 * survives. Anything that is not an upload reference (an external CDN URL, a
 * `data:`/`blob:` preview, a bundled asset) is returned untouched.
 *
 * This mirrors `rewriteUploadOrigin` in the backend's `utils/fileUrl.ts`: the
 * API absolutizes on the way out, and this re-anchors whatever still arrives
 * relative, so the dashboard is correct no matter which of the two shapes the
 * deployed API happens to return.
 */

/** An optional absolute origin followed by `/uploads/`. */
const UPLOAD_REFERENCE = /(?:https?:\/\/[^/\s"'<>]+)?\/uploads\//gi

/** Cheap non-global pre-test, so untouched strings skip the replace entirely. */
const HAS_UPLOAD_REFERENCE = /\/uploads\//i

/**
 * Rewrites every `/uploads/...` reference in `value` onto `origin`. Pure, so it
 * is exercised directly by the tests without depending on build-time env.
 */
export function rewriteUploadOrigin(
  value: string | undefined,
  origin: string
): string | undefined {
  if (!value || !HAS_UPLOAD_REFERENCE.test(value)) return value
  return value.replace(UPLOAD_REFERENCE, `${origin}/uploads/`)
}

/** Origin of the configured API, e.g. `https://prime-backend.example.com`. */
export const apiOrigin = ((): string => {
  const configured = import.meta.env.VITE_API_URL
  if (!configured) return ''
  try {
    // VITE_API_URL includes the `/api/v1` prefix; only the origin is wanted.
    return new URL(configured, window.location.origin).origin
  } catch {
    return ''
  }
})()

/** `rewriteUploadOrigin` bound to the configured API origin. */
export const resolveImageUrl = (value?: string): string | undefined =>
  rewriteUploadOrigin(value, apiOrigin)
