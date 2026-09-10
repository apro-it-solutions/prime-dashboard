import { type PageSeoKey } from '@/types/api'

/**
 * Heading copy for the Content (CMS) pages that are backed by /page-seo.
 *
 * These pages have no content sections of their own yet, so their only tab is
 * SEO. When content is added later it goes alongside that tab, exactly as Home
 * and About already do.
 */
export const PAGE_SEO_META: Record<
  PageSeoKey,
  { title: string; description: string }
> = {
  services: {
    title: 'Services',
    description: 'Manage your public services page.',
  },
  projects: {
    title: 'Projects',
    description: 'Manage your public projects page.',
  },
  blogs: {
    title: 'Blogs',
    description: 'Manage your public blog listing page.',
  },
  testimonials: {
    title: 'Testimonials',
    description: 'Manage your public testimonials page.',
  },
  contact: {
    title: 'Contact',
    description: 'Manage your public contact page.',
  },
}
