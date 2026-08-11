import { useEffect } from 'react'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown, Loader2, Plus, Trash2, X } from 'lucide-react'
import { useHome, useUpdateHome } from '@/hooks/use-home'
import { useProducts } from '@/hooks/use-products'
import { type HomePageInput } from '@/types/api'
import {
  emptySeoForm,
  fromSeoForm,
  seoFormSchema,
  toSeoForm,
} from '@/lib/seo'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { GalleryUpload } from '@/components/gallery-upload'
import { ImageUpload } from '@/components/image-upload'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { SeoFields } from '@/components/seo-fields'
import { ThemeSwitch } from '@/components/theme-switch'

const whyChooseUsSchema = z.object({
  icon: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
})

const homeSchema = z.object({
  hero: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    backgroundImage: z.string().optional(),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
  }),
  about: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
  featuredProducts: z.array(z.string()),
  whyChooseUs: z.array(whyChooseUsSchema),
  gallery: z.array(z.string()),
  seo: seoFormSchema,
})

type HomeFormValues = z.infer<typeof homeSchema>

/** featuredProducts may come back populated as objects from the GET endpoint. */
type FeaturedRef = string | { _id: string }

const emptyForm: HomeFormValues = {
  hero: {
    title: '',
    subtitle: '',
    description: '',
    backgroundImage: '',
    ctaText: '',
    ctaLink: '',
  },
  about: { title: '', description: '', image: '' },
  featuredProducts: [],
  whyChooseUs: [],
  gallery: [],
  seo: emptySeoForm,
}

