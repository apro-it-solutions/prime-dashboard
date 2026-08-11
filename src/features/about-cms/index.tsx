import { useEffect } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  emptySeoForm,
  fromSeoForm,
  seoFormSchema,
  toSeoForm,
} from '@/lib/seo'
import { useAbout, useUpdateAbout } from '@/hooks/use-about'
import { type AboutPageInput } from '@/types/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/image-upload'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { SeoFields } from '@/components/seo-fields'
import { ThemeSwitch } from '@/components/theme-switch'

const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  socials: z.object({
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
  }),
})

const timelineItemSchema = z.object({
  year: z.string().min(1, 'Year is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
})

const aboutSchema = z.object({
  banner: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    image: z.string().optional(),
  }),
  companyInfo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    foundedYear: z.number().optional(),
    image: z.string().optional(),
  }),
  vision: z.string().optional(),
  mission: z.string().optional(),
  team: z.array(teamMemberSchema),
  timeline: z.array(timelineItemSchema),
  seo: seoFormSchema,
})

type AboutForm = z.infer<typeof aboutSchema>

const emptyAboutForm: AboutForm = {
  banner: { title: '', subtitle: '', image: '' },
  companyInfo: {
    title: '',
    description: '',
    foundedYear: undefined,
    image: '',
  },
  vision: '',
  mission: '',
  team: [],
  timeline: [],
  seo: emptySeoForm,
}

const emptyTeamMember: AboutForm['team'][number] = {
  name: '',
  role: '',
  bio: '',
  avatar: '',
  socials: { linkedin: '', twitter: '', facebook: '' },
}

const emptyTimelineItem: AboutForm['timeline'][number] = {
  year: '',
  title: '',
  description: '',
}

