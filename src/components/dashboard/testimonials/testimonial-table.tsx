import { format } from 'date-fns'
import { Eye, Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
import { type Testimonial } from '@/types/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { TestimonialRating } from './testimonial-rating'
import { TestimonialStatusBadge } from './testimonial-status-badge'

const COL_SPAN = 8

const fmtDate = (value?: string): string =>
  value ? format(new Date(value), 'PP') : '—'

/** "Aisha Rahman" -> "AR" */
const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'

type TestimonialTableProps = {
  testimonials: Testimonial[]
  isLoading: boolean
  isError: boolean
  togglingId?: string
  onRetry: () => void
  onView: (testimonial: Testimonial) => void
  onEdit: (testimonial: Testimonial) => void
  onToggleStatus: (testimonial: Testimonial) => void
  onDelete: (testimonial: Testimonial) => void
}

/**
 * Responsive table listing testimonials with per-row view/edit/activate/delete
 * actions.
 */
export function TestimonialTable({
  testimonials,
  isLoading,
  isError,
  togglingId,
  onRetry,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: TestimonialTableProps) {
  return (
    <div className='overflow-x-auto rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-16'>Avatar</TableHead>
            <TableHead className='min-w-40'>Name</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className='w-40 text-end'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <DataLoading colSpan={COL_SPAN} />
          ) : isError ? (
            <DataError colSpan={COL_SPAN} onRetry={onRetry} />
          ) : testimonials.length === 0 ? (
            <EmptyRow colSpan={COL_SPAN} label='No testimonials found.' />
          ) : (
            testimonials.map((testimonial) => (
              <TableRow key={testimonial._id}>
                <TableCell>
                  <Avatar className='size-10'>
                    <AvatarImage
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className='object-cover'
                    />
                    <AvatarFallback className='text-xs'>
                      {initials(testimonial.name)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className='font-medium'>
                  <span className='line-clamp-1'>{testimonial.name}</span>
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  <span className='line-clamp-1'>{testimonial.designation}</span>
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {testimonial.company || '—'}
                </TableCell>
                <TableCell>
                  <TestimonialRating value={testimonial.rating} />
                </TableCell>
                <TableCell>
                  <TestimonialStatusBadge isActive={testimonial.isActive} />
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {fmtDate(testimonial.createdAt)}
                </TableCell>
                <TableCell className='text-end'>
                  <div className='flex justify-end gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='View'
                      onClick={() => onView(testimonial)}
                    >
                      <Eye className='size-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      title={testimonial.isActive ? 'Deactivate' : 'Activate'}
                      disabled={togglingId === testimonial._id}
                      onClick={() => onToggleStatus(testimonial)}
                    >
                      {testimonial.isActive ? (
                        <PowerOff className='size-4' />
                      ) : (
                        <Power className='size-4 text-emerald-600' />
                      )}
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='Edit'
                      onClick={() => onEdit(testimonial)}
                    >
                      <Pencil className='size-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='Delete'
                      onClick={() => onDelete(testimonial)}
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
