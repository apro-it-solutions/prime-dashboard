import { ImageUpload } from '@/components/image-upload'

type BlogImageUploadProps = {
  /** Current featured image URL (controlled). */
  value?: string
  /** Called with the uploaded absolute URL, or '' when removed. */
  onChange: (url: string) => void
  disabled?: boolean
  className?: string
}

/**
 * Featured-image uploader for a blog post. Uploads through the backend and
 * shows a live preview before saving. Named wrapper over the shared uploader.
 */
export function BlogImageUpload({
  value,
  onChange,
  disabled,
  className,
}: BlogImageUploadProps) {
  return (
    <ImageUpload
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
    />
  )
}