export function AboutCms() {
  const { data, isLoading, isError, refetch } = useAbout()
  const updateMutation = useUpdateAbout()

  const form = useForm<AboutForm>({
    resolver: zodResolver(aboutSchema),
    defaultValues: emptyAboutForm,
  })

  const teamArray = useFieldArray({ control: form.control, name: 'team' })
  const timelineArray = useFieldArray({
    control: form.control,
    name: 'timeline',
  })

  useEffect(() => {
    if (!data) return
    form.reset({
      banner: {
        title: data.banner?.title ?? '',
        subtitle: data.banner?.subtitle ?? '',
        image: data.banner?.image ?? '',
      },
      companyInfo: {
        title: data.companyInfo?.title ?? '',
        description: data.companyInfo?.description ?? '',
        foundedYear: data.companyInfo?.foundedYear,
        image: data.companyInfo?.image ?? '',
      },
      vision: data.vision ?? '',
      mission: data.mission ?? '',
      team: (data.team ?? []).map((member) => ({
        name: member.name,
        role: member.role ?? '',
        bio: member.bio ?? '',
        avatar: member.avatar ?? '',
        socials: {
          linkedin: member.socials?.linkedin ?? '',
          twitter: member.socials?.twitter ?? '',
          facebook: member.socials?.facebook ?? '',
        },
      })),
      timeline: (data.timeline ?? []).map((item) => ({
        year: item.year,
        title: item.title,
        description: item.description ?? '',
      })),
      seo: toSeoForm(data.seo),
    })
  }, [data, form])

  const onSubmit = (values: AboutForm) => {
    const foundedYear =
      typeof values.companyInfo.foundedYear === 'number' &&
      !Number.isNaN(values.companyInfo.foundedYear)
        ? values.companyInfo.foundedYear
        : undefined

    const input: AboutPageInput = {
      banner: {
        title: values.banner.title?.trim() || undefined,
        subtitle: values.banner.subtitle?.trim() || undefined,
        image: values.banner.image?.trim() || undefined,
      },
      companyInfo: {
        title: values.companyInfo.title?.trim() || undefined,
        description: values.companyInfo.description?.trim() || undefined,
        foundedYear,
        image: values.companyInfo.image?.trim() || undefined,
      },
      vision: values.vision?.trim() || undefined,
      mission: values.mission?.trim() || undefined,
      team: values.team.map((member) => ({
        name: member.name.trim(),
        role: member.role?.trim() || undefined,
        bio: member.bio?.trim() || undefined,
        avatar: member.avatar?.trim() || undefined,
        socials: {
          linkedin: member.socials.linkedin?.trim() || undefined,
          twitter: member.socials.twitter?.trim() || undefined,
          facebook: member.socials.facebook?.trim() || undefined,
        },
      })),
      timeline: values.timeline.map((item) => ({
        year: item.year.trim(),
        title: item.title.trim(),
        description: item.description?.trim() || undefined,
      })),
      seo: fromSeoForm(values.seo),
    }

    updateMutation.mutate(input)
  }

  if (isLoading) {
    return (
      <>
        <AboutHeader />
        <Main>
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='size-8 animate-spin text-muted-foreground' />
          </div>
        </Main>
      </>
    )
  }

  if (isError) {
    return (
      <>
        <AboutHeader />
        <Main>
          <div className='flex h-64 flex-col items-center justify-center gap-4'>
            <p className='text-muted-foreground'>
              Failed to load the about page.
            </p>
            <Button variant='outline' onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <AboutHeader />

      <Main>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>
                  About Page
                </h1>
                <p className='text-muted-foreground'>
                  Manage the content of your public about page.
                </p>
              </div>
              <Button type='submit' disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className='animate-spin' />
                )}
                Save changes
              </Button>
            </div>

            <Tabs defaultValue='banner' className='space-y-4'>
              <TabsList className='flex flex-wrap'>
                <TabsTrigger value='banner'>Banner</TabsTrigger>
                <TabsTrigger value='company'>Company</TabsTrigger>
                <TabsTrigger value='vision'>Vision &amp; Mission</TabsTrigger>
                <TabsTrigger value='team'>Team</TabsTrigger>
                <TabsTrigger value='timeline'>Timeline</TabsTrigger>
                <TabsTrigger value='seo'>SEO</TabsTrigger>
              </TabsList>

              <TabsContent value='banner'>
                <Card>
                  <CardHeader>
                    <CardTitle>Banner</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='banner.title'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Banner title'
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
                      name='banner.subtitle'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtitle</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Banner subtitle'
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
                      name='banner.image'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image</FormLabel>
                          <FormControl>
                            <ImageUpload
                              value={field.value ?? ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='company'>
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='companyInfo.title'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Company title'
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
                      name='companyInfo.description'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder='Describe the company'
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
                      name='companyInfo.foundedYear'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founded year</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              placeholder='e.g. 2015'
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const raw = e.target.value
                                field.onChange(
                                  raw === '' ? undefined : Number(raw)
                                )
                              }}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='companyInfo.image'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image</FormLabel>
                          <FormControl>
                            <ImageUpload
                              value={field.value ?? ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='vision'>
                <Card>
                  <CardHeader>
                    <CardTitle>Vision &amp; Mission</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='vision'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vision</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder='Our vision…'
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
                      name='mission'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mission</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder='Our mission…'
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='team'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between'>
                    <CardTitle>Team</CardTitle>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => teamArray.append(emptyTeamMember)}
                    >
                      <Plus className='size-4' /> Add member
                    </Button>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    {teamArray.fields.length === 0 ? (
                      <p className='text-sm text-muted-foreground'>
                        No team members yet.
                      </p>
                    ) : (
                      teamArray.fields.map((row, index) => (
                        <div
                          key={row.id}
                          className='space-y-4 rounded-lg border p-4'
                        >
                          <div className='flex items-center justify-between'>
                            <h4 className='text-sm font-medium'>
                              Member {index + 1}
                            </h4>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => teamArray.remove(index)}
                            >
                              <Trash2 className='size-4 text-destructive' />
                            </Button>
                          </div>
                          <FormField
                            control={form.control}
                            name={`team.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='Full name'
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
                            name={`team.${index}.role`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='e.g. CEO'
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
                            name={`team.${index}.bio`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea
                                    rows={3}
                                    placeholder='Short bio'
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
                            name={`team.${index}.avatar`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Avatar</FormLabel>
                                <FormControl>
                                  <ImageUpload
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Separator />
                          <div className='grid gap-4 sm:grid-cols-3'>
                            <FormField
                              control={form.control}
                              name={`team.${index}.socials.linkedin`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>LinkedIn</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='https://…'
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
                              name={`team.${index}.socials.twitter`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Twitter</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='https://…'
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
                              name={`team.${index}.socials.facebook`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Facebook</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='https://…'
                                      {...field}
                                      value={field.value ?? ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='timeline'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between'>
                    <CardTitle>Timeline</CardTitle>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => timelineArray.append(emptyTimelineItem)}
                    >
                      <Plus className='size-4' /> Add entry
                    </Button>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    {timelineArray.fields.length === 0 ? (
                      <p className='text-sm text-muted-foreground'>
                        No timeline entries yet.
                      </p>
                    ) : (
                      timelineArray.fields.map((row, index) => (
                        <div
                          key={row.id}
                          className='space-y-4 rounded-lg border p-4'
                        >
                          <div className='flex items-center justify-between'>
                            <h4 className='text-sm font-medium'>
                              Entry {index + 1}
                            </h4>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => timelineArray.remove(index)}
                            >
                              <Trash2 className='size-4 text-destructive' />
                            </Button>
                          </div>
                          <div className='grid gap-4 sm:grid-cols-2'>
                            <FormField
                              control={form.control}
                              name={`timeline.${index}.year`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Year</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='e.g. 2020'
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
                              name={`timeline.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='Milestone title'
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
                            name={`timeline.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    rows={3}
                                    placeholder='What happened'
                                    {...field}
                                    value={field.value ?? ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='seo'>
                <SeoFields />
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </Main>
    </>
  )
}

function AboutHeader() {
  return (
    <Header>
      <Search />
      <div className='ms-auto flex items-center space-x-4'>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </div>
    </Header>
  )
}