export function HomeCms() {
  const { data, isLoading, isError, refetch } = useHome()
  const { data: productsData } = useProducts({ limit: 100 })
  const updateMutation = useUpdateHome()

  const products = productsData?.items ?? []

  const form = useForm<HomeFormValues>({
    resolver: zodResolver(homeSchema),
    defaultValues: emptyForm,
  })

  const whyChooseUs = useFieldArray({
    control: form.control,
    name: 'whyChooseUs',
  })

  useEffect(() => {
    if (!data) return
    const featuredIds = (
      (data.featuredProducts ?? []) as unknown as FeaturedRef[]
    ).map((p) => (typeof p === 'string' ? p : p._id))

    form.reset({
      hero: {
        title: data.hero?.title ?? '',
        subtitle: data.hero?.subtitle ?? '',
        description: data.hero?.description ?? '',
        backgroundImage: data.hero?.backgroundImage ?? '',
        ctaText: data.hero?.ctaText ?? '',
        ctaLink: data.hero?.ctaLink ?? '',
      },
      about: {
        title: data.about?.title ?? '',
        description: data.about?.description ?? '',
        image: data.about?.image ?? '',
      },
      featuredProducts: featuredIds,
      whyChooseUs: data.whyChooseUs ?? [],
      gallery: data.gallery ?? [],
      seo: toSeoForm(data.seo),
    })
  }, [data, form])

  const onSubmit = (values: HomeFormValues) => {
    const input: HomePageInput = {
      hero: values.hero,
      about: values.about,
      featuredProducts: values.featuredProducts,
      whyChooseUs: values.whyChooseUs,
      gallery: values.gallery,
      seo: fromSeoForm(values.seo),
    }
    updateMutation.mutate(input)
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Home Page</h1>
            <p className='text-muted-foreground'>
              Edit the content shown on your storefront home page.
            </p>
          </div>
          <Button
            type='submit'
            form='home-cms-form'
            disabled={updateMutation.isPending || isLoading}
          >
            {updateMutation.isPending && <Loader2 className='animate-spin' />}
            Save changes
          </Button>
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='size-6 animate-spin text-muted-foreground' />
          </div>
        ) : isError ? (
          <div className='flex h-64 flex-col items-center justify-center gap-3'>
            <p className='text-muted-foreground'>
              Failed to load the home page content.
            </p>
            <Button variant='outline' onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              id='home-cms-form'
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <Tabs defaultValue='hero' className='space-y-4'>
                <TabsList className='flex flex-wrap'>
                  <TabsTrigger value='hero'>Hero</TabsTrigger>
                  <TabsTrigger value='about'>About</TabsTrigger>
                  <TabsTrigger value='featured'>Featured</TabsTrigger>
                  <TabsTrigger value='why'>Why Choose Us</TabsTrigger>
                  <TabsTrigger value='gallery'>Gallery</TabsTrigger>
                  <TabsTrigger value='seo'>SEO</TabsTrigger>
                </TabsList>

                {/* Hero Banner */}
                <TabsContent value='hero'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Hero Banner</CardTitle>
                      <CardDescription>
                        The main banner at the top of the home page.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <FormField
                        control={form.control}
                        name='hero.title'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Welcome to our store'
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
                        name='hero.subtitle'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subtitle</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='A short tagline'
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
                        name='hero.description'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder='Describe your hero section'
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
                        name='hero.backgroundImage'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Background image</FormLabel>
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
                      <div className='grid gap-4 sm:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name='hero.ctaText'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CTA text</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Shop now'
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
                          name='hero.ctaLink'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CTA link</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='/products'
                                  {...field}
                                  value={field.value ?? ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* About Section */}
                <TabsContent value='about'>
                  <Card>
                    <CardHeader>
                      <CardTitle>About Section</CardTitle>
                      <CardDescription>
                        A short introduction shown on the home page.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <FormField
                        control={form.control}
                        name='about.title'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='About us'
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
                        name='about.description'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder='Tell your story'
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
                        name='about.image'
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

                {/* Featured Products */}
                <TabsContent value='featured'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Featured Products</CardTitle>
                      <CardDescription>
                        Choose which products are highlighted on the home page.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name='featuredProducts'
                        render={({ field }) => {
                          const selected = field.value ?? []
                          const toggle = (id: string) =>
                            field.onChange(
                              selected.includes(id)
                                ? selected.filter((v) => v !== id)
                                : [...selected, id]
                            )
                          const titleOf = (id: string) =>
                            products.find((p) => p._id === id)?.title ?? id

                          return (
                            <FormItem className='space-y-3'>
                              <FormLabel>Products</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      type='button'
                                      variant='outline'
                                      className='w-full justify-between font-normal'
                                    >
                                      {selected.length > 0
                                        ? `${selected.length} product${selected.length > 1 ? 's' : ''} selected`
                                        : 'Select products'}
                                      <ChevronsUpDown className='size-4 opacity-50' />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className='w-[--radix-popover-trigger-width] p-0'
                                  align='start'
                                >
                                  <Command>
                                    <CommandInput placeholder='Search products…' />
                                    <CommandList>
                                      <CommandEmpty>
                                        No products found.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {products.map((product) => {
                                          const isChecked = selected.includes(
                                            product._id
                                          )
                                          return (
                                            <CommandItem
                                              key={product._id}
                                              value={product.title}
                                              onSelect={() =>
                                                toggle(product._id)
                                              }
                                            >
                                              <Check
                                                className={cn(
                                                  'size-4',
                                                  isChecked
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                                )}
                                              />
                                              {product.title}
                                            </CommandItem>
                                          )
                                        })}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>

                              {selected.length > 0 && (
                                <div className='flex flex-wrap gap-2'>
                                  {selected.map((id) => (
                                    <Badge
                                      key={id}
                                      variant='secondary'
                                      className='gap-1'
                                    >
                                      {titleOf(id)}
                                      <button
                                        type='button'
                                        onClick={() => toggle(id)}
                                        className='ms-1 rounded-full outline-none hover:text-destructive'
                                      >
                                        <X className='size-3' />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Why Choose Us */}
                <TabsContent value='why'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Why Choose Us</CardTitle>
                      <CardDescription>
                        Reasons customers should pick you.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      {whyChooseUs.fields.length === 0 && (
                        <p className='text-sm text-muted-foreground'>
                          No items yet.
                        </p>
                      )}
                      {whyChooseUs.fields.map((item, index) => (
                        <div
                          key={item.id}
                          className='space-y-4 rounded-lg border p-4'
                        >
                          <div className='flex items-center justify-between'>
                            <h4 className='text-sm font-medium'>
                              Item {index + 1}
                            </h4>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => whyChooseUs.remove(index)}
                            >
                              <Trash2 className='size-4 text-destructive' />
                            </Button>
                          </div>
                          <div className='grid gap-4 sm:grid-cols-2'>
                            <FormField
                              control={form.control}
                              name={`whyChooseUs.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='Fast shipping'
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
                              name={`whyChooseUs.${index}.icon`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Icon (lucide name)</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='Truck'
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
                            name={`whyChooseUs.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    rows={2}
                                    placeholder='Explain this benefit'
                                    {...field}
                                    value={field.value ?? ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                      <Separator />
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() =>
                          whyChooseUs.append({
                            icon: '',
                            title: '',
                            description: '',
                          })
                        }
                      >
                        <Plus /> Add item
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Gallery */}
                <TabsContent value='gallery'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Gallery</CardTitle>
                      <CardDescription>
                        Images shown in the home page gallery.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name='gallery'
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <GalleryUpload
                                value={field.value ?? []}
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

                {/* SEO */}
                <TabsContent value='seo'>
                  <Card>
                    <CardHeader>
                      <CardTitle>SEO</CardTitle>
                      <CardDescription>
                        Search engine and social sharing metadata.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SeoFields />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        )}
      </Main>
    </>
  )
}
