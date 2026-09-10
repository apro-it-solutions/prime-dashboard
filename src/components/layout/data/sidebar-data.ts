import {
  LayoutDashboard,
  FolderKanban,
  Newspaper,
  Quote,
  Home,
  Info,
  Inbox,
  Mail,
  Settings,
  Palette,
  Monitor,
  Wrench,
  UsersRound,
} from 'lucide-react'
import { PERMISSIONS } from '@/lib/rbac'
import { LogoMark } from '@/assets/logo'
import { type SidebarData } from '../types'

/**
 * The full navigation, tagged with the permission each entry needs.
 *
 * `filterNavGroups` (see ../nav-permissions) trims this per signed-in role, so
 * a Platform User is left with Dashboard, Blogs and the SEO pages. Entries with
 * no `permissions` are visible to anyone signed in.
 */
export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@primenms.com',
    avatar: '/avatars/admin.jpg',
  },
  teams: [
    {
      name: 'Prime NMS',
      logo: LogoMark,
      plan: 'Admin Dashboard',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
          permissions: [PERMISSIONS.DASHBOARD_VIEW],
        },
        {
          // Collapsible: project categories are managed inside the Projects
          // section, in their own collection.
          title: 'Projects',
          icon: FolderKanban,
          permissions: [PERMISSIONS.PROJECT_VIEW],
          items: [
            { title: 'All Projects', url: '/projects' },
            { title: 'Project Categories', url: '/projects/categories' },
          ],
        },
        {
          // Collapsible: blog categories are managed inside the Blogs section,
          // in their own collection.
          title: 'Blogs',
          icon: Newspaper,
          permissions: [PERMISSIONS.BLOG_VIEW],
          items: [
            { title: 'All Blogs', url: '/blogs' },
            { title: 'Blog Categories', url: '/blogs/categories' },
          ],
        },
        {
          title: 'Testimonials',
          url: '/testimonials',
          icon: Quote,
          permissions: [PERMISSIONS.TESTIMONIAL_VIEW],
        },
        {
          title: 'Contact',
          url: '/contact',
          icon: Inbox,
          permissions: [PERMISSIONS.CONTACT_VIEW],
        },
        {
          // Sits next to Contact because both are inboxes filled by the public
          // website rather than content authored here.
          title: 'Newsletter Subscribers',
          url: '/subscribers',
          icon: Mail,
          permissions: [PERMISSIONS.SUBSCRIPTION_VIEW],
        },
      ],
    },
    {
      // Home and About carry real page content; the rest of this group is the
      // per-page SEO editor, which is why they split across two permissions.
      title: 'Content (CMS)',
      items: [
        {
          title: 'Home Page',
          url: '/home-cms',
          icon: Home,
          permissions: [PERMISSIONS.CMS_EDIT],
        },
        {
          title: 'About Page',
          url: '/about-cms',
          icon: Info,
          permissions: [PERMISSIONS.CMS_EDIT],
        },
        {
          title: 'Services',
          url: '/services-cms',
          icon: Wrench,
          permissions: [PERMISSIONS.SEO_VIEW],
        },
        {
          // The public projects page. Individual project records are managed
          // from the Projects section under General.
          title: 'Projects',
          url: '/projects-cms',
          icon: FolderKanban,
          permissions: [PERMISSIONS.SEO_VIEW],
        },
        {
          title: 'Blogs',
          url: '/blogs-cms',
          icon: Newspaper,
          permissions: [PERMISSIONS.SEO_VIEW],
        },
        {
          title: 'Testimonials',
          url: '/testimonials-cms',
          icon: Quote,
          permissions: [PERMISSIONS.SEO_VIEW],
        },
        {
          title: 'Contact',
          url: '/contact-cms',
          icon: Inbox,
          permissions: [PERMISSIONS.SEO_VIEW],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Users',
          url: '/users',
          icon: UsersRound,
          permissions: [PERMISSIONS.USER_VIEW],
        },
        {
          // Gated as a whole: a Platform User has no business in Settings, and
          // the per-browser preferences underneath it are still reachable from
          // the theme switch in the header.
          title: 'Settings',
          icon: Settings,
          permissions: [PERMISSIONS.SETTINGS_VIEW],
          items: [
            {
              title: 'Company',
              url: '/settings',
              icon: Settings,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
      ],
    },
  ],
}
