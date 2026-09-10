import { describe, expect, it } from 'vitest'
import { ROLE_PERMISSIONS, ROLE_PLATFORM_USER, ROLE_SUPER_ADMIN } from '@/lib/rbac'
import { sidebarData } from './data/sidebar-data'
import { filterNavGroups } from './nav-permissions'
import { type NavGroup } from './types'

/** Every link title a filtered menu ends up showing, groups flattened. */
const titles = (groups: NavGroup[]): string[] =>
  groups.flatMap((group) =>
    group.items.flatMap((item) =>
      item.items ? item.items.map((child) => child.title) : [item.title]
    )
  )

const superAdminMenu = () =>
  filterNavGroups(sidebarData.navGroups, ROLE_PERMISSIONS[ROLE_SUPER_ADMIN])
const platformUserMenu = () =>
  filterNavGroups(sidebarData.navGroups, ROLE_PERMISSIONS[ROLE_PLATFORM_USER])

describe('filterNavGroups', () => {
  it('leaves the whole menu intact for Super Admin', () => {
    expect(titles(superAdminMenu())).toEqual(titles(sidebarData.navGroups))
  })

  it('leaves Platform User with Dashboard, Blogs and the SEO pages', () => {
    const menu = platformUserMenu()

    expect(menu.map((group) => group.title)).toEqual([
      'General',
      'Content (CMS)',
    ])
    expect(titles(menu)).toEqual([
      'Dashboard',
      'All Blogs',
      'Blog Categories',
      'Services',
      'Projects',
      'Blogs',
      'Testimonials',
      'Contact',
    ])
  })

  it.each([
    'All Projects',
    'Project Categories',
    'Users',
    'Company',
    'Appearance',
    'Home Page',
    'About Page',
  ])('hides %s from Platform User', (title) => {
    expect(titles(platformUserMenu())).not.toContain(title)
  })

  it('drops a group once every item in it is filtered out', () => {
    // "Other" holds only Users and Settings, both Super Admin only.
    expect(
      platformUserMenu().some((group) => group.title === 'Other')
    ).toBe(false)
  })

  it('drops a collapsible once every child is filtered out', () => {
    const groups: NavGroup[] = [
      {
        title: 'Test',
        items: [
          {
            title: 'Parent',
            items: [
              { title: 'Allowed', url: '/a' },
              { title: 'Denied', url: '/b', permissions: ['USER_VIEW'] },
            ],
          },
        ],
      },
    ]

    expect(titles(filterNavGroups(groups, ['USER_VIEW']))).toEqual([
      'Allowed',
      'Denied',
    ])
    expect(filterNavGroups(groups, [])).toEqual([
      { title: 'Test', items: [{ title: 'Parent', items: [{ title: 'Allowed', url: '/a' }] }] },
    ])
  })

  it('keeps an entry that asks for no permission', () => {
    const groups: NavGroup[] = [
      { title: 'Test', items: [{ title: 'Open', url: '/open' }] },
    ]
    expect(titles(filterNavGroups(groups, []))).toEqual(['Open'])
  })
})
