import { z } from 'zod'
import {
  type ContentStatus,
  type Project,
  type ProjectInput,
} from '@/types/api'
import { emptySeoForm, fromSeoForm, seoFormSchema, toSeoForm } from '@/lib/seo'

/**
 * Shape of the project form as edited inside react-hook-form. `technologies` is
 * a comma-separated string here (an array in the API payload), `sortOrder` is
 * a numeric string, and `seo` uses the shared form shape from `@/lib/seo`.
 */
export const projectFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  slug: z
    .string()
    .max(220)
    .regex(/^[a-z0-9-]*$/, 'Use lowercase letters, numbers and hyphens only')
    .optional(),
  shortDescription: z.string().max(400).optional(),
  // Optional per the Figma spec: a project can be saved with an empty body.
  description: z.string().optional(),
  featuredImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  // The only required field besides the title. Options are the categories
  // managed in the CMS, never a hardcoded list.
  category: z.string().min(1, 'Please select a category'),
  client: z.string().max(150).optional(),
  location: z.string().max(150).optional(),
  completionDate: z.string().optional(),
  technologies: z.string().optional(),
  projectUrl: z
    .string()
    .max(2048)
    .refine(
      (value) => !value || /^https?:\/\/\S+\.\S+/.test(value),
      'Enter a full URL starting with http:// or https://'
    )
    .optional(),
  status: z.enum(['draft', 'published', 'archived']),
  featured: z.boolean().optional(),
  // Kept as a string (like the technologies field) so the number input
  // round-trips cleanly through react-hook-form; parsed in formToInput.
  sortOrder: z
    .string()
    .refine(
      (value) => !value || /^[0-9]+$/.test(value),
      'Sort order must be a whole number of 0 or more'
    )
    .refine(
      (value) => !value || Number(value) <= 100000,
      'Sort order is too large'
    )
    .optional(),
  seo: seoFormSchema,
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

export const emptyProjectForm: ProjectFormValues = {
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  featuredImage: '',
  gallery: [],
  category: '',
  client: '',
  location: '',
  completionDate: '',
  technologies: '',
  projectUrl: '',
  status: 'draft',
  featured: false,
  sortOrder: '',
  seo: emptySeoForm,
}

/** "My New Project!" -> "my-new-project" (mirrors the backend slugify). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const categoryId = (category: Project['category']): string =>
  category && typeof category === 'object' ? category._id : (category ?? '')

/** API Project -> form values (for the edit page). */
export function projectToForm(project: Project): ProjectFormValues {
  return {
    title: project.title,
    slug: project.slug ?? '',
    shortDescription: project.shortDescription ?? '',
    description: project.description ?? '',
    featuredImage: project.featuredImage ?? '',
    gallery: project.gallery ?? [],
    category: categoryId(project.category),
    client: project.client ?? '',
    location: project.location ?? '',
    completionDate: project.completionDate ?? '',
    technologies: (project.technologies ?? []).join(', '),
    projectUrl: project.projectUrl ?? '',
    status: project.status,
    featured: project.featured ?? false,
    sortOrder: String(project.sortOrder ?? 0),
    seo: toSeoForm(project.seo),
  }
}

/**
 * Form values -> API payload. `statusOverride` lets the "Save draft" / "Publish"
 * buttons force a status regardless of the select value.
 *
 * Cleared optional text fields are sent as '' rather than dropped, so the
 * backend actually unsets them instead of keeping the previous value.
 */
export function formToInput(
  values: ProjectFormValues,
  statusOverride?: ContentStatus
): ProjectInput {
  return {
    title: values.title.trim(),
    slug: values.slug?.trim() || undefined,
    shortDescription: values.shortDescription?.trim() ?? '',
    description: values.description ?? '',
    featuredImage: values.featuredImage || '',
    gallery: values.gallery ?? [],
    category: values.category,
    client: values.client?.trim() ?? '',
    location: values.location?.trim() ?? '',
    completionDate: values.completionDate || undefined,
    technologies: values.technologies
      ? values.technologies
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    projectUrl: values.projectUrl?.trim() ?? '',
    status: statusOverride ?? values.status,
    featured: values.featured ?? false,
    sortOrder: values.sortOrder ? Number(values.sortOrder) : 0,
    seo: fromSeoForm(values.seo),
  }
}
