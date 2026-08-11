import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type PaginationMeta } from '@/types/api'
import { Button } from '@/components/ui/button'

type ListPaginationProps = {
  meta?: PaginationMeta
  page: number
  onPageChange: (page: number) => void
}

/** Compact prev/next pagination bar driven by the backend pagination meta. */
export function ListPagination({ meta, page, onPageChange }: ListPaginationProps) {
  if (!meta || meta.total === 0) return null

  const from = (meta.page - 1) * meta.limit + 1
  const to = Math.min(meta.page * meta.limit, meta.total)

  return (
    <div className='flex items-center justify-between px-1 py-2 text-sm'>
      <p className='text-muted-foreground'>
        Showing <span className='font-medium'>{from}</span>–
        <span className='font-medium'>{to}</span> of{' '}
        <span className='font-medium'>{meta.total}</span>
      </p>
      <div className='flex items-center gap-2'>
        <span className='text-muted-foreground'>
          Page {meta.page} of {Math.max(meta.totalPages, 1)}
        </span>
        <Button
          variant='outline'
          size='icon'
          className='size-8'
          disabled={!meta.hasPrevPage}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className='size-4' />
        </Button>
        <Button
          variant='outline'
          size='icon'
          className='size-8'
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className='size-4' />
        </Button>
      </div>
    </div>
  )
}
