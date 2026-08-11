import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { uploadService } from '@/services/upload.service'
import { getApiErrorMessage } from '@/lib/api-client'

/** POST /uploads/single — returns the stored file descriptor (with absolute `url`). */
export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => uploadService.single(file),
    onError: (error) => toast.error(getApiErrorMessage(error, 'Image upload failed')),
  })
}

/** POST /uploads/multiple — returns an array of stored file descriptors. */
export function useUploadImages() {
  return useMutation({
    mutationFn: (files: File[]) => uploadService.multiple(files),
    onError: (error) => toast.error(getApiErrorMessage(error, 'Image upload failed')),
  })
}
