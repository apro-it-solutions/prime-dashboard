import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { fromSeoForm, seoFormSchema, toSeoForm, emptySeoForm } from '@/lib/seo'
import { useSettings, useUpdateSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/image-upload'
import { SeoFields } from '@/components/seo-fields'

const companySchema = z.object({
  companyName: z.string().optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Enter a valid email').or(z.literal('')).optional(),
  footerText: z.string().optional(),
  socialLinks: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
  }),
  seoDefaults: seoFormSchema,
})

type CompanyFormValues = z.infer<typeof companySchema>

const emptyCompany: CompanyFormValues = {
  companyName: '',
  logo: '',
  favicon: '',
  address: '',
  phone: '',
  email: '',
  footerText: '',
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
  },
  seoDefaults: emptySeoForm,
}

const SOCIAL_FIELDS = [
  { name: 'facebook', label: 'Facebook' },
  { name: 'twitter', label: 'Twitter / X' },
  { name: 'instagram', label: 'Instagram' },
  { name: 'linkedin', label: 'LinkedIn' },
  { name: 'youtube', label: 'YouTube' },
] as const

export function CompanyForm() {
  const { data, isLoading, isError, refetch } = useSettings()
  const updateMutation = useUpdateSettings()

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: emptyCompany,
  })

  useEffect(() => {
    if (!data) return
    form.reset({
      companyName: data.companyName ?? '',
      logo: data.logo ?? '',
      favicon: data.favicon ?? '',
      address: data.address ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      footerText: data.footerText ?? '',
      socialLinks: {
        facebook: data.socialLinks?.facebook ?? '',
        twitter: data.socialLinks?.twitter ?? '',
        instagram: data.socialLinks?.instagram ?? '',
        linkedin: data.socialLinks?.linkedin ?? '',
        youtube: data.socialLinks?.youtube ?? '',
      },
      seoDefaults: toSeoForm(data.seoDefaults),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const onSubmit = (values: CompanyFormValues) => {
    updateMutation.mutate({
      companyName: values.companyName,
      logo: values.logo,
      favicon: values.favicon,
      address: values.address,
      phone: values.phone,
      email: values.email,
      footerText: values.footerText,
      socialLinks: values.socialLinks,
      seoDefaults: fromSeoForm(values.seoDefaults),
    })
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-40 w-full' />
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex flex-col items-start gap-2'>
        <p className='text-sm text-muted-foreground'>Failed to load settings.</p>
        <Button variant='outline' size='sm' onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='companyName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company name</FormLabel>
              <FormControl>
                <Input placeholder='Prime NMS' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid gap-6 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='logo'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <ImageUpload value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='favicon'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Favicon</FormLabel>
                <FormControl>
                  <ImageUpload value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='hello@primenms.com'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder='+1 555 000 0000' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder='Street, City, Country' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-4 rounded-lg border p-4'>
          <div>
            <h4 className='text-sm font-medium'>Social links</h4>
            <p className='text-xs text-muted-foreground'>
              Links shown in the site footer.
            </p>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            {SOCIAL_FIELDS.map((social) => (
              <FormField
                key={social.name}
                control={form.control}
                name={`socialLinks.${social.name}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{social.label}</FormLabel>
                    <FormControl>
                      <Input placeholder='https://…' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name='footerText'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Footer text</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder='© Prime NMS. All rights reserved.'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SeoFields namePrefix='seoDefaults' />

        <Button type='submit' disabled={updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className='animate-spin' />}
          Save changes
        </Button>
      </form>
    </Form>
  )
}
