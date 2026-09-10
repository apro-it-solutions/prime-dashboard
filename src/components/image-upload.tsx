import { useRef, type ChangeEvent } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useUploadImage } from '@/hooks/use-upload'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { resolveImageUrl } from '@/lib/image-url'

type ImageUploadProps = {
  /** Current image URL (controlled). */
  value?: string
  /** Called with the uploaded absolute URL, or '' when removed. */
  onChange: (url: string) => void
  className?: string
  disabled?: boolean
}

/**
 * Single image uploader with preview. Uploads the selected file to the backend
 * (`POST /uploads/single`) and returns the stored absolute URL via `onChange`.
 */
export function ImageUpload({
  value,
  onChange,
  className,
  disabled,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadImage()

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    upload.mutate(file, {
      onSuccess: (result) => onChange(result.url),
    })
    // Allow re-selecting the same file.
    e.target.value = ''
  }

  const isBusy = upload.isPending || disabled

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type='file'
        accept='image/png,image/jpeg,image/webp,image/gif'
        className='hidden'
        onChange={handleSelect}
        disabled={isBusy}
      />

      {value ? (
        <div className='group relative w-full overflow-hidden rounded-md border'>
          <img
            src={resolveImageUrl(value)}
            alt='Uploaded preview'
            className='h-40 w-full object-cover'
          />
          <div className='absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
            <Button
              type='button'
              size='sm'
              variant='secondary'
              disabled={isBusy}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              type='button'
              size='sm'
              variant='destructive'
              disabled={isBusy}
              onClick={() => onChange('')}
            >
              <X className='size-4' /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type='button'
          disabled={isBusy}
          onClick={() => inputRef.current?.click()}
          className='flex h-40 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60'
        >
          {upload.isPending ? (
            <>
              <Loader2 className='size-6 animate-spin' />
              <span className='text-sm'>Uploading…</span>
            </>
          ) : (
            <>
              <ImagePlus className='size-6' />
              <span className='text-sm'>Click to upload an image</span>
              <span className='text-xs'>PNG, JPG, WEBP or GIF (max 5MB)</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
