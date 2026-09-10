import { format } from 'date-fns'
import { MailCheck, MailX, Trash2 } from 'lucide-react'
import { type Subscriber } from '@/types/api'
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
import { SubscriberStatusBadge } from './subscriber-status-badge'

const COL_SPAN = 4

/** A subscriber is mailable while their status is 'subscribed'. */
const isSubscribed = (subscriber: Subscriber): boolean =>
  subscriber.status === 'subscribed'

const fmtDate = (value?: string): string =>
  value ? format(new Date(value), 'PP') : '—'

type SubscriberTableProps = {
  subscribers: Subscriber[]
  isLoading: boolean
  isError: boolean
  togglingId?: string
  onRetry: () => void
  onToggleStatus: (subscriber: Subscriber) => void
  onDelete: (subscriber: Subscriber) => void
}

/**
 * Responsive table listing newsletter subscribers with per-row
 * subscribe/unsubscribe and delete actions.
 */
export function SubscriberTable({
  subscribers,
  isLoading,
  isError,
  togglingId,
  onRetry,
  onToggleStatus,
  onDelete,
}: SubscriberTableProps) {
  return (
    <div className='overflow-x-auto rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='min-w-56'>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Subscribed Date</TableHead>
            <TableHead className='w-32 text-end'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <DataLoading colSpan={COL_SPAN} />
          ) : isError ? (
            <DataError colSpan={COL_SPAN} onRetry={onRetry} />
          ) : subscribers.length === 0 ? (
            <EmptyRow colSpan={COL_SPAN} label='No subscribers found.' />
          ) : (
            subscribers.map((subscriber) => (
              <TableRow key={subscriber._id}>
                <TableCell className='font-medium'>
                  <span className='line-clamp-1'>{subscriber.email}</span>
                </TableCell>
                <TableCell>
                  <SubscriberStatusBadge status={subscriber.status} />
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {fmtDate(subscriber.createdAt)}
                </TableCell>
                <TableCell className='text-end'>
                  <div className='flex justify-end gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      title={
                        isSubscribed(subscriber) ? 'Unsubscribe' : 'Resubscribe'
                      }
                      disabled={togglingId === subscriber._id}
                      onClick={() => onToggleStatus(subscriber)}
                    >
                      {isSubscribed(subscriber) ? (
                        <MailX className='size-4' />
                      ) : (
                        <MailCheck className='size-4 text-emerald-600' />
                      )}
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='Delete'
                      onClick={() => onDelete(subscriber)}
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
