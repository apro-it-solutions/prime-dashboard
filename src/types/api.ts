/**
 * Shared types describing the Prime NMS backend REST contract.
 * Every successful response is wrapped in { success, message, data, meta? }.
 * Errors are { success: false, message, errors: [] }.
 */

export type ContentStatus = 'draft' | 'published' | 'archived'
export type CategoryStatus = 'active' | 'inactive'

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  // Some endpoints attach extra meta (e.g. contact `unread`).
  [key: string]: unknown
}

export interface ApiErrorDetail {
  field?: string
  message: string
}

export interface ApiErrorBody {
  success: false
  message: string
  errors: ApiErrorDetail[]
}

/** A list result already unwrapped from the envelope. */
export interface Paginated<T> {
  items: T[]
  meta?: PaginationMeta
}

export interface ListQuery {
  page?: number
  limit?: number
  sort?: string
  search?: string
  status?: string
  category?: string
  featured?: 'true' | 'false'
  tag?: string
  isRead?: 'true' | 'false'
  isActive?: 'true' | 'false'
}

// ----- Auth -----

// The role/permission model lives in @/lib/rbac (mirroring the backend) and is
// re-exported here so the many modules that already import from '@/types/api'
// keep one import path.
import type { Permission, UserRole } from '@/lib/rbac'

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: UserRole
  /**
   * The permissions the server resolved for this account. Sent by every
   * /auth endpoint; absent only on a response from a backend that predates
   * RBAC, where the dashboard falls back to its own role map.
   */
  permissions?: Permission[]
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

// ----- Admin users (Users module) -----

/** An account as returned by /users. Same shape as AuthUser. */
export type AdminUser = AuthUser

export interface AdminUserInput {
  name: string
  email: string
  /** Required on create; omit on update to leave the current password alone. */
  password?: string
  role: UserRole
  isActive?: boolean
}

export interface AdminUserListQuery extends ListQuery {
  role?: UserRole
}

export interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

// ----- Uploads -----

export interface UploadedFile {
  _id: string
  filename: string
  originalName: string
  mimetype: string
  size: number
  /** Absolute URL to the stored file, e.g. http://localhost:5001/uploads/<filename>. */
  url: string
}

// ----- SEO (embedded) -----

export interface SeoMeta {
  /** SEO title — the <title> tag and og:title fallback. */
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  canonicalUrl?: string
  /** Open Graph overrides; fall back to metaTitle / metaDescription when empty. */
  ogTitle?: string
  ogDescription?: string
  /** Absolute URL of the uploaded OG image, served by the API from /uploads. */
  ogImage?: string
}

// ----- Page SEO -----

/**
 * Website pages whose SEO lives in the standalone /page-seo collection.
 *
 * Home and About are absent on purpose: their SEO is already stored on their
 * own CMS documents and is saved through /home and /about. Individual blogs,
 * projects and products likewise keep their own embedded SEO on their own edit
 * screens. Keeping this list narrow means one source of truth per page.
 *
 * Must stay in step with PAGE_SEO_KEYS in the backend's src/constants/index.ts.
 */
export type PageSeoKey =
  'services' | 'projects' | 'blogs' | 'testimonials' | 'contact'

/** One /page-seo record. The API creates it empty on first read. */
export interface PageSeo {
  _id?: string
  page: PageSeoKey
  seo: SeoMeta
  createdAt?: string
  updatedAt?: string
}

export interface PageSeoInput {
  seo: SeoMeta
}

// ----- Category -----

/** Category as populated inside project and blog list responses. */
export interface CategoryRef {
  _id: string
  name: string
  slug: string
}

// ----- Project category -----
//
// Projects have their own category collection, completely separate from the
// Category type above (which serves products) and from BlogCategory below. A
// category created for a blog never appears in the project dropdown, and vice
// versa.

export interface ProjectCategory {
  _id: string
  name: string
  slug: string
  description?: string
  status: CategoryStatus
  /** Number of projects referencing this category (attached by the list endpoint). */
  projectCount?: number
  createdAt: string
  updatedAt: string
}

export interface ProjectCategoryInput {
  name: string
  slug?: string
  description?: string
  status?: CategoryStatus
}

// ----- Blog category -----
//
// Blogs likewise own their categories. Managed under Blogs > Blog Categories and
// never mixed with product or project categories.

export interface BlogCategory {
  _id: string
  name: string
  slug: string
  description?: string
  status: CategoryStatus
  /** Number of blogs referencing this category (attached by the list endpoint). */
  blogCount?: number
  createdAt: string
  updatedAt: string
}

export interface BlogCategoryInput {
  name: string
  slug?: string
  description?: string
  status?: CategoryStatus
}

// ----- Project -----

export interface Project {
  _id: string
  title: string
  slug: string
  shortDescription?: string
  description?: string
  featuredImage?: string
  gallery: string[]
  category: CategoryRef | string | null
  client?: string
  location?: string
  completionDate?: string
  technologies: string[]
  projectUrl?: string
  status: ContentStatus
  featured: boolean
  sortOrder: number
  seo?: SeoMeta
  createdAt: string
  updatedAt: string
}

export interface ProjectInput {
  title: string
  slug?: string
  shortDescription?: string
  description?: string
  featuredImage?: string
  gallery?: string[]
  category: string
  client?: string
  location?: string
  completionDate?: string
  technologies?: string[]
  projectUrl?: string
  status?: ContentStatus
  featured?: boolean
  sortOrder?: number
  seo?: SeoMeta
}

