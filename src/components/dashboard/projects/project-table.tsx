import { format } from 'date-fns'
import { type Project } from '@/types/api'
import { Eye, ImageOff, Pencil, Star, Trash2 } from 'lucide-react'
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
import { ProjectStatusBadge } from './project-status-badge'

const COL_SPAN = 9

const categoryName = (category: Project['category']): string =>
  category && typeof category === 'object' ? category.name : '—'
const fmtDate = (value?: string): string =>
  value ? format(new Date(value), 'PP') : '—'

type ProjectTableProps = {
  projects: Project[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

/** Responsive table listing projects with per-row view/edit/delete actions. */
export function ProjectTable({
  projects,
  isLoading,
  isError,
  onRetry,
  onView,
  onEdit,
  onDelete,
}: ProjectTableProps) {
  return (
    <div className='overflow-x-auto rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-16'>Image</TableHead>
            <TableHead className='min-w-48'>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className='w-32 text-end'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <DataLoading colSpan={COL_SPAN} />
          ) : isError ? (
            <DataError colSpan={COL_SPAN} onRetry={onRetry} />
          ) : projects.length === 0 ? (
            <EmptyRow colSpan={COL_SPAN} label='No projects found.' />
          ) : (
            projects.map((project) => (
              <TableRow key={project._id}>
                <TableCell>
                  {project.featuredImage ? (
                    <img
                      src={resolveImageUrl(project.featuredImage)}
                      alt={project.title}
                      className='size-10 rounded object-cover'
                    />
                  ) : (
                    <div className='flex size-10 items-center justify-center rounded border border-dashed text-muted-foreground'>
                      <ImageOff className='size-4' />
                    </div>
                  )}
                </TableCell>
                <TableCell className='font-medium'>
                  <span className='line-clamp-1'>{project.title}</span>
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {categoryName(project.category)}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {project.client || '—'}
                </TableCell>
                <TableCell>
                  <ProjectStatusBadge status={project.status} />
                </TableCell>
                <TableCell>
                  {project.featured ? (
                    <Star
                      className='size-4 fill-amber-400 text-amber-400'
                      aria-label='Featured'
                    />
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </TableCell>
                <TableCell className='text-muted-foreground tabular-nums'>
                  {project.sortOrder ?? 0}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {fmtDate(project.createdAt)}
                </TableCell>
                <TableCell className='text-end'>
                  <div className='flex justify-end gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='View'
                      onClick={() => onView(project)}
                    >
                      <Eye className='size-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='Edit'
                      onClick={() => onEdit(project)}
                    >
                      <Pencil className='size-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='Delete'
                      onClick={() => onDelete(project)}
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
