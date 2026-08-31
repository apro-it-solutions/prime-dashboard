import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type BlogCategory } from '@/types/api'
import { Loader2 } from 'lucide-react'
import {
  useCreateBlogCategory,
  useUpdateBlogCategory,
} from '@/hooks/use-blog-categories'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
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
import { Textarea } from '@/components/ui/textarea'

const blogCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive']),
})

type BlogCategoryFormValues = z.infer<typeof blogCategorySchema>

const EMPTY: BlogCategoryFormValues = {
  name: '',
  description: '',
  status: 'active',
}

type BlogCategoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Category being edited; omit or pass null to create a new one. */
  editing?: BlogCategory | null
  /** Called with the newly created category — used to auto-select it in the blog form. */
  onCreated?: (category: BlogCategory) => void
}

/**
 * Create/edit dialog for a Blogs-only category. Shared by the blog category
 * management page and the inline "New" button on the blog form, so an admin
 * never has to leave the Blogs section to add one.
 */
export function BlogCategoryDialog({
  open,
  onOpenChange,
  editing,
  onCreated,
}: BlogCategoryDialogProps) {
  const createMutation = useCreateBlogCategory()
  const updateMutation = useUpdateBlogCategory()

  const form = useForm<BlogCategoryFormValues>({
    resolver: zodResolver(blogCategorySchema),
    defaultValues: EMPTY,
  })

  // Reload the form each time the dialog opens so a previous edit never leaks
  // into the next one.
  useEffect(() => {
    if (!open) return
    form.reset(
      editing
        ? {
            name: editing.name,
            description: editing.description ?? '',
            status: editing.status,
          }
        : EMPTY
    )
  }, [open, editing, form])

  const onSubmit = (values: BlogCategoryFormValues) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing._id, input: values },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createMutation.mutate(values, {
        onSuccess: (category) => {
          onCreated?.(category)
          onOpenChange(false)
        },
      })
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit' : 'Add'} Blog Category</DialogTitle>
          <DialogDescription>
            Blog categories are separate from the product categories managed
            under Categories and from project categories.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='blog-category-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Industry News' {...field} />
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
                    <Textarea
                      placeholder='Optional description'
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
                      <SelectItem value='active'>Active</SelectItem>
                      <SelectItem value='inactive'>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            variant='outline'
            type='button'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type='submit' form='blog-category-form' disabled={isSaving}>
            {isSaving && <Loader2 className='animate-spin' />}
            {editing ? 'Save changes' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