// ----- Blog -----

export interface AuthorRef {
  _id: string
  name: string
  email: string
}

export interface Blog {
  _id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featuredImage?: string
  gallery: string[]
  category: CategoryRef | string | null
  tags: string[]
  author: AuthorRef | string | null
  /**
   * Custom byline entered in the CMS. Empty on posts created before the field
   * existed, where readers fall back to `author`.
   */
  authorName?: string
  isFeatured: boolean
  readingTime: number
  status: ContentStatus
  publishDate?: string
  seo?: SeoMeta
  createdAt: string
  updatedAt: string
}

export interface BlogInput {
  title: string
  slug?: string
  excerpt?: string
  content: string
  featuredImage?: string
  gallery?: string[]
  category: string
  authorName?: string
  tags?: string[]
  isFeatured?: boolean
  status?: ContentStatus
  publishDate?: string
  seo?: SeoMeta
}

// ----- Testimonials -----

export interface Testimonial {
  _id: string
  name: string
  designation: string
  avatar?: string
  rating: number
  review: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TestimonialInput {
  name: string
  designation: string
  avatar?: string
  rating: number
  review: string
  isActive?: boolean
}

// ----- Newsletter subscribers -----

/** A subscriber is suppressed rather than deleted when they opt out. */
export type SubscriberStatus = 'subscribed' | 'unsubscribed'

/**
 * One newsletter sign-up, as stored by the backend.
 *
 * One row per address across every sign-up form on the website — the home page
 * and the blog write to the same list — so an address entered on both is a
 * single subscriber and a single unsubscribe. `status` is a suppression flag
 * rather than a delete: an address that opts out keeps its row, and signing up
 * again flips the same record back instead of creating a second one, which is
 * why `createdAt` is the date the address *first* subscribed.
 */
export interface Subscriber {
  _id: string
  email: string
  status: SubscriberStatus
  createdAt: string
  updatedAt: string
}

// ----- Contact -----

/**
 * One "Request a Quote" submission, as stored by the backend.
 *
 * `company` and `projectType` are optional because submissions taken before
 * they had columns of their own carry both folded into `subject` instead
 * (e.g. "Warehouse — Acme Corp"), which is why the inbox falls back to it.
 */
export interface ContactMessage {
  _id: string
  name: string
  company?: string
  email: string
  phone?: string
  projectType?: string
  /** Summary line; derived from projectType and company when not supplied. */
  subject?: string
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

// ----- Dashboard -----

export interface DashboardStats {
  counts: {
    totalProducts: number
    publishedProducts: number
    totalBlogs: number
    publishedBlogs: number
    totalMessages: number
    unreadMessages: number
    totalCategories: number
  }
  recentBlogs: Array<
    Pick<
      Blog,
      '_id' | 'title' | 'slug' | 'status' | 'publishDate' | 'createdAt'
    > & {
      category?: CategoryRef | null
    }
  >
  recentMessages: Array<
    Pick<
      ContactMessage,
      '_id' | 'name' | 'email' | 'subject' | 'isRead' | 'createdAt'
    >
  >
}

// ----- Home CMS -----

export interface HomeHero {
  title?: string
  subtitle?: string
  description?: string
  backgroundImage?: string
  ctaText?: string
  ctaLink?: string
}

export interface HomeAbout {
  title?: string
  description?: string
  image?: string
}

export interface WhyChooseUsItem {
  icon?: string
  title: string
  description?: string
}

export interface HomePage {
  _id?: string
  hero: HomeHero
  about: HomeAbout
  featuredProducts: string[]
  whyChooseUs: WhyChooseUsItem[]
  gallery: string[]
  seo?: SeoMeta
  createdAt?: string
  updatedAt?: string
}

export type HomePageInput = Partial<
  Omit<HomePage, '_id' | 'createdAt' | 'updatedAt'>
>

// ----- About CMS -----

export interface AboutBanner {
  title?: string
  subtitle?: string
  image?: string
}

export interface CompanyInfo {
  title?: string
  description?: string
  foundedYear?: number
  image?: string
}

export interface TeamMember {
  name: string
  role?: string
  bio?: string
  avatar?: string
  socials?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
}

export interface TimelineItem {
  year: string
  title: string
  description?: string
}

export interface AboutPage {
  _id?: string
  banner: AboutBanner
  companyInfo: CompanyInfo
  vision?: string
  mission?: string
  team: TeamMember[]
  timeline: TimelineItem[]
  seo?: SeoMeta
  createdAt?: string
  updatedAt?: string
}

export type AboutPageInput = Partial<
  Omit<AboutPage, '_id' | 'createdAt' | 'updatedAt'>
>

// ----- Settings -----

export interface SocialLinks {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  youtube?: string
}

export interface Settings {
  _id?: string
  companyName?: string
  logo?: string
  favicon?: string
  address?: string
  phone?: string
  email?: string
  socialLinks: SocialLinks
  footerText?: string
  seoDefaults?: SeoMeta
  createdAt?: string
  updatedAt?: string
}

export type SettingsInput = Partial<
  Omit<Settings, '_id' | 'createdAt' | 'updatedAt'>
>
