import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type PageSeoKey } from '@/types/api'
import { Loader2 } from 'lucide-react'
import { emptySeoForm, fromSeoForm, seoFormSchema, toSeoForm } from '@/lib/seo'
import { usePageSeo, useUpdatePageSeo } from '@/hooks/use-page-seo'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { SeoFields } from '@/components/seo-fields'
import { ThemeSwitch } from '@/components/theme-switch'
import { PAGE_SEO_META } from './pages'

const pageSchema = z.object({ seo: seoFormSchema })

type PageForm = z.infer<typeof pageSchema>

const emptyPageForm: PageForm = { seo: emptySeoForm }

type PageSeoCmsProps = {
  page: PageSeoKey
}

/**
 * A Content (CMS) page whose only section is SEO, backed by /page-seo/:page.
 *
 * Shared by Services, Projects, Blogs, Testimonials and Contact so there is a
 * single SEO implementation rather than one per page. Laid out to match the
 * Home and About CMS screens: the tab strip is here from the start, so adding
 * content sections later means adding tabs beside SEO, not restructuring.
 */
export function PageSeoCms({ page }: PageSeoCmsProps) {
  const meta = PAGE_SEO_META[page]
  const { data, isLoading, isError, refetch } = usePageSeo(page)
  const updateMutation = useUpdatePageSeo(page)

  const form = useForm<PageForm>({
    resolver: zodResolver(pageSchema),
    defaultValues: emptyPageForm,
  })

  useEffect(() => {
    if (!data) return
    form.reset({ seo: toSeoForm(data.seo) })
  }, [data, form])

  const onSubmit = (values: PageForm) => {
    updateMutation.mutate(fromSeoForm(values.seo))
  }

  if (isLoading) {
    return (
      <>
        <PageHeader />
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
        <PageHeader />
        <Main>
          <div className='flex h-64 flex-col items-center justify-center gap-4'>
            <p className='text-muted-foreground'>
              Failed to load the {meta.title.toLowerCase()} page.
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
      <PageHeader />

      <Main>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>
                  {meta.title}
                </h1>
                <p className='text-muted-foreground'>{meta.description}</p>
              </div>
              <Button type='submit' disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className='animate-spin' />
                )}
                Save changes
              </Button>
            </div>

            <Tabs defaultValue='seo' className='space-y-4'>
              <TabsList className='flex flex-wrap'>
                <TabsTrigger value='seo'>SEO</TabsTrigger>
              </TabsList>

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

function PageHeader() {
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
