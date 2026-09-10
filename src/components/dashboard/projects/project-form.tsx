import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type ProjectCategory, type ProjectInput } from '@/types/api'
import { Loader2, Plus, Save, Send } from 'lucide-react'
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
import { RichTextEditor } from '@/components/rich-text-editor'
import { SeoFields } from '@/components/seo-fields'
import { ProjectCategoryDialog } from './project-category-dialog'
import {
  formToInput,
  projectFormSchema,
  slugify,
  type ProjectFormValues,
} from './project-form-schema'
import { ProjectImageUpload } from './project-image-upload'

/** Red asterisk shown next to the labels of the two required fields. */
function RequiredMark() {
  return (
    <span aria-hidden='true' className='text-destructive'>
      *
    </span>
  )
}

type ProjectFormProps = {
  defaultValues: ProjectFormValues
  /** Project-only categories. Never the blog categories. */
  categories: ProjectCategory[]
  isSubmitting: boolean
  mode: 'create' | 'edit'
  onSubmit: (input: ProjectInput) => void
  onCancel: () => void
}

/**
 * Shared create/edit project form. Owns all fields, slug auto-generation and
 * the Save-draft / Publish / Cancel actions; the parent only runs the mutation.
 */
export function ProjectForm({
  defaultValues,
  categories,
  isSubmitting,
  mode,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
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

  const completionDate = form.watch('completionDate')

  // Lets an admin add a project category without leaving the project form.
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)

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
                <FormLabel>
                  Title <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input placeholder='Project title' {...field} />
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
            name='shortDescription'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder='Short summary shown in project listings'
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
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder='Describe the project…'
                  />
                </FormControl>
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
                <FormDescription>
                  Additional project photos. Hover a thumbnail to remove it.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='client'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Client or organisation'
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
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='City, Country'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='projectUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://example.com/case-study'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>
                  Optional link to a live site or case study.
                </FormDescription>
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
              name='featured'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between'>
                  <div>
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>Highlight this project.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='sortOrder'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort order</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      inputMode='numeric'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Lower numbers appear first on the website.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='completionDate'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Completion date</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={
                        completionDate ? new Date(completionDate) : undefined
                      }
                      onSelect={(date) =>
                        field.onChange(date ? date.toISOString() : '')
                      }
                      placeholder='Pick a date'
                    />
                  </FormControl>
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
                <FormLabel>
                  Category <RequiredMark />
                </FormLabel>
                <div className='flex items-center gap-2'>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className='flex-1'>
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
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    title='New project category'
                    onClick={() => setCategoryDialogOpen(true)}
                  >
                    <Plus className='size-4' />
                  </Button>
                </div>
                <FormDescription>
                  {categories.length === 0
                    ? 'No project categories yet. Add the first one with +.'
                    : 'Project categories only — separate from blog categories.'}
                </FormDescription>
                <FormMessage />

                <ProjectCategoryDialog
                  open={categoryDialogOpen}
                  onOpenChange={setCategoryDialogOpen}
                  onCreated={(category) => field.onChange(category._id)}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='technologies'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technologies</FormLabel>
                <FormControl>
                  <Input
                    placeholder='SNMP, NetFlow, Grafana'
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
                  <ProjectImageUpload
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
