import { apiClient } from '@/lib/api-client'
import { type ApiEnvelope, type UploadedFile } from '@/types/api'

/**
 * Image uploads. The backend serves files statically and returns an absolute
 * `url` for each stored file.
 *  - POST /uploads/single    (multipart field: `image`)
 *  - POST /uploads/multiple  (multipart field: `gallery`, max 10)
 *
 * We pass `Content-Type: undefined` so the browser sets the correct
 * `multipart/form-data; boundary=…` header (the axios instance defaults to
 * application/json, which would otherwise break the upload).
 */
export const uploadService = {
  async single(file: File): Promise<UploadedFile> {
    const form = new FormData()
    form.append('image', file)
    const { data } = await apiClient.post<ApiEnvelope<UploadedFile>>(
      '/uploads/single',
      form,
      { headers: { 'Content-Type': undefined } }
    )
    return data.data
  },

  async multiple(files: File[]): Promise<UploadedFile[]> {
    const form = new FormData()
    files.forEach((file) => form.append('gallery', file))
    const { data } = await apiClient.post<ApiEnvelope<UploadedFile[]>>(
      '/uploads/multiple',
      form,
      { headers: { 'Content-Type': undefined } }
    )
    return data.data
  },
}
