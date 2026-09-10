/**
 * Role and permission model for the dashboard.
 *
 * This mirrors `src/constants/{roles,permissions}.ts` in the backend and must be
 * kept in step with it. It exists so the UI can decide what to *render*; it is
 * never the authority. Every request is re-checked server-side, so a permission
 * granted here and not there simply produces a 403.
 */

export const USER_ROLES = ['super_admin', 'platform_user'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const ROLE_SUPER_ADMIN = 'super_admin' satisfies UserRole
export const ROLE_PLATFORM_USER = 'platform_user' satisfies UserRole

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  platform_user: 'Platform User',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full access to every section, including user management.',
  platform_user: 'Can manage Blogs and SEO only.',
}

/** Pre-RBAC role values, mapped onto their replacements. */
const LEGACY_ROLE_ALIASES: Record<string, UserRole> = {
  admin: ROLE_SUPER_ADMIN,
  superadmin: ROLE_SUPER_ADMIN,
  'super-admin': ROLE_SUPER_ADMIN,
  editor: ROLE_PLATFORM_USER,
  user: ROLE_PLATFORM_USER,
}

const isUserRole = (value: string): value is UserRole =>
  (USER_ROLES as readonly string[]).includes(value)

/**
 * Coerces any role string into a current role.
 *
 * Unknown values fall back to the least-privileged role — a value this build
 * does not recognise must never render as Super Admin.
 */
export function normalizeRole(value: unknown): UserRole {
  if (typeof value !== 'string') return ROLE_PLATFORM_USER
  const raw = value.trim().toLowerCase()
  if (isUserRole(raw)) return raw
  return LEGACY_ROLE_ALIASES[raw] ?? ROLE_PLATFORM_USER
}

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',

  BLOG_VIEW: 'BLOG_VIEW',
  BLOG_CREATE: 'BLOG_CREATE',
  BLOG_EDIT: 'BLOG_EDIT',
  BLOG_DELETE: 'BLOG_DELETE',

  SEO_VIEW: 'SEO_VIEW',
  SEO_CREATE: 'SEO_CREATE',
  SEO_EDIT: 'SEO_EDIT',

  MEDIA_UPLOAD: 'MEDIA_UPLOAD',

  PRODUCT_VIEW: 'PRODUCT_VIEW',
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_EDIT: 'PRODUCT_EDIT',
  PRODUCT_DELETE: 'PRODUCT_DELETE',

  PROJECT_VIEW: 'PROJECT_VIEW',
  PROJECT_CREATE: 'PROJECT_CREATE',
  PROJECT_EDIT: 'PROJECT_EDIT',
  PROJECT_DELETE: 'PROJECT_DELETE',

  TESTIMONIAL_VIEW: 'TESTIMONIAL_VIEW',
  TESTIMONIAL_CREATE: 'TESTIMONIAL_CREATE',
  TESTIMONIAL_EDIT: 'TESTIMONIAL_EDIT',
  TESTIMONIAL_DELETE: 'TESTIMONIAL_DELETE',

  CONTACT_VIEW: 'CONTACT_VIEW',
  CONTACT_EDIT: 'CONTACT_EDIT',
  CONTACT_DELETE: 'CONTACT_DELETE',

  SUBSCRIPTION_VIEW: 'SUBSCRIPTION_VIEW',
  SUBSCRIPTION_EDIT: 'SUBSCRIPTION_EDIT',
  SUBSCRIPTION_DELETE: 'SUBSCRIPTION_DELETE',

  CMS_VIEW: 'CMS_VIEW',
  CMS_EDIT: 'CMS_EDIT',

  SETTINGS_VIEW: 'SETTINGS_VIEW',
  SETTINGS_EDIT: 'SETTINGS_EDIT',

  USER_VIEW: 'USER_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_EDIT: 'USER_EDIT',
  USER_DELETE: 'USER_DELETE',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[]

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  platform_user: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_EDIT,
    PERMISSIONS.BLOG_DELETE,
    PERMISSIONS.SEO_VIEW,
    PERMISSIONS.SEO_CREATE,
    PERMISSIONS.SEO_EDIT,
    PERMISSIONS.MEDIA_UPLOAD,
  ],
}

const isPermission = (value: string): value is Permission =>
  (ALL_PERMISSIONS as readonly string[]).includes(value)

/**
 * The permissions a signed-in user holds.
 *
 * `/auth/me` sends the list the server itself resolved, so that is preferred —
 * it keeps the two role maps from drifting apart in a deployed build where the
 * backend is ahead of the dashboard. The local map is the fallback for a
 * response that predates the field (or no user at all, which holds nothing).
 */
export function resolvePermissions(
  user: { role?: unknown; permissions?: unknown } | null | undefined
): readonly Permission[] {
  if (!user) return []
  if (Array.isArray(user.permissions)) {
    return user.permissions.filter(
      (value): value is Permission =>
        typeof value === 'string' && isPermission(value)
    )
  }
  return ROLE_PERMISSIONS[normalizeRole(user.role)] ?? []
}

/** Whether `permissions` contains `permission`. */
export function hasPermission(
  permissions: readonly Permission[],
  permission: Permission
): boolean {
  return permissions.includes(permission)
}
