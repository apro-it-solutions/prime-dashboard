import { Controller, useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/image-upload'

type SeoFieldsProps = {
  /** Dot-path prefix to the SEO object inside the form (default "seo"). */
  namePrefix?: string
}

/**
 * Reusable SEO form section. Must be rendered inside a react-hook-form
 * <Form>/FormProvider. Expects the SEO group to use the `SeoFormValues` shape
 * (metaKeywords as a comma-separated string).
 */
export function SeoFields({ namePrefix = 'seo' }: SeoFieldsProps) {
  const { control } = useFormContext()
  const name = (field: string) => `${namePrefix}.${field}`

  return (
    <div className='space-y-4 rounded-lg border p-4'>
      <div>
        <h4 className='text-sm font-medium'>SEO</h4>
        <p className='text-xs text-muted-foreground'>
          Optional metadata for search engines and social sharing.
        </p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='seo-meta-title'>Meta title</Label>
        <Controller
          control={control}
          name={name('metaTitle')}
          render={({ field }) => (
            <Input
              id='seo-meta-title'
              placeholder='Title shown in search results'
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='seo-meta-description'>Meta description</Label>
        <Controller
          control={control}
          name={name('metaDescription')}
          render={({ field }) => (
            <Textarea
              id='seo-meta-description'
              rows={2}
              placeholder='Short description for search results'
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='seo-meta-keywords'>Meta keywords</Label>
        <Controller
          control={control}
          name={name('metaKeywords')}
          render={({ field }) => (
            <Input
              id='seo-meta-keywords'
              placeholder='comma, separated, keywords'
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>

      <div className='space-y-2'>
        <Label>Open Graph image</Label>
        <Controller
          control={control}
          name={name('ogImage')}
          render={({ field }) => (
            <ImageUpload
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='seo-canonical'>Canonical URL</Label>
        <Controller
          control={control}
          name={name('canonicalUrl')}
          render={({ field }) => (
            <Input
              id='seo-canonical'
              placeholder='https://…'
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>
    </div>
  )
}
