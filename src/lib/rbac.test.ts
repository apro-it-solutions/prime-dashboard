import { describe, expect, it } from 'vitest'
import {
  ALL_PERMISSIONS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_PLATFORM_USER,
  ROLE_SUPER_ADMIN,
  hasPermission,
  normalizeRole,
  resolvePermissions,
} from './rbac'

describe('normalizeRole', () => {
  it('maps the pre-RBAC roles onto their replacements', () => {
    expect(normalizeRole('admin')).toBe(ROLE_SUPER_ADMIN)
    expect(normalizeRole('editor')).toBe(ROLE_PLATFORM_USER)
  })

  it('passes current roles through', () => {
    expect(normalizeRole('super_admin')).toBe(ROLE_SUPER_ADMIN)
    expect(normalizeRole('platform_user')).toBe(ROLE_PLATFORM_USER)
  })

  // An unrecognised value must never be read as the privileged role.
  it('falls back to the least-privileged role', () => {
    expect(normalizeRole('wat')).toBe(ROLE_PLATFORM_USER)
    expect(normalizeRole(undefined)).toBe(ROLE_PLATFORM_USER)
    expect(normalizeRole(null)).toBe(ROLE_PLATFORM_USER)
    expect(normalizeRole(42)).toBe(ROLE_PLATFORM_USER)
  })
})

describe('ROLE_PERMISSIONS', () => {
  it('gives Super Admin everything', () => {
    expect(ROLE_PERMISSIONS[ROLE_SUPER_ADMIN]).toEqual(ALL_PERMISSIONS)
  })

  it('gives Platform User blogs, SEO and the uploads those need', () => {
    expect([...ROLE_PERMISSIONS[ROLE_PLATFORM_USER]].sort()).toEqual(
      [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.BLOG_VIEW,
        PERMISSIONS.BLOG_CREATE,
        PERMISSIONS.BLOG_EDIT,
        PERMISSIONS.BLOG_DELETE,
        PERMISSIONS.SEO_VIEW,
        PERMISSIONS.SEO_CREATE,
        PERMISSIONS.SEO_EDIT,
        PERMISSIONS.MEDIA_UPLOAD,
      ].sort()
    )
  })

  it.each([
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.TESTIMONIAL_VIEW,
    PERMISSIONS.CONTACT_VIEW,
    PERMISSIONS.CMS_EDIT,
    PERMISSIONS.SETTINGS_VIEW,
  ])('withholds %s from Platform User', (permission) => {
    expect(
      hasPermission(ROLE_PERMISSIONS[ROLE_PLATFORM_USER], permission)
    ).toBe(false)
  })
})

describe('resolvePermissions', () => {
  it('returns nothing when nobody is signed in', () => {
    expect(resolvePermissions(null)).toEqual([])
    expect(resolvePermissions(undefined)).toEqual([])
  })

  // The server is the authority on what a role may do; the local map is only
  // the fallback for a response that predates the field.
  it('prefers the list the server sent', () => {
    expect(
      resolvePermissions({
        role: 'platform_user',
        permissions: [PERMISSIONS.USER_VIEW],
      })
    ).toEqual([PERMISSIONS.USER_VIEW])
  })

  it('drops values it does not recognise from the server list', () => {
    expect(
      resolvePermissions({
        role: 'super_admin',
        permissions: [PERMISSIONS.BLOG_VIEW, 'NOT_A_PERMISSION', 7],
      })
    ).toEqual([PERMISSIONS.BLOG_VIEW])
  })

  it('falls back to the local map when the server sent no list', () => {
    expect(resolvePermissions({ role: 'admin' })).toEqual(ALL_PERMISSIONS)
    expect(resolvePermissions({ role: 'platform_user' })).toEqual(
      ROLE_PERMISSIONS[ROLE_PLATFORM_USER]
    )
  })
})
