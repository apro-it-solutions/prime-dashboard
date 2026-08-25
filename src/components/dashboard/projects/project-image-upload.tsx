import { ImageUpload } from '@/components/image-upload'

type ProjectImageUploadProps = {
  /** Current featured image URL (controlled). */
  value?: string
  /** Called with the uploaded absolute URL, or '' when removed. */
  onChange: (url: string) => void
  disabled?: boolean
  className?: string
}

/**
 * Featured-image uploader for a project. Uploads through the backend and shows
 * a live preview before saving. Named wrapper over the shared uploader.
 */
export function ProjectImageUpload({
  value,
  onChange,
  disabled,
  className,
}: ProjectImageUploadProps) {
  return (
    <ImageUpload
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
    />
  )
}
