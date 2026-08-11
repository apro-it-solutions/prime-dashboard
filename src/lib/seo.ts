import { z } from 'zod'
import { type SeoMeta } from '@/types/api'

/**
 * SEO fields as represented inside a react-hook-form form. `metaKeywords` is a
 * comma-separated string in the form and an array in the API payload.
 */
export const seoFormSchema = z.object({
  metaTitle: z.string().max(180).optional(),
  metaDescription: z.string().max(320).optional(),
  metaKeywords: z.string().optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
})

export type SeoFormValues = z.infer<typeof seoFormSchema>

export const emptySeoForm: SeoFormValues = {
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  ogImage: '',
  canonicalUrl: '',
}

/** API SEO object → form values (keywords array joined to a string). */
export function toSeoForm(seo?: SeoMeta): SeoFormValues {
  return {
    metaTitle: seo?.metaTitle ?? '',
    metaDescription: seo?.metaDescription ?? '',
    metaKeywords: (seo?.metaKeywords ?? []).join(', '),
    ogImage: seo?.ogImage ?? '',
    canonicalUrl: seo?.canonicalUrl ?? '',
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
    ogImage: values?.ogImage?.trim() || undefined,
    canonicalUrl: values?.canonicalUrl?.trim() || undefined,
  }
}
