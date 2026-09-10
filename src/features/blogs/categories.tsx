import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { type BlogCategory, type ListQuery } from '@/types/api'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  useBlogCategories,
  useDeleteBlogCategory,
} from '@/hooks/use-blog-categories'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { BlogCategoryDialog } from '@/components/dashboard/blogs/blog-category-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ListPagination } from '@/components/list-pagination'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { SearchInput } from '@/components/search-input'
import { ThemeSwitch } from '@/components/theme-switch'
import { DataError, DataLoading, EmptyRow } from '@/features/shared/data-states'

const PAGE_SIZE = 10

/**
 * Blog category management, scoped to the Blogs section. These categories live
 * in their own collection and are never shared with project categories.
 */
export function BlogCategories() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const params: ListQuery = {
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
  }

  const { data, isLoading, isError, refetch } = useBlogCategories(params)
  const deleteMutation = useDeleteBlogCategory()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BlogCategory | null>(null)
  const [deleting, setDeleting] = useState<BlogCategory | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (category: BlogCategory) => {
    setEditing(category)
    setDialogOpen(true)
  }

  const categories = data?.items ?? []

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
        <div className='mb-4 flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <Button variant='ghost' size='icon' asChild title='Back to blogs'>
              <Link to='/blogs'>
                <ArrowLeft className='size-4' />
              </Link>
            </Button>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                Blog Categories
              </h1>
              <p className='text-muted-foreground'>
                Used by blog posts only — separate from product and project
                categories.
              </p>
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus /> Add Category
          </Button>
        </div>

        <div className='mb-4'>
          <SearchInput
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder='Search blog categories…'
          />
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-center'>Blogs</TableHead>
                <TableHead className='w-24 text-end'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <DataLoading colSpan={5} />
              ) : isError ? (
                <DataError colSpan={5} onRetry={() => refetch()} />
              ) : categories.length === 0 ? (
                <EmptyRow colSpan={5} label='No blog categories yet.' />
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className='font-medium'>
                      {category.name}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {category.slug}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          category.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {category.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-center'>
                      <Badge variant='outline'>{category.blogCount ?? 0}</Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      <div className='flex justify-end gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => openEdit(category)}
                        >
                          <Pencil className='size-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setDeleting(category)}
                        >
                          <Trash2 className='size-4 text-destructive' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ListPagination meta={data?.meta} page={page} onPageChange={setPage} />
      </Main>

      <BlogCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete "${deleting?.name}"?`}
        desc='This action cannot be undone. Categories in use by a blog post cannot be deleted.'
        destructive
        confirmText='Delete'
        isLoading={deleteMutation.isPending}
        handleConfirm={() => {
          if (!deleting) return
          deleteMutation.mutate(deleting._id, {
            onSuccess: () => setDeleting(null),
          })
        }}
      />
    </>
  )
}
