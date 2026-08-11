import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useCreateBlog } from '@/hooks/use-blogs'
import { useCategories } from '@/hooks/use-categories'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { BlogForm } from '@/components/dashboard/blogs/blog-form'
import { emptyBlogForm } from '@/components/dashboard/blogs/blog-form-schema'

export function BlogCreate() {
  const navigate = useNavigate()
  const createMutation = useCreateBlog()
  const { data: categoriesData } = useCategories({ limit: 100 })
  const categories = categoriesData?.items ?? []

  const goBack = () => navigate({ to: '/blogs' })

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
        <div className='mb-6 flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={goBack} title='Back'>
            <ArrowLeft className='size-4' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>New Blog Post</h1>
            <p className='text-muted-foreground'>
              Create and publish a new blog post.
            </p>
          </div>
        </div>

        <BlogForm
          mode='create'
          defaultValues={emptyBlogForm}
          categories={categories}
          isSubmitting={createMutation.isPending}
          onCancel={goBack}
          onSubmit={(input) =>
            createMutation.mutate(input, { onSuccess: goBack })
          }
        />
      </Main>
    </>
  )
}
