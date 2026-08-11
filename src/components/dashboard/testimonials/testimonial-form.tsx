import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { type TestimonialInput } from '@/types/api'
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
import { TestimonialImageUpload } from './testimonial-image-upload'
import { TestimonialRating } from './testimonial-rating'
import {
  formToInput,
  RATING_OPTIONS,
  testimonialFormSchema,
  type TestimonialFormValues,
} from './testimonial-form-schema'

type TestimonialFormProps = {
  defaultValues: TestimonialFormValues
  isSubmitting: boolean
  mode: 'create' | 'edit'
  onSubmit: (input: TestimonialInput) => void
  onCancel: () => void
}

/**
 * Shared create/edit testimonial form. Owns all fields and the Save / Cancel
 * actions; the parent only runs the mutation.
 */
export function TestimonialForm({
  defaultValues,
  isSubmitting,
  mode,
  onSubmit,
  onCancel,
}: TestimonialFormProps) {
  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues,
  })

  const rating = form.watch('rating')

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(formToInput(values)))}
        className='grid grid-cols-1 gap-6 lg:grid-cols-3'
      >
        {/* Main column */}
        <div className='space-y-6 lg:col-span-2'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Customer name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='designation'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input placeholder='e.g. Head of Operations' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='company'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Company name'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>Optional.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='review'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review</FormLabel>
                <FormControl>
                  <Textarea
                    rows={8}
                    placeholder='Full review text'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length ?? 0}/5000 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Sidebar column */}
        <div className='space-y-6'>
          <div className='space-y-4 rounded-lg border p-4'>
            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between'>
                  <div>
                    <FormLabel>Active</FormLabel>
                    <FormDescription>Show on the public site.</FormDescription>
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
              name='rating'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[...RATING_OPTIONS]
                        .reverse()
                        .map((option) => (
                          <SelectItem key={option} value={option}>
                            {option} {Number(option) === 1 ? 'star' : 'stars'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <TestimonialRating value={Number(rating)} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='avatar'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar</FormLabel>
                <FormControl>
                  <TestimonialImageUpload
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
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className='animate-spin' />
            ) : (
              <Save className='size-4' />
            )}
            {mode === 'edit' ? 'Update testimonial' : 'Create testimonial'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
