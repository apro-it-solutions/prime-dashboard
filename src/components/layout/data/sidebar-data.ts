import {
  LayoutDashboard,
  Package,
  FolderKanban,
  FolderTree,
  Newspaper,
  Quote,
  Home,
  Info,
  Inbox,
  Settings,
  Palette,
  Monitor,
  Command,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@primenms.com',
    avatar: '/avatars/admin.jpg',
  },
  teams: [
    {
      name: 'Prime NMS',
      logo: Command,
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
        },
        {
          title: 'Products',
          url: '/products',
          icon: Package,
        },
        {
          // Collapsible: project categories are managed inside the Projects
          // section, separately from the product categories below.
          title: 'Projects',
          icon: FolderKanban,
          items: [
            { title: 'All Projects', url: '/projects' },
            { title: 'Project Categories', url: '/projects/categories' },
          ],
        },
        {
          // Products-only categories. Projects and blogs each manage their own
          // categories from inside their own section.
          title: 'Product Categories',
          url: '/categories',
          icon: FolderTree,
        },
        {
          // Collapsible: blog categories are managed inside the Blogs section,
          // separately from the product categories above.
          title: 'Blogs',
          icon: Newspaper,
          items: [
            { title: 'All Blogs', url: '/blogs' },
            { title: 'Blog Categories', url: '/blogs/categories' },
          ],
        },
        {
          title: 'Testimonials',
          url: '/testimonials',
          icon: Quote,
        },
        {
          title: 'Contact',
          url: '/contact',
          icon: Inbox,
        },
      ],
    },
    {
      title: 'Content (CMS)',
      items: [
        {
          title: 'Home Page',
          url: '/home-cms',
          icon: Home,
        },
        {
          title: 'About Page',
          url: '/about-cms',
          icon: Info,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
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
