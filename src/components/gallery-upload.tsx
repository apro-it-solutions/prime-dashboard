import { useRef, type ChangeEvent } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useUploadImages } from '@/hooks/use-upload'
import { cn } from '@/lib/utils'
import { resolveImageUrl } from '@/lib/image-url'

type GalleryUploadProps = {
  /** Current list of image URLs (controlled). */
  value: string[]
  onChange: (urls: string[]) => void
  className?: string
  disabled?: boolean
}

/**
 * Multi-image uploader with thumbnail grid. Appends newly uploaded absolute
 * URLs to the existing list (`POST /uploads/multiple`).
 */
export function GalleryUpload({
  value,
  onChange,
  className,
  disabled,
}: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadImages()

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    upload.mutate(files, {
      onSuccess: (results) => onChange([...value, ...results.map((r) => r.url)]),
    })
    e.target.value = ''
  }

  const removeAt = (index: number) =>
    onChange(value.filter((_, i) => i !== index))

  const isBusy = upload.isPending || disabled

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type='file'
        accept='image/png,image/jpeg,image/webp,image/gif'
        multiple
        className='hidden'
        onChange={handleSelect}
        disabled={isBusy}
      />

      <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className='group relative aspect-square overflow-hidden rounded-md border'
          >
            <img src={resolveImageUrl(url)} alt='' className='h-full w-full object-cover' />
            <button
              type='button'
              disabled={isBusy}
              onClick={() => removeAt(index)}
              className='absolute end-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100'
            >
              <X className='size-3' />
            </button>
          </div>
        ))}

        <button
          type='button'
          disabled={isBusy}
          onClick={() => inputRef.current?.click()}
          className='flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60'
        >
          {upload.isPending ? (
            <Loader2 className='size-5 animate-spin' />
          ) : (
            <>
              <ImagePlus className='size-5' />
              <span className='text-xs'>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
