import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, Send } from 'lucide-react'
import { type BlogInput, type Category } from '@/types/api'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/date-picker'
import { GalleryUpload } from '@/components/gallery-upload'
import { SeoFields } from '@/components/seo-fields'
import { BlogEditor } from './blog-editor'
import { BlogImageUpload } from './blog-image-upload'
import {
  blogFormSchema,
  formToInput,
  slugify,
  type BlogFormValues,
} from './blog-form-schema'

type BlogFormProps = {
  defaultValues: BlogFormValues
  categories: Category[]
  isSubmitting: boolean
  mode: 'create' | 'edit'
  onSubmit: (input: BlogInput) => void
  onCancel: () => void
}

/**
 * Shared create/edit blog form. Owns all fields, slug auto-generation and the
 * Save-draft / Publish / Cancel actions; the parent only runs the mutation.
 */
export function BlogForm({
  defaultValues,
  categories,
  isSubmitting,
  mode,
  onSubmit,
  onCancel,
}: BlogFormProps) {
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues,
  })

  // Auto-fill the slug from the title until the user edits the slug manually.
  const [slugEdited, setSlugEdited] = useState(Boolean(defaultValues.slug))
  const title = form.watch('title')
  useEffect(() => {
    if (!slugEdited) {
      form.setValue('slug', slugify(title ?? ''), { shouldValidate: false })
    }
  }, [title, slugEdited, form])

  const submitWith = (status: 'draft' | 'published') =>
    form.handleSubmit((values) => onSubmit(formToInput(values, status)))

  const publishDate = form.watch('publishDate')

  return (
    <Form {...form}>
      <form
        onSubmit={submitWith('published')}
        className='grid grid-cols-1 gap-6 lg:grid-cols-3'
      >
        {/* Main column */}
        <div className='space-y-6 lg:col-span-2'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder='Post title' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='slug'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder='auto-generated-from-title'
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      setSlugEdited(true)
                      field.onChange(e)
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Auto-generated from the title. Edit to override.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='excerpt'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder='Short summary shown in listings'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='content'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <BlogEditor value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='gallery'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gallery</FormLabel>
                <FormControl>
                  <GalleryUpload
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Optional additional images.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <SeoFields />
        </div>

        {/* Sidebar column */}
        <div className='space-y-6'>
          <div className='space-y-4 rounded-lg border p-4'>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='draft'>Draft</SelectItem>
                      <SelectItem value='published'>Published</SelectItem>
                      <SelectItem value='archived'>Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='isFeatured'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between'>
                  <div>
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>Highlight this post.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='publishDate'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Publish date</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={publishDate ? new Date(publishDate) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? date.toISOString() : '')
                      }
                      placeholder='Pick a date'
                    />
                  </FormControl>
                  <FormDescription>
                    Defaults to now when first published.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a category' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='tags'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    placeholder='news, updates, release'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>Comma-separated list.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='featuredImage'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured image</FormLabel>
                <FormControl>
                  <BlogImageUpload
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className='flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end lg:col-span-3'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='secondary'
            onClick={submitWith('draft')}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className='animate-spin' />
            ) : (
              <Save className='size-4' />
            )}
            Save draft
          </Button>
          <Button
            type='button'
            onClick={submitWith('published')}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className='animate-spin' />
            ) : (
              <Send className='size-4' />
            )}
            {mode === 'edit' ? 'Update & publish' : 'Publish'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
