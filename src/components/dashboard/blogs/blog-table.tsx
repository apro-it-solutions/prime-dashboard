import { format } from 'date-fns'
import { Eye, ImageOff, Pencil, Star, Trash2 } from 'lucide-react'
import { type Blog } from '@/types/api'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataError, DataLoading, EmptyRow } from '@/features/shared/data-states'
import { resolveImageUrl } from '@/lib/image-url'
import { BlogStatusBadge } from './blog-status-badge'

const COL_SPAN = 8

/** Custom CMS byline when set, otherwise the account that created the post. */
const authorName = (blog: Blog): string => {
  const custom = blog.authorName?.trim()
  if (custom) return custom
  const author = blog.author
  return author && typeof author === 'object' ? author.name : '—'
}
const categoryName = (category: Blog['category']): string =>
  category && typeof category === 'object' ? category.name : '—'
const fmtDate = (value?: string): string =>
  value ? format(new Date(value), 'PP') : '—'

type BlogTableProps = {
  blogs: Blog[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onView: (blog: Blog) => void
  onEdit: (blog: Blog) => void
  onDelete: (blog: Blog) => void
}

/** Responsive table listing blog posts with per-row view/edit/delete actions. */
export function BlogTable({
  blogs,
  isLoading,
  isError,
  onRetry,
  onView,
  onEdit,
  onDelete,
}: BlogTableProps) {
  return (
    <div className='overflow-x-auto rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-16'>Image</TableHead>
            <TableHead className='min-w-48'>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className='w-32 text-end'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <DataLoading colSpan={COL_SPAN} />
          ) : isError ? (
            <DataError colSpan={COL_SPAN} onRetry={onRetry} />
          ) : blogs.length === 0 ? (
            <EmptyRow colSpan={COL_SPAN} label='No blog posts found.' />
          ) : (
            blogs.map((blog) => (
              <TableRow key={blog._id}>
                <TableCell>
                  {blog.featuredImage ? (
                    <img
                      src={resolveImageUrl(blog.featuredImage)}
                      alt={blog.title}
                      className='size-10 rounded object-cover'
                    />
                  ) : (
                    <div className='flex size-10 items-center justify-center rounded border border-dashed text-muted-foreground'>
                      <ImageOff className='size-4' />
                    </div>
                  )}
                </TableCell>
                <TableCell className='font-medium'>
                  <div className='flex items-center gap-1.5'>
                    <span className='line-clamp-1'>{blog.title}</span>
                    {blog.isFeatured && (
                      <Star
                        className='size-3.5 shrink-0 fill-amber-400 text-amber-400'
                        aria-label='Featured'
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {categoryName(blog.category)}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {authorName(blog)}
                </TableCell>
                <TableCell>
                  <BlogStatusBadge status={blog.status} />
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {fmtDate(blog.publishDate)}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {fmtDate(blog.createdAt)}
                </TableCell>
                <TableCell className='text-end'>
                  <div className='flex justify-end gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='View'
                      onClick={() => onView(blog)}
                    >
                      <Eye className='size-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='Edit'
                      onClick={() => onEdit(blog)}
                    >
                      <Pencil className='size-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='Delete'
                      onClick={() => onDelete(blog)}
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
  )
}
