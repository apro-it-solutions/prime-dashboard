import {
  type ApiEnvelope,
  type PageSeo,
  type PageSeoKey,
  type SeoMeta,
} from '@/types/api'
import { apiClient } from '@/lib/api-client'

/**
 * SEO for the website pages that have no content document of their own —
 * Services, Projects, Blogs, Testimonials and Contact.
 *
 * Home and About are NOT served from here: their SEO already lives on their own
 * CMS documents, so their SEO tab saves through homeService / aboutService.
 * Individual blogs and projects keep their own SEO on their own edit forms.
 */
export const pageSeoService = {
  /** GET /page-seo/:page — the API creates the record empty on first read. */
  async get(page: PageSeoKey): Promise<PageSeo> {
    const { data } = await apiClient.get<ApiEnvelope<PageSeo>>(
      `/page-seo/${page}`
    )
    return data.data
  },

  /** PUT /page-seo/:page */
  async update(page: PageSeoKey, seo: SeoMeta): Promise<PageSeo> {
    const { data } = await apiClient.put<ApiEnvelope<PageSeo>>(
      `/page-seo/${page}`,
      { seo }
    )
    return data.data
  },
}
