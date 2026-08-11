import { ImageUpload } from '@/components/image-upload'

type TestimonialImageUploadProps = {
  /** Current avatar URL (controlled). */
  value?: string
  /** Called with the uploaded absolute URL, or '' when removed. */
  onChange: (url: string) => void
  disabled?: boolean
  className?: string
}

/**
 * Avatar uploader for a testimonial. Uploads through the backend and shows a
 * live preview before saving. Named wrapper over the shared uploader.
 */
export function TestimonialImageUpload({
  value,
  onChange,
  disabled,
  className,
}: TestimonialImageUploadProps) {
  return (
    <ImageUpload
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
    />
  )
}
