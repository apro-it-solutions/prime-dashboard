import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'

/** A full-width table row shown while a list query is loading. */
export function DataLoading({ colSpan }: { colSpan: number }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className='h-32 text-center'>
        <div className='flex items-center justify-center gap-2 text-muted-foreground'>
          <Loader2 className='size-4 animate-spin' />
          Loading…
        </div>
      </TableCell>
    </TableRow>
  )
}

/** A full-width table row shown when a list query fails. */
export function DataError({
  colSpan,
  onRetry,
}: {
  colSpan: number
  onRetry?: () => void
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className='h-32 text-center'>
        <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
          <span>Failed to load data.</span>
          {onRetry && (
            <Button variant='outline' size='sm' onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

/** A full-width table row shown when there are no records. */
export function EmptyRow({
  colSpan,
  label = 'No records found.',
}: {
  colSpan: number
  label?: string
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className='h-32 text-center text-muted-foreground'
      >
        {label}
      </TableCell>
    </TableRow>
  )
}
