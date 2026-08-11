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

export type UserRole = 'admin' | 'editor' | string

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

// ----- Uploads -----

export interface UploadedFile {
  filename: string
  originalName: string
  mimetype: string
  size: number
  /** Absolute URL to the stored file, e.g. http://localhost:5001/uploads/<filename>. */
  url: string
}

// ----- SEO (embedded) -----

export interface SeoMeta {
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  ogImage?: string
  canonicalUrl?: string
}

// ----- Category -----

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  status: CategoryStatus
  /** Number of products referencing this category (attached by the list endpoint). */
  productCount?: number
  /** Number of blogs referencing this category (attached by the list endpoint). */
  blogCount?: number
  createdAt: string
  updatedAt: string
}

export interface CategoryInput {
  name: string
  slug?: string
  description?: string
  status?: CategoryStatus
}

/** Category as populated inside product/blog list responses. */
export interface CategoryRef {
  _id: string
  name: string
  slug: string
}

// ----- Product -----

export interface Product {
  _id: string
  title: string
  slug: string
  description: string
  shortDescription?: string
  category: CategoryRef | string | null
  featuredImage?: string
  gallery: string[]
  status: ContentStatus
  featured: boolean
  seo?: SeoMeta
  createdAt: string
  updatedAt: string
}

export interface ProductInput {
  title: string
  slug?: string
  description: string
  shortDescription?: string
  category: string
  featuredImage?: string
  gallery?: string[]
  status?: ContentStatus
  featured?: boolean
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
  company?: string
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
  company?: string
  avatar?: string
  rating: number
  review: string
  isActive?: boolean
}

// ----- Contact -----

export interface ContactMessage {
  _id: string
  name: string
  email: string
  phone?: string
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
    Pick<Blog, '_id' | 'title' | 'slug' | 'status' | 'publishDate' | 'createdAt'> & {
      category?: CategoryRef | null
    }
  >
  recentMessages: Array<
    Pick<ContactMessage, '_id' | 'name' | 'email' | 'subject' | 'isRead' | 'createdAt'>
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

export type HomePageInput = Partial<Omit<HomePage, '_id' | 'createdAt' | 'updatedAt'>>

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

export type AboutPageInput = Partial<Omit<AboutPage, '_id' | 'createdAt' | 'updatedAt'>>

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

export type SettingsInput = Partial<Omit<Settings, '_id' | 'createdAt' | 'updatedAt'>>
