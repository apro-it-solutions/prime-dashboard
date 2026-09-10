import { z } from 'zod'
import {
  emptySeoForm,
  fromSeoForm,
  seoFormSchema,
  toSeoForm,
} from '@/lib/seo'
import { type Blog, type BlogInput, type ContentStatus } from '@/types/api'

/**
 * Shape of the blog form as edited inside react-hook-form. `tags` is a
 * comma-separated string here (an array in the API payload) and `seo` uses the
 * form representation from `@/lib/seo`.
 */
export const blogFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  slug: z
    .string()
    .max(220)
    .regex(/^[a-z0-9-]*$/, 'Use lowercase letters, numbers and hyphens only')
    .optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().optional(),
  gallery: z.array(z.string()),
  category: z.string().min(1, 'Please select a category'),
  authorName: z.string().max(120, 'Author name is too long').optional(),
  tags: z.string().optional(),
  isFeatured: z.boolean(),
  status: z.enum(['draft', 'published', 'archived']),
  publishDate: z.string().optional(),
  seo: seoFormSchema,
})

export type BlogFormValues = z.infer<typeof blogFormSchema>

export const emptyBlogForm: BlogFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImage: '',
  gallery: [],
  category: '',
  authorName: '',
  tags: '',
  isFeatured: false,
  status: 'draft',
  publishDate: '',
  seo: emptySeoForm,
}

/** "My New Post!" -> "my-new-post" (mirrors the backend slugify). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const categoryId = (category: Blog['category']): string =>
  category && typeof category === 'object' ? category._id : (category ?? '')

/** API Blog -> form values (for the edit page). */
export function blogToForm(blog: Blog): BlogFormValues {
  return {
    title: blog.title,
    slug: blog.slug ?? '',
    excerpt: blog.excerpt ?? '',
    content: blog.content,
    featuredImage: blog.featuredImage ?? '',
    gallery: blog.gallery ?? [],
    category: categoryId(blog.category),
    authorName: blog.authorName ?? '',
    tags: (blog.tags ?? []).join(', '),
    isFeatured: blog.isFeatured ?? false,
    status: blog.status,
    publishDate: blog.publishDate ?? '',
    seo: toSeoForm(blog.seo),
  }
}

/**
 * Form values -> API payload. `statusOverride` lets the "Save draft" / "Publish"
 * buttons force a status regardless of the select value.
 */
export function formToInput(
  values: BlogFormValues,
  statusOverride?: ContentStatus
): BlogInput {
  return {
    title: values.title.trim(),
    slug: values.slug?.trim() || undefined,
    excerpt: values.excerpt?.trim() || undefined,
    content: values.content,
    featuredImage: values.featuredImage || undefined,
    gallery: values.gallery ?? [],
    category: values.category,
    // Sent even when blank so clearing the field resets the post to the
    // account byline; `undefined` would be dropped from the JSON body.
    authorName: values.authorName?.trim() ?? '',
    tags: values.tags
      ? values.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    isFeatured: values.isFeatured,
    status: statusOverride ?? values.status,
    publishDate: values.publishDate || undefined,
    seo: fromSeoForm(values.seo),
  }
}
