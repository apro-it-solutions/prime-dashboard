import { z } from 'zod'
import { type SeoMeta } from '@/types/api'

/**
 * SEO fields as represented inside a react-hook-form form. `metaKeywords` is a
 * comma-separated string in the form and an array in the API payload.
 *
 * Every page form (Home CMS, About CMS, Products, Projects, Blogs) and the
 * company Settings defaults reuse this one shape, so a field added here shows
 * up everywhere at once.
 */
export const seoFormSchema = z.object({
  metaTitle: z.string().max(180).optional(),
  metaDescription: z.string().max(320).optional(),
  metaKeywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
  ogTitle: z.string().max(180).optional(),
  ogDescription: z.string().max(320).optional(),
  ogImage: z.string().optional(),
})

export type SeoFormValues = z.infer<typeof seoFormSchema>

export const emptySeoForm: SeoFormValues = {
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  canonicalUrl: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
}

/** API SEO object → form values (keywords array joined to a string). */
export function toSeoForm(seo?: SeoMeta): SeoFormValues {
  return {
    metaTitle: seo?.metaTitle ?? '',
    metaDescription: seo?.metaDescription ?? '',
    metaKeywords: (seo?.metaKeywords ?? []).join(', '),
    canonicalUrl: seo?.canonicalUrl ?? '',
    ogTitle: seo?.ogTitle ?? '',
    ogDescription: seo?.ogDescription ?? '',
    ogImage: seo?.ogImage ?? '',
  }
}

/** Form values → API SEO object (keywords string split to a trimmed array). */
export function fromSeoForm(values?: SeoFormValues): SeoMeta {
  return {
    metaTitle: values?.metaTitle?.trim() || undefined,
    metaDescription: values?.metaDescription?.trim() || undefined,
    metaKeywords: values?.metaKeywords
      ? values.metaKeywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : [],
    canonicalUrl: values?.canonicalUrl?.trim() || undefined,
    ogTitle: values?.ogTitle?.trim() || undefined,
    ogDescription: values?.ogDescription?.trim() || undefined,
    ogImage: values?.ogImage?.trim() || undefined,
  }
}
