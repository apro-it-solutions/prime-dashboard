import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { FolderTree, Plus } from 'lucide-react'
import { type Blog, type ListQuery } from '@/types/api'
import { useBlogs, useDeleteBlog } from '@/hooks/use-blogs'
import { useBlogCategories } from '@/hooks/use-blog-categories'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  BlogFilters,
  CATEGORY_ALL,
  STATUS_ALL,
  type BlogSort,
} from '@/components/dashboard/blogs/blog-filters'
import { BlogPagination } from '@/components/dashboard/blogs/blog-pagination'
import { BlogSearch } from '@/components/dashboard/blogs/blog-search'
import { BlogStatusBadge } from '@/components/dashboard/blogs/blog-status-badge'
import { BlogTable } from '@/components/dashboard/blogs/blog-table'
import { DeleteBlogDialog } from '@/components/dashboard/blogs/delete-blog-dialog'
import { resolveImageUrl } from '@/lib/image-url'

const PAGE_SIZE = 10

const categoryName = (category: Blog['category']) =>
  category && typeof category === 'object' ? category.name : '—'

export function Blogs() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>(STATUS_ALL)
  const [category, setCategory] = useState<string>(CATEGORY_ALL)
  const [sort, setSort] = useState<BlogSort>('latest')

  const params: ListQuery = {
    page,
    limit: PAGE_SIZE,
    sort: sort === 'latest' ? '-createdAt' : 'createdAt',
    ...(search ? { search } : {}),
    ...(status !== STATUS_ALL ? { status } : {}),
    ...(category !== CATEGORY_ALL ? { category } : {}),
  }

  const { data, isLoading, isError, refetch } = useBlogs(params)
  const { data: categoriesData } = useBlogCategories({ limit: 100 })
  const deleteMutation = useDeleteBlog()

  const [viewing, setViewing] = useState<Blog | null>(null)
  const [deleting, setDeleting] = useState<Blog | null>(null)

  const blogs = data?.items ?? []
  const categories = categoriesData?.items ?? []

  const resetPage = () => setPage(1)

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
            <h1 className='text-2xl font-bold tracking-tight'>Blogs</h1>
            <p className='text-muted-foreground'>Manage your blog posts.</p>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' asChild>
              <Link to='/blogs/categories'>
                <FolderTree /> Categories
              </Link>
            </Button>
            <Button asChild>
              <Link to='/blogs/create'>
                <Plus /> Add Blog
              </Link>
            </Button>
          </div>
        </div>

        <div className='mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between'>
          <BlogSearch
            onChange={(value) => {
              setSearch(value)
              resetPage()
            }}
          />
          <BlogFilters
            categories={categories}
            status={status}
            category={category}
            sort={sort}
            onStatusChange={(value) => {
              setStatus(value)
              resetPage()
            }}
            onCategoryChange={(value) => {
              setCategory(value)
              resetPage()
            }}
            onSortChange={(value) => {
              setSort(value)
              resetPage()
            }}
          />
        </div>

        <BlogTable
          blogs={blogs}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          onView={setViewing}
          onEdit={(blog) =>
            navigate({ to: '/blogs/$id/edit', params: { id: blog._id } })
          }
          onDelete={setDeleting}
        />

        <BlogPagination meta={data?.meta} page={page} onPageChange={setPage} />
      </Main>

      {/* Read-only preview */}
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
            <DialogDescription>
              {viewing ? categoryName(viewing.category) : ''}
              {viewing?.publishDate
                ? ` · ${format(new Date(viewing.publishDate), 'PP')}`
                : ''}
              {viewing ? ` · ${viewing.readingTime} min read` : ''}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className='space-y-4'>
              {viewing.featuredImage && (
                <img
                  src={resolveImageUrl(viewing.featuredImage)}
                  alt={viewing.title}
                  className='h-48 w-full rounded-md border object-cover'
                />
              )}
              <div className='flex flex-wrap gap-2'>
                <BlogStatusBadge status={viewing.status} />
                {(viewing.tags ?? []).map((tag) => (
                  <Badge key={tag} variant='outline'>
                    {tag}
                  </Badge>
                ))}
              </div>
              {viewing.excerpt && (
                <p className='text-sm text-muted-foreground'>{viewing.excerpt}</p>
              )}
              <div
                className='prose prose-sm dark:prose-invert max-w-none'
                dangerouslySetInnerHTML={{ __html: viewing.content }}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setViewing(null)}>
              Close
            </Button>
            {viewing && (
              <Button
                onClick={() =>
                  navigate({
                    to: '/blogs/$id/edit',
                    params: { id: viewing._id },
                  })
                }
              >
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteBlogDialog
        blog={deleting}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={(blog) =>
          deleteMutation.mutate(blog._id, {
            onSuccess: () => setDeleting(null),
          })
        }
      />
    </>
  )
}
